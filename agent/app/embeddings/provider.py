from __future__ import annotations

import os
import time
from typing import Sequence

import httpx

from app.config import settings
from app.http_util import gemini_httpx_client, is_google_gemini_base

_MODEL = (os.getenv("GEMINI_EMBED_MODEL", "models/gemini-embedding-001") or "").strip() or "models/gemini-embedding-001"
_MODEL_ID = _MODEL.removeprefix("models/").strip() or "gemini-embedding-001"

_BATCH_SIZE = int(os.getenv("GEMINI_EMBED_BATCH_SIZE", "16"))
_TIMEOUT_S = float(os.getenv("GEMINI_EMBED_TIMEOUT_S", "30"))
_RETRIES = int(os.getenv("GEMINI_EMBED_RETRIES", "2"))


def _api_base() -> str:
    return (settings.gemini_api_base or os.getenv("GEMINI_API_BASE") or "https://generativelanguage.googleapis.com").strip().rstrip("/")


def _proxy_token() -> str:
    return (settings.gemini_proxy_token or os.getenv("GEMINI_PROXY_TOKEN") or "").strip()


def _api_key() -> str:
    return (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()


def embed_texts(texts: Sequence[str]) -> list[list[float]]:
    api_base = _api_base()
    if is_google_gemini_base(api_base):
        if not _api_key():
            raise RuntimeError("缺少 GOOGLE_API_KEY/GEMINI_API_KEY（直连 Google 时必填，或配置 blog 同款 GEMINI_API_BASE 反代）")
    else:
        if not _proxy_token():
            raise RuntimeError("缺少 GEMINI_PROXY_TOKEN（走 Cloudflare 中转时必填，与 blog/agent/.env 相同）")

    cleaned = [t.strip() for t in texts]
    if any(not t for t in cleaned):
        raise ValueError("texts 中包含空字符串，无法 embedding")

    # 可选：简单截断，避免极端长文本导致 embedding 失败（更推荐上游先切块）
    cleaned = [t[:8000] for t in cleaned]

    url = f"{api_base}/v1beta/models/{_MODEL_ID}:batchEmbedContents"

    vectors: list[list[float]] = []
    timeout = httpx.Timeout(_TIMEOUT_S, connect=min(10.0, _TIMEOUT_S))
    with gemini_httpx_client(timeout=timeout) as client:
        for i in range(0, len(cleaned), max(1, _BATCH_SIZE)):
            batch = cleaned[i : i + max(1, _BATCH_SIZE)]

            payload = {
                "requests": [
                    {
                        "model": f"models/{_MODEL_ID}",
                        "content": {"parts": [{"text": t}]},
                    }
                    for t in batch
                ]
            }

            last_err: Exception | None = None
            for attempt in range(_RETRIES + 1):
                try:
                    headers = {}
                    params = None
                    if is_google_gemini_base(api_base):
                        params = {"key": _api_key()}
                    else:
                        headers["X-Proxy-Token"] = _proxy_token()

                    r = client.post(url, params=params, headers=headers, json=payload)
                    r.raise_for_status()
                    data = r.json()
                    embs = data.get("embeddings") or []
                    if len(embs) != len(batch):
                        raise RuntimeError(f"embedding 数量不匹配：got {len(embs)} want {len(batch)}")
                    for e in embs:
                        v = e.get("values")
                        if not isinstance(v, list) or not v:
                            raise RuntimeError(f"embedding 返回结构异常：{e}")
                        vectors.append([float(x) for x in v])
                    last_err = None
                    break
                except httpx.HTTPStatusError as e:
                    # 常见：429 配额/频率限制，做指数退避
                    status = e.response.status_code
                    last_err = e
                    if status == 429 and attempt < _RETRIES:
                        time.sleep(min(20.0, 1.5 * (attempt + 1) ** 2))
                        continue
                    raise RuntimeError(
                        f"Gemini embedding HTTP {status}（model={_MODEL}）：{e.response.text}"
                    ) from e
                except Exception as e:
                    last_err = e
                    if attempt < _RETRIES:
                        time.sleep(0.6 * (attempt + 1))
                        continue
                    raise RuntimeError(f"Gemini embedding 调用失败（model={_MODEL}）：{e}") from e

            if last_err is not None:
                raise last_err

    return vectors