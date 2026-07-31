# 软工资源平台 · LangChain Agent

独立 Python 微服务，提供向量 RAG 能力：

- **LangChain LCEL** 编排（retrieve → generate）
- **Gemini embedding**（`batchEmbedContents`）
- **Chroma** 向量库 + **SQLite** 倒排索引（混合检索）
- **Gemini LLM** 生成带 `[1][2]` 引用的回答
- **SSE 流式** `/v1/answer/stream`

默认端口 **8766**。

## 快速开始

1. 复制环境变量：

```powershell
cd agent
copy .env.example .env
# 编辑 .env，填入 GOOGLE_API_KEY
pip install -r requirements.txt
```

2. 启动 Agent：

```powershell
.\run_dev.ps1
```

有 conda 时会自动使用 `agent` 环境；否则可用系统 Python：

```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8766
```

3. 在后端 `.env` 中配置并重启 Go API：

```env
AGENT_BASE_URL=http://127.0.0.1:8766
AGENT_INTERNAL_TOKEN=   # 可选，与 agent/.env 的 INTERNAL_API_TOKEN 一致
AGENT_AUTO_REINDEX=true # 索引为空时 Go 启动后自动全量重建
RAG_RATE_LIMIT_PER_MIN=12
```

4. 浏览器访问 **`/assistant/rag`**（任意登录用户；学生可用）。  
   响应 `mode` 为 `langchain` 表示走了向量 RAG。  
   管理员可在该页重建索引，或调用 `POST /api/agent/reindex`。

## API 摘要

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/answer` | 非流式问答 |
| POST | `/v1/answer/stream` | SSE 流式 |
| GET | `/v1/stats` | 索引条数 |
| POST | `/v1/index/upsert` | 增量写入 |
| POST | `/v1/index/delete` | 按 doc_type + doc_id 删除 |
| POST | `/v1/index/clear` | 清空向量库与倒排 |

## 与 Go 内置回退对比

| 能力 | Go 内置（回退） | LangChain Agent |
|------|-----------------|-----------------|
| 检索 | MySQL LIKE | Chroma 向量 + 倒排融合 |
| Embedding | 无 | Gemini embedding |
| 生成 | Gemini/OpenAI/demo | Gemini + 引用溯源 + SSE |
| 索引 | 无 | 自动/全量/增量/删除同步 |

未配置 `AGENT_BASE_URL` 或 Agent 宕机时，Go 仍回退到 LIKE + LLM/demo，前端显示「已降级」。
