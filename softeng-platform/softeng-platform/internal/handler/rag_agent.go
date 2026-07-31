package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"softeng-platform/internal/service"
	"softeng-platform/pkg/response"
	"time"

	"github.com/gin-gonic/gin"
)

type RagAgentHandler struct {
	svc     service.RagAgentService
	indexer *service.RagIndexer
}

func NewRagAgentHandler(svc service.RagAgentService, indexer *service.RagIndexer) *RagAgentHandler {
	return &RagAgentHandler{svc: svc, indexer: indexer}
}

type ragHistoryItem struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ragAgentChatRequest struct {
	Message string           `json:"message"`
	History []ragHistoryItem `json:"history"`
	Stream  bool             `json:"stream"`
}

type ragChatResponse struct {
	Answer         string               `json:"answer"`
	Sources        []service.RagSource  `json:"sources"`
	Mode           string               `json:"mode"`
	Model          string               `json:"model,omitempty"`
	Warning        string               `json:"warning,omitempty"`
	FallbackReason string               `json:"fallbackReason,omitempty"`
	UserMessage    string               `json:"userMessage"`
}

func parseRagHistory(items []ragHistoryItem) []service.HistoryMessage {
	var history []service.HistoryMessage
	for _, m := range items {
		role := m.Role
		if role != "assistant" && role != "user" {
			continue
		}
		if m.Content == "" {
			continue
		}
		history = append(history, service.HistoryMessage{Role: role, Content: m.Content})
	}
	if len(history) > 12 {
		history = history[len(history)-12:]
	}
	return history
}

// Chat POST /api/agent/rag — LangChain 混合检索 + Gemini（登录用户；stream 可选）
// @Summary RAG 问答
// @Description 登录用户可用；JSON body 含 message、history、stream。stream=true 时返回 text/event-stream。
// @Tags agent
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body ragAgentChatRequest true "问答请求"
// @Success 200 {object} ragChatResponse "非流式 JSON 包装"
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 429 {object} map[string]interface{}
// @Router /api/agent/rag [post]
func (h *RagAgentHandler) Chat(c *gin.Context) {
	var req ragAgentChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求体需为 JSON，且包含 message 字段")
		return
	}
	history := parseRagHistory(req.History)

	if req.Stream {
		h.chatStream(c, req.Message, history)
		return
	}

	res, err := h.svc.Chat(c.Request.Context(), req.Message, history)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, res)
}

func (h *RagAgentHandler) chatStream(c *gin.Context, message string, history []service.HistoryMessage) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 60*time.Second)
	defer cancel()

	resp, err := h.svc.ChatStream(ctx, message, history)
	if err != nil {
		h.chatStreamFallback(c, message, history)
		return
	}
	defer resp.Body.Close()

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Status(http.StatusOK)
	_, _ = io.Copy(c.Writer, resp.Body)
}

func (h *RagAgentHandler) chatStreamFallback(c *gin.Context, message string, history []service.HistoryMessage) {
	res, err := h.svc.Chat(c.Request.Context(), message, history)
	if err != nil {
		response.Error(c, http.StatusBadGateway, err.Error())
		return
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Status(http.StatusOK)

	writeRagSSE(c.Writer, "delta", map[string]string{"delta": res.Answer})

	used := make([]map[string]string, 0, len(res.Sources))
	for _, s := range res.Sources {
		used = append(used, map[string]string{
			"doc_type":    s.Kind,
			"doc_id":      s.ID,
			"title":       s.Title,
			"snippet":     s.Snippet,
			"parent_type": s.ParentKind,
			"parent_id":   s.ParentID,
		})
	}
	donePayload := map[string]any{"used": used}
	if res.Warning != "" {
		donePayload["warning"] = res.Warning
	}
	writeRagSSE(c.Writer, "done", donePayload)
}

func writeRagSSE(w http.ResponseWriter, event string, payload any) {
	b, _ := json.Marshal(payload)
	_, _ = fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, string(b))
	if flusher, ok := w.(http.Flusher); ok {
		flusher.Flush()
	}
}

// Status GET /api/agent/status — Agent 健康与索引条数（管理员）
// @Summary Agent 状态
// @Tags agent
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /api/agent/status [get]
func (h *RagAgentHandler) Status(c *gin.Context) {
	if h.indexer == nil {
		response.Success(c, gin.H{"agent_configured": false})
		return
	}
	st, err := h.indexer.AgentStatus(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, st)
}

// Reindex POST /api/agent/reindex — 全量重建向量索引（管理员）
// @Summary 重建 RAG 索引
// @Tags agent
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /api/agent/reindex [post]
func (h *RagAgentHandler) Reindex(c *gin.Context) {
	if h.indexer == nil || !h.indexer.Configured() {
		response.Error(c, http.StatusServiceUnavailable, "未配置 AGENT_BASE_URL")
		return
	}
	clearFirst := c.Query("clear") == "true" || c.Query("clear") == "1"
	n, err := h.indexer.ReindexAll(c.Request.Context(), clearFirst)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	msg := "索引同步完成（未清空，相同内容将复用已有向量）"
	if clearFirst {
		msg = "索引已清空并全量重建"
	}
	response.Success(c, gin.H{"upserted": n, "clear": clearFirst, "message": msg})
}
