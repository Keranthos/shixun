import hashlib
import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.api.deps import verify_internal_token
from app.chains.rag import invoke_answer, invoke_answer_stream, invoke_search
from app.embeddings import embed_texts
from app.schemas import (
    AnswerRequest,
    AnswerResponse,
    Chunk,
    IndexClearResponse,
    IndexDeleteRequest,
    IndexDeleteResponse,
    IndexStatsResponse,
    IndexUpsertRequest,
    IndexUpsertResponse,
    SearchRequest,
    SearchResponse,
)
from app.vectorstore.chroma_store import get_collection, reset_collection
from app.retrieval import LexicalIndex

router = APIRouter(prefix="/v1", dependencies=[Depends(verify_internal_token)])
lex = LexicalIndex("./data/lexical.sqlite3")
log = logging.getLogger("uvicorn.error")


def _content_hash(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()[:16]


def _to_chunks(raw: list) -> list[Chunk]:
    out: list[Chunk] = []
    for c in raw or []:
        if isinstance(c, dict):
            out.append(Chunk.model_validate(c))
    return out


@router.post("/search", response_model=SearchResponse)
def search(body: SearchRequest):
    try:
        out = invoke_search(
            query=body.query.strip(),
            top_k=body.top_k,
            allowed_doc_types=list(body.allowed_doc_types),
        )
        return SearchResponse(results=_to_chunks(out.get("chunks")), meta={"chain": "langchain_lcel"})
    except Exception as e:
        log.exception("search failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/answer", response_model=AnswerResponse)
def answer(body: AnswerRequest):
    try:
        out = invoke_answer(
            query=body.query.strip(),
            top_k=body.top_k,
            allowed_doc_types=list(body.allowed_doc_types),
            history=[m.model_dump() for m in (body.history or [])],
        )
        return AnswerResponse(
            answer=out.get("answer") or "",
            used=_to_chunks(out.get("used")),
            warning=out.get("warning"),
            meta={"chain": "langchain_lcel", "retrieval": "hybrid_chroma_lexical"},
        )
    except Exception as e:
        log.exception("answer failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/answer/stream")
def answer_stream(body: AnswerRequest):
    def gen():
        try:
            for ev in invoke_answer_stream(
                query=body.query.strip(),
                top_k=body.top_k,
                allowed_doc_types=list(body.allowed_doc_types),
                history=[m.model_dump() for m in (body.history or [])],
            ):
                t = ev.get("type")
                if t == "delta":
                    yield "event: delta\n" + "data: " + json.dumps({"delta": ev.get("delta") or ""}, ensure_ascii=False) + "\n\n"
                elif t == "done":
                    payload = {"used": ev.get("used") or [], "warning": ev.get("warning")}
                    yield "event: done\n" + "data: " + json.dumps(payload, ensure_ascii=False) + "\n\n"
                elif t == "error":
                    yield "event: error\n" + "data: " + json.dumps({"error": ev.get("error") or "unknown", "used": ev.get("used") or []}, ensure_ascii=False) + "\n\n"
        except Exception as e:
            log.exception("answer_stream generator failed")
            yield "event: error\n" + "data: " + json.dumps({"error": str(e), "used": []}, ensure_ascii=False) + "\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")


@router.get("/stats", response_model=IndexStatsResponse)
def index_stats():
    col = get_collection()
    try:
        chunk_count = int(col.count())
    except Exception:
        chunk_count = 0
    lexical_count = 0
    try:
        with lex._conn() as conn:  # noqa: SLF001
            row = conn.execute("SELECT COUNT(*) FROM chunks").fetchone()
            lexical_count = int(row[0]) if row else 0
    except Exception:
        lexical_count = 0
    return IndexStatsResponse(
        chunk_count=chunk_count,
        lexical_count=lexical_count,
        meta={"collection": col.name, "chain": "langchain_lcel"},
    )


@router.post("/index/delete", response_model=IndexDeleteResponse)
def index_delete(body: IndexDeleteRequest):
    col = get_collection()
    doc_type = body.doc_type
    doc_id = str(body.doc_id).strip()
    prefix = f"{doc_type}:{doc_id}:"
    try:
        got = col.get(where={"$and": [{"doc_type": doc_type}, {"doc_id": doc_id}]}, include=[])
        ids = list(got.get("ids") or [])
    except Exception:
        ids = []
    if not ids:
        try:
            got2 = col.get(where={"doc_id": doc_id}, include=[])
            ids = [i for i in (got2.get("ids") or []) if str(i).startswith(prefix)]
        except Exception:
            ids = []
    if ids:
        col.delete(ids=ids)
    n_lex = lex.delete_by_doc(doc_type, doc_id)
    return IndexDeleteResponse(deleted=max(len(ids), n_lex), meta={"doc_type": doc_type, "doc_id": doc_id})


@router.post("/index/clear", response_model=IndexClearResponse)
def index_clear():
    reset_collection()
    lex.clear_all()
    return IndexClearResponse(cleared=True, meta={"chain": "langchain_lcel"})


@router.post("/index/upsert", response_model=IndexUpsertResponse)
def index_upsert(body: IndexUpsertRequest):
    col = get_collection()
    ids: list[str] = []
    docs: list[str] = []
    metas: list[dict] = []
    embs: list[list[float]] = []
    missing_idx: list[int] = []

    for idx, ch in enumerate(body.chunks):
        ids.append(ch.id)
        docs.append(ch.text)
        meta = dict(ch.metadata or {})
        meta["content_hash"] = meta.get("content_hash") or _content_hash(ch.text)
        metas.append(meta)
        if ch.embedding is None:
            missing_idx.append(idx)
            embs.append([])
        else:
            embs.append(list(ch.embedding))

    try:
        embedded_new = 0
        reused = 0
        if missing_idx:
            existing_emb: dict[str, list[float]] = {}
            existing_hash: dict[str, str] = {}
            try:
                got = col.get(
                    ids=[ids[i] for i in missing_idx],
                    include=["embeddings", "metadatas"],
                )
                got_ids = got.get("ids") or []
                got_embs = got.get("embeddings") or []
                got_metas = got.get("metadatas") or []
                for k in range(min(len(got_ids), len(got_embs))):
                    cid = str(got_ids[k])
                    v = got_embs[k]
                    if v is not None:
                        existing_emb[cid] = [float(x) for x in list(v)]
                    if k < len(got_metas) and isinstance(got_metas[k], dict):
                        h = got_metas[k].get("content_hash")
                        if isinstance(h, str) and h:
                            existing_hash[cid] = h
            except Exception:
                existing_emb = {}
                existing_hash = {}
            still_texts: list[str] = []
            still_slot_idx: list[int] = []
            for i in missing_idx:
                cid = ids[i]
                new_h = str(metas[i].get("content_hash") or "")
                old_h = existing_hash.get(cid, "")
                if cid in existing_emb and new_h and old_h == new_h:
                    embs[i] = existing_emb[cid]
                    reused += 1
                elif cid in existing_emb and not new_h:
                    embs[i] = existing_emb[cid]
                    reused += 1
                else:
                    still_texts.append(docs[i])
                    still_slot_idx.append(i)
            if still_texts:
                gen = embed_texts(still_texts)
                embedded_new = len(gen)
                for j, i in enumerate(still_slot_idx):
                    embs[i] = gen[j]

        col.upsert(ids=ids, documents=docs, metadatas=metas, embeddings=embs)
        lex.rebuild_for_chunks([c.model_dump() for c in body.chunks])
        return IndexUpsertResponse(
            upserted=len(ids),
            meta={
                "collection": col.name,
                "embedded_new": embedded_new,
                "embeddings_reused": reused,
            },
        )
    except Exception as e:
        log.exception("index_upsert failed")
        raise HTTPException(status_code=500, detail=str(e)) from e
