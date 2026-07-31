"""Gemini / 外网 HTTP 客户端：显式读取 HTTPS 代理，避免 conda 子进程未继承系统梯子。"""

from __future__ import annotations

import logging
import os
import sys

import httpx

log = logging.getLogger("uvicorn.error")

_proxy_logged = False


def _normalize_proxy_url(raw: str) -> str | None:
    v = (raw or "").strip().strip('"').strip("'")
    if not v:
        return None
    if v.startswith("http://") or v.startswith("https://"):
        return v
    if "://" in v:
        return v
    if ":" in v:
        return f"http://{v}"
    return f"http://{v}:7890"


def _windows_ie_proxy() -> str | None:
    if sys.platform != "win32":
        return None
    try:
        import winreg

        with winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Internet Settings",
        ) as key:
            enabled, _ = winreg.QueryValueEx(key, "ProxyEnable")
            if int(enabled or 0) != 1:
                return None
            server, _ = winreg.QueryValueEx(key, "ProxyServer")
        return _normalize_proxy_url(str(server or ""))
    except Exception:
        return None


def _pick_proxy() -> str | None:
    for key in (
        "GEMINI_HTTPS_PROXY",
        "HTTPS_PROXY",
        "https_proxy",
        "HTTP_PROXY",
        "http_proxy",
        "ALL_PROXY",
        "all_proxy",
    ):
        v = _normalize_proxy_url(os.getenv(key) or "")
        if v:
            return v
    return _windows_ie_proxy()


def log_proxy_status_once() -> str | None:
    global _proxy_logged
    proxy = _pick_proxy()
    if _proxy_logged:
        return proxy
    _proxy_logged = True
    if proxy:
        log.info("[gemini-http] 使用代理: %s", proxy.split("@")[-1])
    else:
        log.warning(
            "[gemini-http] 未检测到 HTTPS 代理；embedding 易 SSL EOF。"
            "请在 agent/.env 设置 GEMINI_HTTPS_PROXY=http://127.0.0.1:7890 后重启 Agent"
        )
    return proxy


def is_google_gemini_base(api_base: str | None = None) -> bool:
    base = (api_base or os.getenv("GEMINI_API_BASE") or "https://generativelanguage.googleapis.com").strip().rstrip("/")
    return base.endswith("generativelanguage.googleapis.com")


def gemini_http_client(*, timeout: httpx.Timeout | float | None = 30.0) -> httpx.Client:
    """直连 Google 时使用（可带本地 HTTPS 代理）。"""
    proxy = log_proxy_status_once()
    if isinstance(timeout, (int, float)):
        timeout = httpx.Timeout(float(timeout), connect=min(10.0, float(timeout)))
    kwargs: dict = {"timeout": timeout, "trust_env": True}
    if proxy:
        kwargs["proxy"] = proxy
    return httpx.Client(**kwargs)


def gemini_httpx_client(*, timeout: httpx.Timeout | float | None = 30.0) -> httpx.Client:
    """
    与 blog 一致：走 GEMINI_API_BASE 反代时用普通 httpx，不强制 Clash；
    仅直连 Google 官方域名时才启用 GEMINI_HTTPS_PROXY。
    """
    if is_google_gemini_base():
        return gemini_http_client(timeout=timeout)
    if isinstance(timeout, (int, float)):
        timeout = httpx.Timeout(float(timeout), connect=min(10.0, float(timeout)))
    return httpx.Client(timeout=timeout, trust_env=True)
