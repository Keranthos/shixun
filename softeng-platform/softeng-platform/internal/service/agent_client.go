package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type AgentHTTPClient struct {
	BaseURL       string
	InternalToken string
	Client        *http.Client
}

func NewAgentHTTPClientFromEnv() *AgentHTTPClient {
	base := os.Getenv("AGENT_BASE_URL")
	if base == "" {
		base = "http://127.0.0.1:8766"
	}
	return newAgentHTTPClient(base, os.Getenv("AGENT_INTERNAL_TOKEN"))
}

func NewAgentHTTPClientFromConfig(baseURL, token string) *AgentHTTPClient {
	base := strings.TrimSpace(baseURL)
	if base == "" {
		return nil
	}
	return newAgentHTTPClient(base, token)
}

func newAgentHTTPClient(baseURL, token string) *AgentHTTPClient {
	return &AgentHTTPClient{
		BaseURL:       strings.TrimRight(baseURL, "/"),
		InternalToken: strings.TrimSpace(token),
		Client:        &http.Client{Timeout: 120 * time.Second},
	}
}

type agentAnswerReq struct {
	Query           string           `json:"query"`
	TopK            int              `json:"top_k"`
	AllowedDocTypes []string         `json:"allowed_doc_types"`
	UserID          int              `json:"user_id"`
	UserLevel       int              `json:"user_level"`
	History         []HistoryMessage `json:"history,omitempty"`
}

type HistoryMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type agentChunk struct {
	ID         string  `json:"id"`
	DocType    string  `json:"doc_type"`
	DocID      string  `json:"doc_id"`
	Title      string  `json:"title,omitempty"`
	URL        string  `json:"url,omitempty"`
	Snippet    string  `json:"snippet,omitempty"`
	Content    string  `json:"content,omitempty"`
	Score      float64 `json:"score,omitempty"`
	Reason     string  `json:"reason,omitempty"`
	ParentType string  `json:"parent_type,omitempty"`
	ParentID   string  `json:"parent_id,omitempty"`
}

type agentAnswerResp struct {
	Answer  string       `json:"answer"`
	Used    []agentChunk `json:"used"`
	Warning string       `json:"warning"`
	Meta    map[string]any `json:"meta"`
	Error   string       `json:"error"`
}

func (c *AgentHTTPClient) Answer(ctx context.Context, query string, topK int, history []HistoryMessage) (*agentAnswerResp, error) {
	if topK <= 0 {
		topK = 8
	}
	body := agentAnswerReq{
		Query:           query,
		TopK:            topK,
		AllowedDocTypes: []string{"tool", "course", "project", "comment", "course_resource"},
		UserLevel:       3,
		History:         history,
	}
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(body); err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BaseURL+"/v1/answer", &buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.InternalToken != "" {
		req.Header.Set("X-Internal-Token", c.InternalToken)
	}
	res, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		var b bytes.Buffer
		_, _ = b.ReadFrom(res.Body)
		return nil, fmt.Errorf("agent answer http %d: %s", res.StatusCode, b.String())
	}
	var out agentAnswerResp
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	return &out, nil
}

type IndexChunk struct {
	ID       string         `json:"id"`
	Text     string         `json:"text"`
	Metadata map[string]any `json:"metadata"`
}

type indexUpsertReq struct {
	Chunks []IndexChunk `json:"chunks"`
}

type indexUpsertResp struct {
	Upserted int            `json:"upserted"`
	Meta     map[string]any `json:"meta"`
}

func (c *AgentHTTPClient) UpsertChunks(ctx context.Context, chunks []IndexChunk) (*indexUpsertResp, error) {
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(indexUpsertReq{Chunks: chunks}); err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BaseURL+"/v1/index/upsert", &buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.InternalToken != "" {
		req.Header.Set("X-Internal-Token", c.InternalToken)
	}
	client := c.Client
	if client == nil {
		client = &http.Client{Timeout: 0}
	}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		var b bytes.Buffer
		_, _ = b.ReadFrom(res.Body)
		return nil, fmt.Errorf("agent upsert http %d: %s", res.StatusCode, b.String())
	}
	var out indexUpsertResp
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *AgentHTTPClient) Health(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.BaseURL+"/health", nil)
	if err != nil {
		return err
	}
	res, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		return fmt.Errorf("agent health http %d", res.StatusCode)
	}
	return nil
}

type agentStatsResp struct {
	ChunkCount   int            `json:"chunk_count"`
	LexicalCount int            `json:"lexical_count"`
	Meta         map[string]any `json:"meta"`
}

func (c *AgentHTTPClient) Stats(ctx context.Context) (*agentStatsResp, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.BaseURL+"/v1/stats", nil)
	if err != nil {
		return nil, err
	}
	if c.InternalToken != "" {
		req.Header.Set("X-Internal-Token", c.InternalToken)
	}
	res, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		var b bytes.Buffer
		_, _ = b.ReadFrom(res.Body)
		return nil, fmt.Errorf("agent stats http %d: %s", res.StatusCode, b.String())
	}
	var out agentStatsResp
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	return &out, nil
}

type indexDeleteReq struct {
	DocType string `json:"doc_type"`
	DocID   string `json:"doc_id"`
}

func (c *AgentHTTPClient) DeleteByDoc(ctx context.Context, docType, docID string) error {
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(indexDeleteReq{DocType: docType, DocID: docID}); err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BaseURL+"/v1/index/delete", &buf)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.InternalToken != "" {
		req.Header.Set("X-Internal-Token", c.InternalToken)
	}
	res, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		var b bytes.Buffer
		_, _ = b.ReadFrom(res.Body)
		return fmt.Errorf("agent delete http %d: %s", res.StatusCode, b.String())
	}
	return nil
}

func (c *AgentHTTPClient) ClearIndex(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BaseURL+"/v1/index/clear", bytes.NewReader([]byte("{}")))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.InternalToken != "" {
		req.Header.Set("X-Internal-Token", c.InternalToken)
	}
	res, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		var b bytes.Buffer
		_, _ = b.ReadFrom(res.Body)
		return fmt.Errorf("agent clear http %d: %s", res.StatusCode, b.String())
	}
	return nil
}

func (c *AgentHTTPClient) AnswerStream(ctx context.Context, query string, topK int, history []HistoryMessage) (*http.Response, error) {
	if topK <= 0 {
		topK = 8
	}
	body := agentAnswerReq{
		Query:           query,
		TopK:            topK,
		AllowedDocTypes: []string{"tool", "course", "project", "comment", "course_resource"},
		UserLevel:       3,
		History:         history,
	}
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(body); err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BaseURL+"/v1/answer/stream", &buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.InternalToken != "" {
		req.Header.Set("X-Internal-Token", c.InternalToken)
	}
	streamClient := &http.Client{Timeout: 0}
	res, err := streamClient.Do(req)
	if err != nil {
		return nil, err
	}
	if res.StatusCode >= 400 {
		defer res.Body.Close()
		var b bytes.Buffer
		_, _ = b.ReadFrom(res.Body)
		return nil, fmt.Errorf("agent stream http %d: %s", res.StatusCode, b.String())
	}
	return res, nil
}
