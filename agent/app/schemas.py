"""与 Go 后端对齐的请求/响应模型。"""

from typing import Any, Literal

from pydantic import BaseModel, Field


DocType = Literal["tool", "course", "project", "comment", "course_resource"]


class Message(BaseModel):
    role: Literal["user", "assistant"] = "user"
    content: str = ""


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(8, ge=1, le=50)
    allowed_doc_types: list[DocType] = Field(
        default_factory=lambda: ["tool", "course", "project", "comment", "course_resource"]
    )
    user_id: int = 0
    user_level: int = 0


class Chunk(BaseModel):
    id: str = ""
    doc_type: DocType = "tool"
    doc_id: str = ""
    title: str | None = None
    url: str | None = None
    snippet: str | None = None
    content: str | None = None
    score: float = 0.0
    reason: str | None = None


class SearchResponse(BaseModel):
    results: list[Chunk] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)


class AnswerRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(8, ge=1, le=50)
    allowed_doc_types: list[DocType] = Field(
        default_factory=lambda: ["tool", "course", "project", "comment", "course_resource"]
    )
    user_id: int = 0
    user_level: int = 0
    history: list[Message] = Field(default_factory=list)


class AnswerResponse(BaseModel):
    answer: str = ""
    used: list[Chunk] = Field(default_factory=list)
    warning: str | None = None
    meta: dict[str, Any] = Field(default_factory=dict)


class IndexChunk(BaseModel):
    id: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)
    embedding: list[float] | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class IndexUpsertRequest(BaseModel):
    chunks: list[IndexChunk] = Field(..., min_length=1)


class IndexUpsertResponse(BaseModel):
    upserted: int
    meta: dict[str, Any] = Field(default_factory=dict)


class IndexStatsResponse(BaseModel):
    chunk_count: int = 0
    lexical_count: int = 0
    meta: dict[str, Any] = Field(default_factory=dict)


class IndexDeleteRequest(BaseModel):
    doc_type: DocType
    doc_id: str = Field(..., min_length=1)


class IndexDeleteResponse(BaseModel):
    deleted: int = 0
    meta: dict[str, Any] = Field(default_factory=dict)


class IndexClearResponse(BaseModel):
    cleared: bool = True
    meta: dict[str, Any] = Field(default_factory=dict)
