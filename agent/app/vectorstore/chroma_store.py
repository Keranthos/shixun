from __future__ import annotations

from functools import lru_cache

import chromadb
from chromadb.api.models.Collection import Collection

from app.config import settings


@lru_cache(maxsize=1)
def _client() -> chromadb.PersistentClient:
    return chromadb.PersistentClient(path=settings.chroma_persist_dir)


@lru_cache(maxsize=1)
def get_collection() -> Collection:
    """
    返回 Chroma collection。

    注意：这里没有绑定 embedding_function（因为你将使用 Gemini embedding），
    所以 query/upsert 时需要显式提供 embeddings。
    """
    client = _client()
    return client.get_or_create_collection(name=settings.chroma_collection)


def reset_collection() -> Collection:
    """删除并重建 collection（全量 reindex 前调用）。"""
    get_collection.cache_clear()
    _client.cache_clear()
    client = _client()
    name = settings.chroma_collection
    try:
        client.delete_collection(name)
    except Exception:
        pass
    return client.get_or_create_collection(name=name)

