from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

from app.env_loader import ensure_env_loaded

ensure_env_loaded()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    agent_host: str = "0.0.0.0"
    agent_port: int = 8766
    internal_api_token: str = ""

    chroma_persist_dir: str = "./data/chroma"
    chroma_collection: str = "softeng_rag_v1"

    # 与 blog 相同：默认直连 Google；国内一般在 blog/agent/.env 配反代 base + GEMINI_PROXY_TOKEN
    gemini_api_base: str = "https://generativelanguage.googleapis.com"
    gemini_proxy_token: str = ""
    gemini_chat_model: str = "gemini-2.5-flash"
    gemini_temperature: float = 0.2

    agent_persona: str = ""
    agent_persona_path: str = "./app/persona/softeng_assistant.md"

    def load_persona_text(self) -> str:
        if (self.agent_persona or "").strip():
            return self.agent_persona.strip()
        p = (self.agent_persona_path or "").strip()
        if not p:
            return ""
        try:
            return Path(p).read_text(encoding="utf-8").strip()
        except Exception:
            return ""


settings = Settings()
