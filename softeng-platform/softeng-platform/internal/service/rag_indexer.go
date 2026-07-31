package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"strings"

	"softeng-platform/internal/config"
	"softeng-platform/internal/repository"
)

// 单块上限：略大可减少 embedding 调用次数（仍远低于 Gemini 8k 截断）
const ragChunkMaxLen = 1200

const ragUpsertBatch = 32

type RagIndexer struct {
	db    *repository.Database
	agent *AgentHTTPClient
	cfg   *config.Config
}

func NewRagIndexer(db *repository.Database, cfg *config.Config) *RagIndexer {
	var agent *AgentHTTPClient
	if cfg != nil {
		agent = NewAgentHTTPClientFromConfig(cfg.AgentBaseURL, cfg.AgentInternalToken)
	}
	return &RagIndexer{db: db, agent: agent, cfg: cfg}
}

func (ix *RagIndexer) Configured() bool {
	return ix != nil && ix.agent != nil
}

func (ix *RagIndexer) AgentStatus(ctx context.Context) (map[string]any, error) {
	out := map[string]any{"agent_configured": ix.Configured()}
	if !ix.Configured() {
		return out, nil
	}
	if err := ix.agent.Health(ctx); err != nil {
		out["agent_healthy"] = false
		out["agent_error"] = err.Error()
		return out, nil
	}
	out["agent_healthy"] = true
	stats, err := ix.agent.Stats(ctx)
	if err != nil {
		out["stats_error"] = err.Error()
		return out, nil
	}
	out["chunk_count"] = stats.ChunkCount
	out["lexical_count"] = stats.LexicalCount
	if stats.Meta != nil {
		out["meta"] = stats.Meta
	}
	return out, nil
}

func (ix *RagIndexer) EnsureIndexedIfEmpty(ctx context.Context) error {
	if !ix.Configured() {
		return nil
	}
	if ix.cfg != nil && !ix.cfg.AgentAutoReindex {
		return nil
	}
	if err := ix.agent.Health(ctx); err != nil {
		return fmt.Errorf("agent not ready: %w", err)
	}
	stats, err := ix.agent.Stats(ctx)
	if err != nil {
		return err
	}
	if stats.ChunkCount >= 3 {
		log.Printf("[RAG] index has %d chunks, skip auto reindex", stats.ChunkCount)
		return nil
	}
	log.Printf("[RAG] index empty (%d chunks), auto reindex starting...", stats.ChunkCount)
	n, err := ix.ReindexAll(ctx, false)
	if err != nil {
		return err
	}
	log.Printf("[RAG] auto reindex done: %d chunks", n)
	return nil
}

// ReindexAll 全量同步索引。默认不清空，Agent 按 chunk_id + content_hash 复用已有向量，避免误点第二次重建浪费额度。
// clearFirst=true 时先清空 Chroma+倒排（换模型或索引严重脏数据时使用）。
func (ix *RagIndexer) ReindexAll(ctx context.Context, clearFirst bool) (int, error) {
	if !ix.Configured() {
		return 0, fmt.Errorf("AGENT_BASE_URL not configured")
	}
	if clearFirst {
		if err := ix.agent.ClearIndex(ctx); err != nil {
			return 0, fmt.Errorf("clear index: %w", err)
		}
	}
	chunks, err := ix.buildAllChunks(ctx)
	if err != nil {
		return 0, err
	}
	if len(chunks) == 0 {
		return 0, fmt.Errorf("no chunks to index")
	}
	return ix.upsertChunksBatched(ctx, chunks)
}

func (ix *RagIndexer) upsertChunksBatched(ctx context.Context, chunks []IndexChunk) (int, error) {
	total := 0
	for i := 0; i < len(chunks); i += ragUpsertBatch {
		end := i + ragUpsertBatch
		if end > len(chunks) {
			end = len(chunks)
		}
		resp, err := ix.agent.UpsertChunks(ctx, chunks[i:end])
		if err != nil {
			return total, err
		}
		total += resp.Upserted
	}
	return total, nil
}

// UpsertResource 写入单条资源（先删旧 chunk 再 upsert）
func (ix *RagIndexer) UpsertResource(ctx context.Context, resourceType, itemID string) error {
	if !ix.Configured() {
		return nil
	}
	docType, ok := normalizeRagDocType(resourceType)
	if !ok {
		return nil
	}
	if err := ix.agent.DeleteByDoc(ctx, docType, itemID); err != nil {
		log.Printf("[RAG] delete before upsert %s/%s: %v", docType, itemID, err)
	}
	chunks, err := ix.buildResourceChunks(ctx, resourceType, itemID)
	if err != nil || len(chunks) == 0 {
		return err
	}
	_, err = ix.agent.UpsertChunks(ctx, chunks)
	return err
}

// DeleteResource 从向量库移除单条资源
func (ix *RagIndexer) DeleteResource(ctx context.Context, resourceType, itemID string) error {
	if !ix.Configured() {
		return nil
	}
	docType, ok := normalizeRagDocType(resourceType)
	if !ok {
		return nil
	}
	return ix.agent.DeleteByDoc(ctx, docType, itemID)
}

// SyncResource 按 DB 状态同步（已发布则 upsert，否则删除）
func (ix *RagIndexer) SyncResource(ctx context.Context, resourceType, itemID string) error {
	if !ix.Configured() {
		return nil
	}
	ok, err := ix.isResourceIndexed(ctx, resourceType, itemID)
	if err != nil {
		return err
	}
	if ok {
		return ix.UpsertResource(ctx, resourceType, itemID)
	}
	return ix.DeleteResource(ctx, resourceType, itemID)
}

func normalizeRagDocType(resourceType string) (string, bool) {
	rt := strings.ToLower(strings.TrimSpace(resourceType))
	switch rt {
	case "tools", "tool", "工具":
		return "tool", true
	case "courses", "course", "课程":
		return "course", true
	case "projects", "project", "项目":
		return "project", true
	case "comment", "comments", "评论":
		return "comment", true
	case "course_resource", "course_resources", "课程资料":
		return "course_resource", true
	default:
		return "", false
	}
}

func (ix *RagIndexer) isResourceIndexed(ctx context.Context, resourceType, itemID string) (bool, error) {
	rt := strings.ToLower(strings.TrimSpace(resourceType))
	switch rt {
	case "tools", "tool", "工具":
		var n int
		err := ix.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM tools WHERE resource_id = ? AND status = 'approved'`, itemID).Scan(&n)
		return n > 0, err
	case "projects", "project", "项目":
		var n int
		err := ix.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM projects WHERE project_id = ? AND status = 'approved'`, itemID).Scan(&n)
		return n > 0, err
	case "courses", "course", "课程":
		var n int
		err := ix.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM courses WHERE course_id = ?`, itemID).Scan(&n)
		return n > 0, err
	default:
		return false, nil
	}
}

func (ix *RagIndexer) buildResourceChunks(ctx context.Context, resourceType, itemID string) ([]IndexChunk, error) {
	rt := strings.ToLower(strings.TrimSpace(resourceType))
	switch rt {
	case "tools", "tool", "工具":
		return ix.fetchToolChunks(ctx, itemID)
	case "courses", "course", "课程":
		return ix.fetchCourseChunks(ctx, itemID)
	case "projects", "project", "项目":
		return ix.fetchProjectChunks(ctx, itemID)
	default:
		return nil, nil
	}
}

func (ix *RagIndexer) buildAllChunks(ctx context.Context) ([]IndexChunk, error) {
	var out []IndexChunk

	rowsT, err := ix.db.QueryContext(ctx, `
		SELECT resource_id, resource_name, COALESCE(description,''), COALESCE(description_detail,''), COALESCE(category,'')
		FROM tools WHERE status = 'approved'`)
	if err == nil {
		defer rowsT.Close()
		for rowsT.Next() {
			var id int
			var name, d1, d2, cat string
			if rowsT.Scan(&id, &name, &d1, &d2, &cat) != nil {
				continue
			}
			out = append(out, ix.makeChunks("tool", id, name, joinParts(name, d1, d2, cat), map[string]any{
				"category": cat,
			})...)
		}
	}

	rowsC, err := ix.db.QueryContext(ctx, `
		SELECT course_id, name, COALESCE(description,''), COALESCE(semester,'')
		FROM courses`)
	if err == nil {
		defer rowsC.Close()
		for rowsC.Next() {
			var id int
			var name, desc, sem string
			if rowsC.Scan(&id, &name, &desc, &sem) != nil {
				continue
			}
			out = append(out, ix.makeChunks("course", id, name, joinParts(name, desc, sem), map[string]any{
				"semester": sem,
			})...)
		}
	}

	rowsP, err := ix.db.QueryContext(ctx, `
		SELECT project_id, name, COALESCE(description,''), COALESCE(LEFT(detail, 2000),'')
		FROM projects WHERE status = 'approved'`)
	if err == nil {
		defer rowsP.Close()
		for rowsP.Next() {
			var id int
			var name, d1, d2 string
			if rowsP.Scan(&id, &name, &d1, &d2) != nil {
				continue
			}
			out = append(out, ix.makeChunks("project", id, name, joinParts(name, d1, d2), nil)...)
		}
	}

	out, _ = ix.appendCommentsAndResources(ctx, out)
	return out, nil
}

func (ix *RagIndexer) fetchToolChunks(ctx context.Context, itemID string) ([]IndexChunk, error) {
	row := ix.db.QueryRowContext(ctx, `
		SELECT resource_id, resource_name, COALESCE(description,''), COALESCE(description_detail,''), COALESCE(category,'')
		FROM tools WHERE resource_id = ? AND status = 'approved'`, itemID)
	var id int
	var name, d1, d2, cat string
	if row.Scan(&id, &name, &d1, &d2, &cat) != nil {
		return nil, nil
	}
	return ix.makeChunks("tool", id, name, joinParts(name, d1, d2, cat), map[string]any{"category": cat}), nil
}

func (ix *RagIndexer) fetchCourseChunks(ctx context.Context, itemID string) ([]IndexChunk, error) {
	row := ix.db.QueryRowContext(ctx, `
		SELECT course_id, name, COALESCE(description,''), COALESCE(semester,'')
		FROM courses WHERE course_id = ?`, itemID)
	var id int
	var name, desc, sem string
	if row.Scan(&id, &name, &desc, &sem) != nil {
		return nil, nil
	}
	return ix.makeChunks("course", id, name, joinParts(name, desc, sem), map[string]any{"semester": sem}), nil
}

func (ix *RagIndexer) fetchProjectChunks(ctx context.Context, itemID string) ([]IndexChunk, error) {
	row := ix.db.QueryRowContext(ctx, `
		SELECT project_id, name, COALESCE(description,''), COALESCE(LEFT(detail, 2000),'')
		FROM projects WHERE project_id = ? AND status = 'approved'`, itemID)
	var id int
	var name, d1, d2 string
	if row.Scan(&id, &name, &d1, &d2) != nil {
		return nil, nil
	}
	return ix.makeChunks("project", id, name, joinParts(name, d1, d2), nil), nil
}

func (ix *RagIndexer) makeChunks(docType string, id int, title, fullText string, extra map[string]any) []IndexChunk {
	text := strings.TrimSpace(fullText)
	if text == "" {
		return nil
	}
	parts := splitRagText(text)
	var out []IndexChunk
	for i, part := range parts {
		meta := map[string]any{
			"doc_type": docType,
			"doc_id":   fmt.Sprintf("%d", id),
			"title":    title,
		}
		switch docType {
		case "tool":
			meta["url"] = fmt.Sprintf("/tools/detail/%d", id)
		case "course":
			meta["url"] = fmt.Sprintf("/course/detail/%d", id)
		case "project":
			meta["url"] = fmt.Sprintf("/projects/detail/%d", id)
		}
		for k, v := range extra {
			meta[k] = v
		}
		meta["content_hash"] = ragContentHash(part)
		out = append(out, IndexChunk{
			ID:       fmt.Sprintf("%s:%d:%d", docType, id, i),
			Text:     part,
			Metadata: meta,
		})
	}
	return out
}

func splitRagText(text string) []string {
	text = strings.TrimSpace(text)
	if text == "" {
		return nil
	}
	if len(text) <= ragChunkMaxLen {
		return []string{text}
	}
	paras := strings.Split(text, "\n")
	var chunks []string
	var cur strings.Builder
	for _, p := range paras {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		need := len(p)
		if cur.Len() > 0 {
			need++
		}
		if cur.Len()+need > ragChunkMaxLen && cur.Len() > 0 {
			chunks = append(chunks, strings.TrimSpace(cur.String()))
			cur.Reset()
		}
		if len(p) > ragChunkMaxLen {
			for len(p) > ragChunkMaxLen {
				chunks = append(chunks, p[:ragChunkMaxLen])
				p = p[ragChunkMaxLen:]
			}
			if strings.TrimSpace(p) != "" {
				cur.WriteString(p)
			}
			continue
		}
		if cur.Len() > 0 {
			cur.WriteByte('\n')
		}
		cur.WriteString(p)
	}
	if cur.Len() > 0 {
		chunks = append(chunks, strings.TrimSpace(cur.String()))
	}
	return chunks
}

func joinParts(parts ...string) string {
	var xs []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			xs = append(xs, p)
		}
	}
	return strings.Join(xs, "\n")
}

func ragContentHash(text string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(text)))
	return hex.EncodeToString(sum[:8])
}
