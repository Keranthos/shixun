# UTF-8 with BOM for Windows PowerShell 5.x
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".env")) {
  Write-Host "[agent] Missing .env - copy from .env.example and set GOOGLE_API_KEY" -ForegroundColor Red
  exit 1
}

# 从 .env 注入代理（conda run 经常拿不到父 shell 的环境变量）
Get-Content ".env" -Encoding UTF8 | ForEach-Object {
  $line = $_.Trim()
  if ($line -match '^\s*GEMINI_HTTPS_PROXY\s*=\s*(.+)\s*$') {
    $p = $matches[1].Trim().Trim('"').Trim("'")
    if ($p -and $p -notmatch '^\s*#') {
      $env:GEMINI_HTTPS_PROXY = $p
      $env:HTTPS_PROXY = $p
    }
  }
  if ($line -match '^\s*HTTPS_PROXY\s*=\s*(.+)\s*$') {
    $p = $matches[1].Trim().Trim('"').Trim("'")
    if ($p -and $p -notmatch '^\s*#') {
      $env:HTTPS_PROXY = $p
      if (-not $env:GEMINI_HTTPS_PROXY) { $env:GEMINI_HTTPS_PROXY = $p }
    }
  }
}

if (-not $env:GEMINI_HTTPS_PROXY -and -not $env:HTTPS_PROXY) {
  try {
    $ie = Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
    if ($ie.ProxyEnable -eq 1 -and $ie.ProxyServer) {
      $ps = [string]$ie.ProxyServer
      if ($ps -match '^https?://') {
        $env:HTTPS_PROXY = $ps
      } elseif ($ps -match ':') {
        $env:HTTPS_PROXY = "http://$ps"
      } else {
        $env:HTTPS_PROXY = "http://${ps}:7890"
      }
      Write-Host "[agent] HTTPS_PROXY=$($env:HTTPS_PROXY)" -ForegroundColor DarkGray
    }
  } catch {
    # ignore registry errors
  }
}

$conda = Get-Command conda -ErrorAction SilentlyContinue
if ($conda) {
  Write-Host "[agent] Checking conda env: agent ..." -ForegroundColor Cyan
  $envList = conda env list 2>&1 | Out-String
  if ($envList -notmatch '\bagent\b') {
    Write-Host "[agent] Creating conda env agent (python 3.11) ..." -ForegroundColor Yellow
    conda create -n agent python=3.11 -y
  }

  $stamp = Join-Path $PSScriptRoot ".pip_ok"
  $req = Join-Path $PSScriptRoot "requirements.txt"
  $skipPip = ($env:AGENT_SKIP_PIP -eq "1")
  if ($skipPip -and (Test-Path $stamp) -and (Test-Path $req)) {
    if ((Get-Item $stamp).LastWriteTime -ge (Get-Item $req).LastWriteTime) {
      Write-Host "[agent] Skip pip (deps OK). Set AGENT_FORCE_PIP=1 to reinstall." -ForegroundColor DarkGray
    } else {
      $skipPip = $false
    }
  } else {
    $skipPip = $false
  }
  if (-not $skipPip) {
    Write-Host "[agent] pip install -r requirements.txt ..." -ForegroundColor Cyan
    conda run -n agent pip install -r requirements.txt -q
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Get-Date | Set-Content $stamp -Encoding utf8
  }

  Write-Host "[agent] Starting uvicorn on http://127.0.0.1:8766 ..." -ForegroundColor Green
  if ($env:GEMINI_HTTPS_PROXY) {
    Write-Host "[agent] GEMINI_HTTPS_PROXY=$($env:GEMINI_HTTPS_PROXY)" -ForegroundColor DarkGray
  }
  $proxyEnv = @()
  if ($env:GEMINI_HTTPS_PROXY) {
    $proxyEnv += @("--env", "GEMINI_HTTPS_PROXY=$($env:GEMINI_HTTPS_PROXY)", "--env", "HTTPS_PROXY=$($env:GEMINI_HTTPS_PROXY)")
  }
  conda run -n agent --no-capture-output @proxyEnv uvicorn app.main:app --reload --host 127.0.0.1 --port 8766
  exit $LASTEXITCODE
}

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
  Write-Host "[agent] conda and python not found" -ForegroundColor Red
  exit 1
}

$stamp = Join-Path $PSScriptRoot ".pip_ok"
$req = Join-Path $PSScriptRoot "requirements.txt"
$doPip = -not (($env:AGENT_SKIP_PIP -eq "1") -and (Test-Path $stamp) -and (Test-Path $req) -and ((Get-Item $stamp).LastWriteTime -ge (Get-Item $req).LastWriteTime))
if ($doPip) {
  Write-Host "[agent] pip install (system python) ..." -ForegroundColor Cyan
  python -m pip install -r requirements.txt -q
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Get-Date | Set-Content $stamp -Encoding utf8
} else {
  Write-Host "[agent] Skip pip (deps OK)." -ForegroundColor DarkGray
}

Write-Host "[agent] Starting uvicorn on http://127.0.0.1:8766 ..." -ForegroundColor Green
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8766
