package service

import (
	"context"
	"fmt"
	"strings"
)

func (ix *RagIndexer) appendCommentsAndResources(ctx context.Context, out []IndexChunk) ([]IndexChunk, error) {
	comments, err := ix.fetchAllCommentChunks(ctx)
	if err == nil {
		out = append(out, comments...)
	}
	resources, err := ix.fetchAllCourseResourceChunks(ctx)
	if err == nil {
		out = append(out, resources...)
	}
	return out, nil
}

func (ix *RagIndexer) fetchAllCommentChunks(ctx context.Context) ([]IndexChunk, error) {
	rows, err := ix.db.QueryContext(ctx, `
		SELECT c.comment_id, c.resource_type, c.resource_id, c.content,
			CASE
				WHEN c.resource_type IN ('tool','tools') THEN t.resource_name
				WHEN c.resource_type IN ('course','courses') THEN co.name
				WHEN c.resource_type IN ('project','projects') THEN p.name
				ELSE ''
			END AS parent_name
		FROM comments c
		LEFT JOIN tools t ON c.resource_type IN ('tool','tools') AND t.resource_id = c.resource_id AND t.status = 'approved'
		LEFT JOIN courses co ON c.resource_type IN ('course','courses') AND co.course_id = c.resource_id
		LEFT JOIN projects p ON c.resource_type IN ('project','projects') AND p.project_id = c.resource_id AND p.status = 'approved'
		WHERE c.deleted_at IS NULL
		  AND CHAR_LENGTH(TRIM(c.content)) >= 4
		  AND (
		    (c.resource_type IN ('tool','tools') AND t.resource_id IS NOT NULL)
		    OR (c.resource_type IN ('course','courses') AND co.course_id IS NOT NULL)
		    OR (c.resource_type IN ('project','projects') AND p.project_id IS NOT NULL)
		  )
		ORDER BY c.created_at DESC
		LIMIT 800`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []IndexChunk
	for rows.Next() {
		var cid, rid int
		var rt, content, parentName string
		if rows.Scan(&cid, &rt, &rid, &content, &parentName) != nil {
			continue
		}
		out = append(out, ix.makeCommentChunks(cid, rt, rid, parentName, content)...)
	}
	return out, nil
}

func (ix *RagIndexer) fetchCommentChunks(ctx context.Context, commentID string) ([]IndexChunk, error) {
	row := ix.db.QueryRowContext(ctx, `
		SELECT c.comment_id, c.resource_type, c.resource_id, c.content,
			CASE
				WHEN c.resource_type IN ('tool','tools') THEN t.resource_name
				WHEN c.resource_type IN ('course','courses') THEN co.name
				WHEN c.resource_type IN ('project','projects') THEN p.name
				ELSE ''
			END AS parent_name
		FROM comments c
		LEFT JOIN tools t ON c.resource_type IN ('tool','tools') AND t.resource_id = c.resource_id AND t.status = 'approved'
		LEFT JOIN courses co ON c.resource_type IN ('course','courses') AND co.course_id = c.resource_id
		LEFT JOIN projects p ON c.resource_type IN ('project','projects') AND p.project_id = c.resource_id AND p.status = 'approved'
		WHERE c.comment_id = ? AND c.deleted_at IS NULL`, commentID)
	var cid, rid int
	var rt, content, parentName string
	if row.Scan(&cid, &rt, &rid, &content, &parentName) != nil {
		return nil, nil
	}
	return ix.makeCommentChunks(cid, rt, rid, parentName, content), nil
}

func (ix *RagIndexer) fetchCommentChunk(ctx context.Context, commentID string) (*IndexChunk, error) {
	chunks, err := ix.fetchCommentChunks(ctx, commentID)
	if err != nil || len(chunks) == 0 {
		return nil, err
	}
	return &chunks[0], nil
}

func (ix *RagIndexer) makeCommentChunk(commentID int, resourceType string, resourceID int, parentName, content string) *IndexChunk {
	chunks := ix.makeCommentChunks(commentID, resourceType, resourceID, parentName, content)
	if len(chunks) == 0 {
		return nil
	}
	return &chunks[0]
}

func (ix *RagIndexer) makeCommentChunks(commentID int, resourceType string, resourceID int, parentName, content string) []IndexChunk {
	content = strings.TrimSpace(content)
	if content == "" {
		return nil
	}
	pt, url := normalizeCommentParent(resourceType, resourceID)
	title := strings.TrimSpace(parentName)
	if title == "" {
		title = fmt.Sprintf("%s #%d", pt, resourceID)
	}
	text := joinParts("评论", title, content)
	parts := splitRagText(text)
	if len(parts) == 0 {
		return nil
	}
	var out []IndexChunk
	for i, part := range parts {
		meta := map[string]any{
			"doc_type":    "comment",
			"doc_id":      fmt.Sprintf("%d", commentID),
			"parent_type": pt,
			"parent_id":   fmt.Sprintf("%d", resourceID),
			"title":       "评论·" + title,
			"url":         url,
		}
		meta["content_hash"] = ragContentHash(part)
		out = append(out, IndexChunk{
			ID:       fmt.Sprintf("comment:%d:%d", commentID, i),
			Text:     part,
			Metadata: meta,
		})
	}
	return out
}

func normalizeCommentParent(resourceType string, resourceID int) (parentType, url string) {
	rt := strings.ToLower(strings.TrimSpace(resourceType))
	switch rt {
	case "tool", "tools":
		return "tool", fmt.Sprintf("/tools/detail/%d", resourceID)
	case "course", "courses":
		return "course", fmt.Sprintf("/course/detail/%d", resourceID)
	case "project", "projects":
		return "project", fmt.Sprintf("/projects/detail/%d", resourceID)
	default:
		return "tool", ""
	}
}

func (ix *RagIndexer) fetchAllCourseResourceChunks(ctx context.Context) ([]IndexChunk, error) {
	var out []IndexChunk
	rowsW, err := ix.db.QueryContext(ctx, `
		SELECT w.resource_id, w.course_id, COALESCE(w.resource_intro,''), COALESCE(w.resource_url,''), COALESCE(c.name,'')
		FROM course_resources_web w
		JOIN courses c ON c.course_id = w.course_id`)
	if err == nil {
		defer rowsW.Close()
		for rowsW.Next() {
			var rid, cid int
			var intro, rurl, cname string
			if rowsW.Scan(&rid, &cid, &intro, &rurl, &cname) != nil {
				continue
			}
			if ch := ix.makeCourseResourceChunk("web", rid, cid, cname, intro, rurl); ch != nil {
				out = append(out, *ch)
			}
		}
	}
	rowsU, err := ix.db.QueryContext(ctx, `
		SELECT u.resource_id, u.course_id, COALESCE(u.resource_intro,''), COALESCE(u.resource_upload,''), COALESCE(c.name,'')
		FROM course_resources_upload u
		JOIN courses c ON c.course_id = u.course_id`)
	if err == nil {
		defer rowsU.Close()
		for rowsU.Next() {
			var rid, cid int
			var intro, rpath, cname string
			if rowsU.Scan(&rid, &cid, &intro, &rpath, &cname) != nil {
				continue
			}
			if ch := ix.makeCourseResourceChunk("upload", rid, cid, cname, intro, rpath); ch != nil {
				out = append(out, *ch)
			}
		}
	}
	return out, nil
}

func (ix *RagIndexer) fetchCourseResourceChunk(ctx context.Context, kind, resourceID string) (*IndexChunk, error) {
	k := strings.ToLower(strings.TrimSpace(kind))
	switch k {
	case "web":
		row := ix.db.QueryRowContext(ctx, `
			SELECT w.resource_id, w.course_id, COALESCE(w.resource_intro,''), COALESCE(w.resource_url,''), COALESCE(c.name,'')
			FROM course_resources_web w JOIN courses c ON c.course_id = w.course_id
			WHERE w.resource_id = ?`, resourceID)
		var rid, cid int
		var intro, rurl, cname string
		if row.Scan(&rid, &cid, &intro, &rurl, &cname) != nil {
			return nil, nil
		}
		return ix.makeCourseResourceChunk("web", rid, cid, cname, intro, rurl), nil
	case "upload":
		row := ix.db.QueryRowContext(ctx, `
			SELECT u.resource_id, u.course_id, COALESCE(u.resource_intro,''), COALESCE(u.resource_upload,''), COALESCE(c.name,'')
			FROM course_resources_upload u JOIN courses c ON c.course_id = u.course_id
			WHERE u.resource_id = ?`, resourceID)
		var rid, cid int
		var intro, rpath, cname string
		if row.Scan(&rid, &cid, &intro, &rpath, &cname) != nil {
			return nil, nil
		}
		return ix.makeCourseResourceChunk("upload", rid, cid, cname, intro, rpath), nil
	default:
		return nil, nil
	}
}

func (ix *RagIndexer) makeCourseResourceChunk(kind string, resourceID, courseID int, courseName, intro, link string) *IndexChunk {
	text := strings.TrimSpace(joinParts(courseName, intro, link))
	if text == "" {
		return nil
	}
	docID := fmt.Sprintf("%s:%d", kind, resourceID)
	label := "网课链接"
	if kind == "upload" {
		label = "课程资料"
	}
	meta := map[string]any{
		"doc_type":      "course_resource",
		"doc_id":        docID,
		"parent_type":   "course",
		"parent_id":     fmt.Sprintf("%d", courseID),
		"title":         fmt.Sprintf("%s·%s", label, courseName),
		"url":           fmt.Sprintf("/course/detail/%d", courseID),
		"resource_kind": kind,
	}
	meta["content_hash"] = ragContentHash(text)
	return &IndexChunk{
		ID:       fmt.Sprintf("course_resource:%s:0", docID),
		Text:     text,
		Metadata: meta,
	}
}

func (ix *RagIndexer) UpsertComment(ctx context.Context, commentID string) error {
	if !ix.Configured() {
		return nil
	}
	_ = ix.agent.DeleteByDoc(ctx, "comment", commentID)
	chunks, err := ix.fetchCommentChunks(ctx, commentID)
	if err != nil || len(chunks) == 0 {
		return err
	}
	_, err = ix.agent.UpsertChunks(ctx, chunks)
	return err
}

func (ix *RagIndexer) DeleteComment(ctx context.Context, commentID string) error {
	if !ix.Configured() {
		return nil
	}
	return ix.agent.DeleteByDoc(ctx, "comment", commentID)
}

func (ix *RagIndexer) UpsertCourseResource(ctx context.Context, kind, resourceID string) error {
	if !ix.Configured() {
		return nil
	}
	docID := fmt.Sprintf("%s:%s", strings.ToLower(kind), resourceID)
	_ = ix.agent.DeleteByDoc(ctx, "course_resource", docID)
	ch, err := ix.fetchCourseResourceChunk(ctx, kind, resourceID)
	if err != nil || ch == nil {
		return err
	}
	_, err = ix.agent.UpsertChunks(ctx, []IndexChunk{*ch})
	return err
}
