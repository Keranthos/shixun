from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.config import settings
from app.env_loader import ensure_env_loaded, gemini_env_source
from app.http_util import is_google_gemini_base, log_proxy_status_once

ensure_env_loaded()


@asynccontextmanager
async def lifespan(_: FastAPI):
    log_proxy_status_once()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="SoftEng LangChain Agent",
        description="软工资源平台 RAG 服务（LangChain LCEL + Chroma + Gemini）",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health():
        proxy = log_proxy_status_once() if is_google_gemini_base() else None
        return {
            "status": "ok",
            "service": "softeng-langchain-agent",
            "gemini": gemini_env_source(),
            "gemini_https_proxy": proxy.split("@")[-1] if proxy else None,
        }

    app.include_router(router)
    return app


app = create_app()
