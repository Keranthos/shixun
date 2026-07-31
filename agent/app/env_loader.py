"""加载环境变量：本地 agent/.env 优先，缺失项从 blog agent/.env 补齐（与 blog 共用 Gemini 配置）。"""

from __future__ import annotations

import os
from pathlib import Path

_ENV_LOADED = False

# 与 blog 共用、可从 blog/.env 继承的键（端口/Chroma/persona 仍只用 shixun 本地）
_SHARED_KEYS = frozenset({
    "GOOGLE_API_KEY",
    "GEMINI_API_KEY",
    "GEMINI_API_BASE",
    "GEMINI_PROXY_TOKEN",
    "GEMINI_HTTPS_PROXY",
    "HTTPS_PROXY",
    "HTTP_PROXY",
    "GEMINI_EMBED_MODEL",
    "GEMINI_EMBED_BATCH_SIZE",
    "GEMINI_EMBED_TIMEOUT_S",
    "GEMINI_EMBED_RETRIES",
    "GEMINI_CHAT_MODEL",
    "GEMINI_TEMPERATURE",
    "GEMINI_CHAT_FALLBACK_MODELS",
})


def _agent_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _default_blog_env() -> Path:
    return Path(os.getenv("BLOG_AGENT_ENV", "D:/blog/agent/.env"))


def _parse_env_file(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        k, _, v = line.partition("=")
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k:
            out[k] = v
    return out


def _merge_from_blog(blog_path: Path) -> list[str]:
    merged: list[str] = []
    data = _parse_env_file(blog_path)
    for key in _SHARED_KEYS:
        if key not in data or not str(data[key]).strip():
            continue
        if str(os.getenv(key, "")).strip():
            continue
        os.environ[key] = str(data[key]).strip()
        merged.append(key)
    return merged


def ensure_env_loaded() -> None:
    global _ENV_LOADED
    if _ENV_LOADED:
        return
    _ENV_LOADED = True

    try:
        from dotenv import load_dotenv
    except Exception:
        load_dotenv = None  # type: ignore

    root = _agent_root()
    local_env = root / ".env"
    if load_dotenv and local_env.is_file():
        load_dotenv(local_env, override=True)

    blog_env = _default_blog_env()
    if blog_env.is_file():
        _merge_from_blog(blog_env)


def gemini_env_source() -> dict[str, str | None]:
    """供 /health 展示：当前 Gemini 配置来自哪里。"""
    ensure_env_loaded()
    base = (os.getenv("GEMINI_API_BASE") or "").strip() or None
    blog = _default_blog_env()
    blog_ok = blog.is_file()
    return {
        "gemini_api_base": base,
        "uses_blog_env": str(blog_ok and not base.endswith("generativelanguage.googleapis.com") if base else blog_ok),
        "blog_env_path": str(blog) if blog_ok else None,
    }
