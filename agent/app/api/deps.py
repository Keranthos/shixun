from fastapi import Header, HTTPException

from app.config import settings


async def verify_internal_token(x_internal_token: str | None = Header(None, alias="X-Internal-Token")) -> None:
    expected = (settings.internal_api_token or "").strip()
    if not expected:
        return
    if not x_internal_token or x_internal_token.strip() != expected:
        raise HTTPException(status_code=401, detail="invalid or missing X-Internal-Token")
