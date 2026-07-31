"""
软工资源平台 RAG：LangChain LCEL + Chroma 向量 + SQLite 倒排 + Gemini embedding/LLM。
"""

from __future__ import annotations

import json
import math
import os
import re
import time
from typing import Any

import httpx
from langchain_core.runnables import Runnable, RunnableLambda

from app.config import settings
from app.embeddings import embed_texts
from app.http_util import gemini_httpx_client, is_google_gemini_base
from app.retrieval import LexicalIndex
from app.vectorstore import get_collection

_re_ascii_word = re.compile(r"[A-Za-z0-9_./:-]{2,}")
_re_cjk = re.compile(r"[\u4e00-\u9fff]+")

lex = LexicalIndex("./data/lexical.sqlite3")

DEFAULT_DOC_TYPES = ["tool", "course", "project", "comment", "course_resource"]


def _query_terms(q: str) -> list[str]:
    q = (q or "").strip()
    if not q:
        return []
    terms: list[str] = []
    for w in _re_ascii_word.findall(q):
        lw = w.lower()
        if lw not in terms:
            terms.append(lw)
    for seg in _re_cjk.findall(q):
        if len(seg) <= 1:
            continue
        for i in range(len(seg) - 1):
            bg = seg[i : i + 2]
            if bg not in terms:
                terms.append(bg)
    return [t for t in terms if 2 <= len(t) <= 32][:48]


def _lexical_score(q_terms: list[str], title: str, content: str) -> float:
    if not q_terms:
        return 0.0
    t = (title or "").lower()
    c = (content or "").lower()
    hit = 0.0
    for term in q_terms:
        if term in t:
            hit += 1.2
        elif term in c:
            hit += 0.7
    x = hit / max(1.0, float(len(q_terms)))
    return 1.0 - math.exp(-2.2 * x)


def _vector_similarity(distance: float) -> float:
    d = float(distance) if distance is not None else 0.0
    return 1.0 / (1.0 + max(0.0, d))


def _filter_doc_types(chunks: list[dict[str, Any]], allowed: list[str]) -> list[dict[str, Any]]:
    allow = set(allowed or DEFAULT_DOC_TYPES)
    return [c for c in chunks if (c.get("doc_type") or "tool") in allow]


def _rank_fuse(chunks: list[dict[str, Any]], q: str, top_k: int) -> list[dict[str, Any]]:
    if not chunks:
        return []
    q_terms = _query_terms(q)
    has_ascii = bool(_re_ascii_word.search(q or ""))
    alpha = 0.62 if has_ascii else 0.72
    beta = 1.0 - alpha
    max_lex = max((float(c.get("lex_score") or 0.0) for c in chunks), default=0.0)
    scored: list[tuple[float, dict[str, Any]]] = []
    for ch in chunks:
        vs = _vector_similarity(ch.get("score", 0.0))
        ls = _lexical_score(q_terms, ch.get("title") or "", ch.get("content") or "")
        lex2 = float(ch.get("lex_score") or 0.0) / max_lex if max_lex > 0 else 0.0
        final = alpha * vs + beta * min(1.0, 0.72 * ls + 0.28 * lex2)
        ch2 = dict(ch)
        ch2["final_score"] = final
        scored.append((final, ch2))
    scored.sort(key=lambda x: x[0], reverse=True)
    per_source: dict[str, int] = {}
    out: list[dict[str, Any]] = []
    for _, ch in scored:
        key = f"{ch.get('doc_type')}:{ch.get('doc_id')}:{ch.get('url')}"
        n = per_source.get(key, 0)
        if n >= 3:
            continue
        per_source[key] = n + 1
        out.append(ch)
        if len(out) >= top_k:
            break
    return out


def _retrieve_step(payload: dict[str, Any]) -> dict[str, Any]:
    allowed = payload.get("allowed_doc_types") or DEFAULT_DOC_TYPES
    top_k = int(payload.get("top_k") or 8)
    q = (payload.get("query") or "").strip()
    if not q:
        return {**payload, "chunks": []}

    allowed_list = list(allowed)
    lex_hits = lex.search(q, allowed_doc_types=allowed_list, limit=80)

    col = get_collection()
    # 索引为空且倒排也无命中时，跳过 embedding（避免直连 Google 长时间超时）
    try:
        if int(col.count()) == 0 and not lex_hits:
            return {**payload, "chunks": []}
    except Exception:
        pass

    q_emb = embed_texts([q])[0]
    where = {"doc_type": {"$in": allowed_list}}

    lex_ids = [h.chunk_id for h in lex_hits[:60]]
    lex_score_map = {h.chunk_id: float(h.score) for h in lex_hits}
    lex_chunks_raw: list[dict[str, Any]] = []
    if lex_ids:
        try:
            got = col.get(ids=lex_ids, include=["documents", "metadatas"])
            for i, cid in enumerate(got.get("ids") or []):
                meta = (got.get("metadatas") or [{}])[i] or {}
                lex_chunks_raw.append(
                    {
                        "id": str(cid),
                        "doc_type": meta.get("doc_type") or "tool",
                        "doc_id": str(meta.get("doc_id") or ""),
                        "title": meta.get("title"),
                        "url": meta.get("url"),
                        "parent_type": meta.get("parent_type"),
                        "parent_id": meta.get("parent_id"),
                        "snippet": ((got.get("documents") or [""])[i] or "")[:220],
                        "content": (got.get("documents") or [""])[i] or "",
                        "score": 0.0,
                        "lex_score": lex_score_map.get(str(cid), 0.0),
                    }
                )
        except Exception:
            pass

    cand_k = max(24, min(120, top_k * 8))
    res = col.query(
        query_embeddings=[q_emb],
        n_results=max(1, min(cand_k, 120)),
        where=where,
        include=["documents", "metadatas", "distances"],
    )
    ids = (res.get("ids") or [[]])[0]
    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]
    dists = (res.get("distances") or [[]])[0]
    raw: list[dict[str, Any]] = []
    for i in range(len(ids)):
                meta = metas[i] or {}
                raw.append(
                    {
                        "id": str(ids[i]),
                        "doc_type": meta.get("doc_type") or "tool",
                        "doc_id": str(meta.get("doc_id") or ""),
                        "title": meta.get("title"),
                        "url": meta.get("url"),
                        "parent_type": meta.get("parent_type"),
                        "parent_id": meta.get("parent_id"),
                        "snippet": (docs[i] or "")[:220],
                        "content": docs[i] or "",
                        "score": float(dists[i]) if i < len(dists) and dists[i] is not None else 0.0,
                    }
                )

    merged: dict[str, dict[str, Any]] = {str(c["id"]): c for c in _filter_doc_types(raw, allowed)}
    for ch in _filter_doc_types(lex_chunks_raw, allowed):
        cid = str(ch.get("id") or "")
        if cid and cid not in merged:
            merged[cid] = ch
    chunks = _rank_fuse(list(merged.values()), q, top_k)
    return {**payload, "chunks": chunks}


def _dedupe_to_sources(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    m: dict[str, dict[str, Any]] = {}
    order: list[str] = []
    for ch in chunks:
        key = f"{ch.get('doc_type')}:{ch.get('doc_id')}:{ch.get('url')}"
        if key not in m:
            m[key] = {
                "doc_type": ch.get("doc_type"),
                "doc_id": ch.get("doc_id"),
                "title": ch.get("title"),
                "url": ch.get("url"),
                "parent_type": ch.get("parent_type"),
                "parent_id": ch.get("parent_id"),
                "chunks": [],
            }
            order.append(key)
        content = (ch.get("content") or ch.get("snippet") or "").strip()
        if content and content not in m[key]["chunks"]:
            m[key]["chunks"].append(content)
    return [m[k] for k in order]


def _format_sources(sources: list[dict[str, Any]]) -> str:
    lines: list[str] = []
    for i, s in enumerate(sources, start=1):
        s["cite"] = i
        title = (s.get("title") or "").strip()
        url = (s.get("url") or "").strip()
        dt = (s.get("doc_type") or "").strip()
        header = " | ".join(x for x in [title, dt] if x) or "source"
        parts = [p.strip() for p in (s.get("chunks") or []) if isinstance(p, str) and p.strip()]
        if not parts:
            continue
        content = "\n\n".join(parts)
        if len(content) > 2400:
            content = content[:2400] + "…"
        lines.append(f"[{i}] {header}")
        if url:
            lines.append(f"URL: {url}")
        lines.append(content)
        lines.append("")
    return "\n".join(lines).strip()


def _sources_to_used(sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for s in sources:
        cite = int(s.get("cite") or 0)
        text = "\n\n".join(s.get("chunks") or [])
        out.append(
            {
                "id": f"{s.get('doc_type')}:{s.get('doc_id')}:{cite}",
                "doc_type": s.get("doc_type"),
                "doc_id": str(s.get("doc_id") or ""),
                "title": s.get("title"),
                "url": s.get("url"),
                "parent_type": s.get("parent_type"),
                "parent_id": s.get("parent_id"),
                "cite": cite,
                "snippet": text[:220],
                "content": text[:2000],
                "score": 1.0,
            }
        )
    return out


def _extract_cite_numbers(answer: str) -> set[int]:
    out: set[int] = set()
    for m in re.finditer(r"\[(\d{1,2})\]", answer or ""):
        try:
            out.add(int(m.group(1)))
        except ValueError:
            pass
    return out


def _filter_used_by_answer_cites(answer: str, used: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cites = _extract_cite_numbers(answer)
    if not cites:
        return used[:3]
    return [u for u in used if int(u.get("cite") or 0) in cites]


def _site_facts() -> str:
    return (os.getenv("SITE_FACTS") or "软工资源平台聚合工具、课程与项目三类教学资源。").strip()


def _gemini_build_url(action: str, model: str) -> tuple[str, dict | None, dict]:
    base = (settings.gemini_api_base or os.getenv("GEMINI_API_BASE") or "https://generativelanguage.googleapis.com").strip().rstrip("/")
    model_id = model.removeprefix("models/").strip()
    url = f"{base}/v1beta/models/{model_id}:{action}"
    params = None
    headers: dict[str, str] = {}
    if is_google_gemini_base(base):
        key = (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()
        if not key:
            raise RuntimeError("缺少 GOOGLE_API_KEY/GEMINI_API_KEY（直连 Google 时必填）")
        params = {"key": key}
    else:
        tok = (settings.gemini_proxy_token or os.getenv("GEMINI_PROXY_TOKEN") or "").strip()
        if not tok:
            raise RuntimeError("缺少 GEMINI_PROXY_TOKEN（走 Cloudflare 中转时必填，与 blog 相同）")
        headers["X-Proxy-Token"] = tok
    return url, params, headers


def _gemini_to_contents(history: list[dict[str, Any]] | None, user: str) -> list[dict[str, Any]]:
    contents: list[dict[str, Any]] = []
    for m in (history or [])[-8:]:
        role = str(m.get("role") or "user").lower()
        text = str(m.get("content") or "").strip()
        if not text:
            continue
        contents.append({"role": "model" if role == "assistant" else "user", "parts": [{"text": text}]})
    contents.append({"role": "user", "parts": [{"text": str(user or "").strip()}]})
    return contents


def _gemini_generate_text(*, system: str, history: list[dict[str, Any]] | None, user: str, temperature: float) -> str:
    body = {
        "systemInstruction": {"parts": [{"text": (system or "").strip()}]},
        "contents": _gemini_to_contents(history, user),
        "generationConfig": {"temperature": float(temperature)},
    }
    model = str(settings.gemini_chat_model or "gemini-2.5-flash").strip()
    url, params, headers = _gemini_build_url("generateContent", model)
    with gemini_httpx_client(timeout=httpx.Timeout(90.0, connect=10.0)) as client:
        r = client.post(url, params=params, headers=headers, json=body)
        r.raise_for_status()
        data = r.json()
    cands = data.get("candidates") or []
    if not cands:
        raise RuntimeError(f"Gemini empty response: {json.dumps(data, ensure_ascii=False)[:800]}")
    parts = (cands[0].get("content") or {}).get("parts") or []
    texts = [p.get("text") for p in parts if isinstance(p, dict) and p.get("text")]
    out = "".join(texts).strip()
    if not out:
        raise RuntimeError("Gemini returned empty text")
    return out


def _generate_step(payload: dict[str, Any]) -> dict[str, Any]:
    chunks = payload.get("chunks") or []
    q = payload.get("query") or ""
    history = payload.get("history") or []
    if not chunks:
        return {
            **payload,
            "answer": f"知识库中暂未检索到与「{q}」直接相关的工具/课程/项目片段。请先执行索引重建（POST /api/agent/reindex），或换个关键词再试。",
            "warning": "no_retrieval",
            "used": [],
        }
    sources_list = _dedupe_to_sources(chunks)
    sources_text = _format_sources(sources_list)
    used = _sources_to_used(sources_list)
    persona = settings.load_persona_text()
    system = (
        "你是软工资源平台的学习助手。必须只依据 Sources 回答，不得编造。\n"
        f"站点背景：{_site_facts()}\n"
        "要求：中文、条理清晰；关键结论后标注 [1][2] 等引用编号；资料不足时明确说明。\n"
    )
    if persona:
        system += f"\nPersona：\n{persona}\n"
    answer = _gemini_generate_text(
        system=system,
        history=history,
        user=f"问题：{q}\n\nSources:\n{sources_text}\n\n请给出答案：",
        temperature=settings.gemini_temperature,
    )
    used = _filter_used_by_answer_cites(answer, used)
    return {**payload, "answer": answer, "warning": None, "used": used}


retrieve_runnable = RunnableLambda(_retrieve_step)
generate_runnable = RunnableLambda(_generate_step)
search_chain: Runnable = retrieve_runnable
answer_chain: Runnable = retrieve_runnable | generate_runnable


def invoke_search(*, query: str, top_k: int, allowed_doc_types: list[str], **_kw: Any) -> dict[str, Any]:
    return search_chain.invoke(
        {"query": query, "top_k": top_k, "allowed_doc_types": allowed_doc_types or DEFAULT_DOC_TYPES}
    )


def invoke_answer(
    *,
    query: str,
    top_k: int,
    allowed_doc_types: list[str],
    history: list[dict[str, Any]] | None = None,
    **_kw: Any,
) -> dict[str, Any]:
    return answer_chain.invoke(
        {
            "query": query,
            "top_k": top_k,
            "allowed_doc_types": allowed_doc_types or DEFAULT_DOC_TYPES,
            "history": history or [],
        }
    )


def invoke_answer_stream(
    *,
    query: str,
    top_k: int,
    allowed_doc_types: list[str],
    history: list[dict[str, Any]] | None = None,
    **_kw: Any,
):
    """流式回答：retrieve 后 SSE 输出 Gemini 增量文本。"""
    payload: dict[str, Any] = {
        "query": query,
        "top_k": top_k,
        "allowed_doc_types": allowed_doc_types or DEFAULT_DOC_TYPES,
        "history": history or [],
    }
    retrieved = _retrieve_step(payload)
    chunks = retrieved.get("chunks") or []
    q = retrieved.get("query") or query
    if not chunks:
        yield {
            "type": "delta",
            "delta": f"知识库中暂未检索到与「{q}」直接相关的工具/课程/项目片段。请先执行索引重建，或换个关键词再试。",
        }
        yield {"type": "done", "used": [], "warning": "no_retrieval"}
        return

    sources_list = _dedupe_to_sources(chunks)
    sources_text = _format_sources(sources_list)
    used = _sources_to_used(sources_list)
    persona = settings.load_persona_text()
    system = (
        "你是软工资源平台的学习助手。必须只依据 Sources 回答，不得编造。\n"
        f"站点背景：{_site_facts()}\n"
        "要求：中文、条理清晰；关键结论后标注 [1][2] 等引用编号；资料不足时明确说明。\n"
    )
    if persona:
        system += f"\nPersona：\n{persona}\n"
    hist = list(history or [])[-8:]
    try:
        parts_acc: list[str] = []
        for part in _gemini_stream_text(
            system=system,
            history=hist,
            user=f"问题：{q}\n\nSources:\n{sources_text}\n\n请给出答案：",
            temperature=settings.gemini_temperature,
        ):
            if part:
                parts_acc.append(part)
                yield {"type": "delta", "delta": part}
        full_answer = "".join(parts_acc)
        used2 = _filter_used_by_answer_cites(full_answer, used)
        yield {"type": "done", "used": used2, "warning": None}
    except Exception as e:
        yield {"type": "error", "error": str(e), "used": used}


def _gemini_stream_text(*, system: str, history: list[dict[str, Any]] | None, user: str, temperature: float):
    body = {
        "systemInstruction": {"parts": [{"text": (system or "").strip()}]},
        "contents": _gemini_to_contents(history, user),
        "generationConfig": {"temperature": float(temperature)},
    }
    model = str(settings.gemini_chat_model or "gemini-2.5-flash").strip()
    url, params, headers = _gemini_build_url("streamGenerateContent", model)
    params2 = dict(params or {})
    params2["alt"] = "sse"
    with gemini_httpx_client(timeout=None) as client:
        with client.stream("POST", url, params=params2, headers=headers, json=body) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line:
                    continue
                s = line.decode("utf-8", errors="ignore") if isinstance(line, (bytes, bytearray)) else str(line)
                s = s.strip()
                if not s.startswith("data:"):
                    continue
                payload = s.removeprefix("data:").strip()
                if not payload or payload == "[DONE]":
                    continue
                try:
                    obj = json.loads(payload)
                except Exception:
                    continue
                cands = obj.get("candidates") or []
                if not cands:
                    continue
                content = (cands[0].get("content") or {}) if isinstance(cands[0], dict) else {}
                for p in content.get("parts") or []:
                    if isinstance(p, dict) and isinstance(p.get("text"), str) and p["text"]:
                        yield p["text"]
