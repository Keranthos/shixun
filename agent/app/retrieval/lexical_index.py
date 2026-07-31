from __future__ import annotations

import math
import os
import re
import sqlite3
from dataclasses import dataclass
from typing import Any, Iterable


_re_ascii_word = re.compile(r"[A-Za-z0-9_./:-]{2,}")
_re_cjk = re.compile(r"[\u4e00-\u9fff]+")
_re_codeish = re.compile(r"(?:[A-Za-z_][A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+|/[A-Za-z0-9_./:-]+|\bERR_[A-Z0-9_]+\b|\b[A-Z]{2,}\b)")

# 简单停用词（只做极少量，避免误杀专有名词）
_stopwords_zh = {
    "什么",
    "如何",
    "怎么",
    "为什么",
    "怎样",
    "能否",
    "可以",
    "一个",
    "一下",
    "一些",
    "以及",
    "关于",
    "有关",
    "时候",
    "时候的",
    "开始",
    "进行",
    "实现",
    "使用",
}
_stopwords_en = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "be",
    "how",
    "what",
    "why",
}


def _extract_terms(text: str) -> list[str]:
    """
    极简分词（适合个人站小语料）：
    - 英文/数字/路径 token：原样小写
    - 中文：2-gram + 少量 3-gram（更像“关键词”）
    """
    text = (text or "").strip()
    if not text:
        return []

    terms: list[str] = []
    for w in _re_ascii_word.findall(text):
        lw = w.lower()
        if lw not in terms:
            terms.append(lw)

    # 代码/路径/错误码等“硬 token”
    for w in _re_codeish.findall(text):
        lw = w.lower()
        if lw not in terms:
            terms.append(lw)

    for seg in _re_cjk.findall(text):
        seg = seg.strip()
        if len(seg) <= 1:
            continue
        # 标题里常出现 4~8 字专有名词：保留整词（更硬命中）
        if 4 <= len(seg) <= 8 and seg not in terms and seg not in _stopwords_zh:
            terms.append(seg)
        for i in range(len(seg) - 1):
            bg = seg[i : i + 2]
            if bg in _stopwords_zh:
                continue
            if bg not in terms:
                terms.append(bg)
        if len(seg) >= 3:
            # 3-gram 上限 6 个，避免过多噪声
            for i in range(min(len(seg) - 2, 6)):
                tg = seg[i : i + 3]
                if tg in _stopwords_zh:
                    continue
                if tg not in terms:
                    terms.append(tg)

    out: list[str] = []
    for t in terms:
        if not (2 <= len(t) <= 40):
            continue
        tl = t.lower()
        if tl in _stopwords_en:
            continue
        if t in _stopwords_zh:
            continue
        out.append(t)
    return out[:64]


@dataclass(frozen=True)
class LexicalHit:
    chunk_id: str
    score: float


class LexicalIndex:
    """
    SQLite 倒排索引（无 LLM、无额外服务）：
    - index_upsert 时写入 chunk_terms
    - search 时按简单 BM25-ish 打分取 topN
    """

    def __init__(self, db_path: str) -> None:
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
        self._init_db()

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._conn() as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA synchronous=NORMAL;")
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS chunks (
                  chunk_id TEXT PRIMARY KEY,
                  doc_type TEXT,
                  url TEXT,
                  title TEXT,
                  subtype TEXT,
                  len INTEGER NOT NULL
                );
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS term_stats (
                  term TEXT PRIMARY KEY,
                  df INTEGER NOT NULL
                );
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS chunk_terms (
                  term TEXT NOT NULL,
                  chunk_id TEXT NOT NULL,
                  tf INTEGER NOT NULL,
                  boost REAL NOT NULL,
                  PRIMARY KEY(term, chunk_id)
                );
                """
            )
            conn.execute("CREATE INDEX IF NOT EXISTS idx_chunk_terms_term ON chunk_terms(term);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_chunk_terms_chunk ON chunk_terms(chunk_id);")

    def rebuild_for_chunks(self, chunks: list[dict[str, Any]]) -> None:
        """
        简单策略：对传入 chunks 做“覆盖式 upsert”。
        - 删除这些 chunk_id 的旧 term 映射
        - 写入新的 term/tf/boost
        - 同步更新 term df（只对受影响 term 重新计数）
        """
        if not chunks:
            return

        # 收集新数据与受影响 term
        new_rows: list[tuple[str, str, int, float]] = []
        chunk_meta_rows: list[tuple[str, str, str, str, str, int]] = []
        affected_terms: set[str] = set()
        affected_chunk_ids: list[str] = []

        for ch in chunks:
            cid = str(ch.get("id") or "").strip()
            if not cid:
                continue
            affected_chunk_ids.append(cid)
            title = str((ch.get("metadata") or {}).get("title") or "")
            url = str((ch.get("metadata") or {}).get("url") or "")
            doc_type = str((ch.get("metadata") or {}).get("doc_type") or "")
            subtype = str((ch.get("metadata") or {}).get("subtype") or "")
            text = str(ch.get("text") or "")

            # token：标题权重大，正文权重小（避免正文噪声过大）
            title_terms = _extract_terms(title)
            url_terms = _extract_terms(url)
            subtype_terms = _extract_terms(subtype)
            body_terms = _extract_terms(text[:2000])

            tf: dict[str, int] = {}
            boost: dict[str, float] = {}

            def add_terms(terms: Iterable[str], b: float) -> None:
                for t in terms:
                    tf[t] = tf.get(t, 0) + 1
                    boost[t] = max(boost.get(t, 0.0), b)

            # 对代码/路径类 token 额外 boost（更硬命中）
            def is_codeish(term: str) -> bool:
                return bool(_re_codeish.search(term))

            def add_terms2(terms: Iterable[str], b: float) -> None:
                for t in terms:
                    tf[t] = tf.get(t, 0) + 1
                    bb = b * (1.25 if is_codeish(t) else 1.0)
                    boost[t] = max(boost.get(t, 0.0), bb)

            add_terms2(title_terms, 2.4)
            add_terms2(url_terms, 1.7)
            add_terms2(subtype_terms, 1.5)
            add_terms2(body_terms, 1.0)

            length = max(1, len(_extract_terms(text)))
            chunk_meta_rows.append((cid, doc_type, url, title, subtype, length))

            for term, cnt in tf.items():
                affected_terms.add(term)
                new_rows.append((term, cid, int(cnt), float(boost.get(term, 1.0))))

        if not affected_chunk_ids:
            return

        with self._conn() as conn:
            # 删除旧映射
            conn.executemany("DELETE FROM chunk_terms WHERE chunk_id = ?;", [(cid,) for cid in affected_chunk_ids])
            conn.executemany("DELETE FROM chunks WHERE chunk_id = ?;", [(cid,) for cid in affected_chunk_ids])

            # 写入 chunk 元信息
            conn.executemany(
                "INSERT OR REPLACE INTO chunks(chunk_id, doc_type, url, title, subtype, len) VALUES(?,?,?,?,?,?);",
                chunk_meta_rows,
            )

            # 写入 term 映射
            if new_rows:
                conn.executemany(
                    "INSERT OR REPLACE INTO chunk_terms(term, chunk_id, tf, boost) VALUES(?,?,?,?);",
                    new_rows,
                )

            # 重新计算受影响 term 的 df
            for term in affected_terms:
                row = conn.execute(
                    "SELECT COUNT(DISTINCT chunk_id) AS c FROM chunk_terms WHERE term = ?;",
                    (term,),
                ).fetchone()
                df = int(row["c"] or 0)
                conn.execute("INSERT OR REPLACE INTO term_stats(term, df) VALUES(?,?);", (term, df))

    def search(
        self,
        query: str,
        *,
        allowed_doc_types: list[str] | None = None,
        scope: str | None = None,
        limit: int = 50,
    ) -> list[LexicalHit]:
        terms = _extract_terms(query)
        if not terms:
            return []

        allow = set(allowed_doc_types or [])
        scope = (scope or "").strip()

        with self._conn() as conn:
            # N：文档总数
            row = conn.execute("SELECT COUNT(1) AS n FROM chunks;").fetchone()
            N = float(row["n"] or 1.0)

            # 平均长度
            row = conn.execute("SELECT AVG(len) AS a FROM chunks;").fetchone()
            avg_len = float(row["a"] or 50.0)

            # 取候选：对每个 term 把 (chunk_id, tf, boost, len, doc_type, url, df) 拉出来
            # 之后在 Python 侧聚合 BM25-ish 分数（小数据很快）
            qmarks = ",".join(["?"] * len(terms))
            rows = conn.execute(
                f"""
                SELECT ct.term, ct.chunk_id, ct.tf, ct.boost,
                       c.len, c.doc_type, c.url,
                       ts.df
                FROM chunk_terms ct
                JOIN chunks c ON c.chunk_id = ct.chunk_id
                LEFT JOIN term_stats ts ON ts.term = ct.term
                WHERE ct.term IN ({qmarks});
                """,
                tuple(terms),
            ).fetchall()

        # 打分（BM25-ish + boost）
        k1 = 1.2
        b = 0.75
        scores: dict[str, float] = {}

        for r in rows:
            doc_type = str(r["doc_type"] or "")
            if allow and doc_type and doc_type not in allow:
                continue

            url = str(r["url"] or "")
            # scope 粗过滤：与现有向量 where 保持一致的逻辑
            if scope == "planner" and url != "/planner":
                continue
            if scope == "diary_love" and url != "/diary/love":
                continue
            if scope == "diary_research" and url != "/diary/research":
                continue

            tf = float(r["tf"] or 0.0)
            if tf <= 0:
                continue

            df = float(r["df"] or 0.0)
            # idf 平滑
            idf = math.log(1.0 + (N - df + 0.5) / (df + 0.5))

            dl = float(r["len"] or 1.0)
            denom = tf + k1 * (1.0 - b + b * (dl / max(1.0, avg_len)))
            bm25 = idf * (tf * (k1 + 1.0)) / max(1e-6, denom)

            boost = float(r["boost"] or 1.0)
            cid = str(r["chunk_id"])
            scores[cid] = scores.get(cid, 0.0) + bm25 * boost

        hits = [LexicalHit(chunk_id=k, score=v) for k, v in scores.items()]
        hits.sort(key=lambda x: x.score, reverse=True)
        return hits[: max(1, min(int(limit), 200))]

    def delete_chunks(self, chunk_ids: list[str]) -> None:
        ids = [str(x).strip() for x in (chunk_ids or []) if str(x).strip()]
        if not ids:
            return
        with self._conn() as conn:
            affected_terms: set[str] = set()
            for cid in ids:
                rows = conn.execute("SELECT term FROM chunk_terms WHERE chunk_id = ?;", (cid,)).fetchall()
                for r in rows:
                    affected_terms.add(str(r[0]))
            conn.executemany("DELETE FROM chunk_terms WHERE chunk_id = ?;", [(cid,) for cid in ids])
            conn.executemany("DELETE FROM chunks WHERE chunk_id = ?;", [(cid,) for cid in ids])
            for term in affected_terms:
                row = conn.execute("SELECT COUNT(*) FROM chunk_terms WHERE term = ?;", (term,)).fetchone()
                df = int(row[0]) if row else 0
                if df <= 0:
                    conn.execute("DELETE FROM term_stats WHERE term = ?;", (term,))
                else:
                    conn.execute("INSERT OR REPLACE INTO term_stats(term, df) VALUES(?, ?);", (term, df))

    def delete_by_doc(self, doc_type: str, doc_id: str) -> int:
        dt = str(doc_type or "").strip()
        did = str(doc_id or "").strip()
        if not dt or not did:
            return 0
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT chunk_id FROM chunks WHERE doc_type = ? AND chunk_id LIKE ?;",
                (dt, f"{dt}:{did}:%"),
            ).fetchall()
            ids = [str(r[0]) for r in rows if r and r[0]]
        if not ids:
            prefix = f"{dt}:{did}:"
            with self._conn() as conn:
                rows = conn.execute("SELECT chunk_id FROM chunks WHERE chunk_id LIKE ?;", (prefix + "%",)).fetchall()
                ids = [str(r[0]) for r in rows if r and r[0]]
        self.delete_chunks(ids)
        return len(ids)

    def clear_all(self) -> None:
        with self._conn() as conn:
            conn.execute("DELETE FROM chunk_terms;")
            conn.execute("DELETE FROM chunks;")
            conn.execute("DELETE FROM term_stats;")

