# 从 blog 的 agent/.env 同步 Gemini 相关配置到本目录 .env（两项目互不共享，需手动或本脚本）
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$blogEnv = "D:\blog\agent\.env"
$target = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $blogEnv)) {
  Write-Host "[sync] 未找到 blog 配置: $blogEnv" -ForegroundColor Red
  Write-Host "      请确认 blog 路径，或手动把 GEMINI_API_BASE / GEMINI_PROXY_TOKEN / GOOGLE_API_KEY 复制到 shixun\agent\.env" -ForegroundColor Yellow
  exit 1
}

$keys = @(
  "GOOGLE_API_KEY", "GEMINI_API_KEY",
  "GEMINI_API_BASE", "GEMINI_PROXY_TOKEN", "GEMINI_HTTPS_PROXY",
  "HTTPS_PROXY", "HTTP_PROXY",
  "GEMINI_EMBED_MODEL", "GEMINI_CHAT_MODEL", "GEMINI_TEMPERATURE",
  "GEMINI_EMBED_BATCH_SIZE", "GEMINI_EMBED_TIMEOUT_S", "GEMINI_EMBED_RETRIES"
)

$fromBlog = @{}
Get-Content $blogEnv -Encoding UTF8 | ForEach-Object {
  $line = $_.Trim()
  if ($line -eq "" -or $line.StartsWith("#")) { return }
  if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
    $k = $matches[1]
    $v = $matches[2].Trim().Trim('"').Trim("'")
    if ($keys -contains $k -and $v) {
      $fromBlog[$k] = $v
    }
  }
}

if ($fromBlog.Count -eq 0) {
  Write-Host "[sync] blog .env 中未找到可同步的 Gemini 项" -ForegroundColor Yellow
  exit 1
}

$existing = @{}
if (Test-Path $target) {
  Get-Content $target -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
      $existing[$matches[1]] = $matches[2]
    } else {
      $existing["__line__$($existing.Count)"] = $line
    }
  }
}

if (-not (Test-Path $target)) {
  Copy-Item ".env.example" $target -ErrorAction SilentlyContinue
}

$lines = New-Object System.Collections.Generic.List[string]
if (Test-Path $target) {
  $lines.AddRange([string[]](Get-Content $target -Encoding UTF8))
}

$updated = @()
foreach ($k in $fromBlog.Keys) {
  $v = $fromBlog[$k]
  $pattern = "^\s*$([regex]::Escape($k))\s*="
  $idx = -1
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match $pattern) { $idx = $i; break }
  }
  $newLine = "$k=$v"
  if ($idx -ge 0) {
    $lines[$idx] = $newLine
  } else {
    $lines.Add($newLine)
  }
  $updated += $k
}

# shixun 固定项（不被 blog 覆盖）
$shixunOnly = @{
  "AGENT_PORT" = "8766"
  "CHROMA_COLLECTION" = "softeng_rag_v1"
  "AGENT_PERSONA_PATH" = "./app/persona/softeng_assistant.md"
}
foreach ($k in $shixunOnly.Keys) {
  $pattern = "^\s*$([regex]::Escape($k))\s*="
  $idx = -1
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match $pattern) { $idx = $i; break }
  }
  $newLine = "$k=$($shixunOnly[$k])"
  if ($idx -ge 0) { $lines[$idx] = $newLine } else { $lines.Add($newLine) }
}

$lines | Set-Content $target -Encoding UTF8
Write-Host "[sync] 已写入 shixun\agent\.env （来自 blog）:" -ForegroundColor Green
$updated | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }

if ($fromBlog.ContainsKey("GEMINI_API_BASE") -and $fromBlog["GEMINI_API_BASE"] -notmatch "generativelanguage\.googleapis\.com") {
  Write-Host "[sync] 检测到 Cloudflare/反代 GEMINI_API_BASE，无需 GEMINI_HTTPS_PROXY（走反代域名）" -ForegroundColor Cyan
} elseif (-not $fromBlog.ContainsKey("GEMINI_HTTPS_PROXY")) {
  Write-Host "[sync] 若仍 SSL EOF，请在 .env 增加 GEMINI_HTTPS_PROXY=http://127.0.0.1:7890" -ForegroundColor Yellow
}

Write-Host "[sync] 请重启 Agent 窗口后再重建索引" -ForegroundColor Cyan
