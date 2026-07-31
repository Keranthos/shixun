/**
 * 与后端 JSON 对齐的演示类型（A18 契约叙事，按需扩展）
 */

/** POST /api/agent/rag 成功体 */
export interface RagChatSource {
  kind: string
  id: string
  title: string
  snippet: string
}

export interface RagChatResponse {
  answer: string
  sources: RagChatSource[]
  mode: 'gemini' | 'llm' | 'demo'
  model?: string
  userMessage: string
}
