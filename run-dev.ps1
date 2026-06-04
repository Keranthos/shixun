<#
  One command: dbcheck (optional) + backend Air + frontend npm run serve (each in a new window).
  From repo root (shixun):
    powershell -ExecutionPolicy Bypass -File .\run-dev.ps1
  Switches:
    -SkipDbCheck      Skip MySQL table check (saves ~10-30s go compile)
    -SkipFrontend     Backend only
    -SkipAgent        Do not start Python Agent
    -SkipAgentPip     Agent window skips pip if deps already installed
    -AgentWaitSec N   Max seconds to wait for Agent health (0 = do not wait)
  Quick daily dev:   .\run-dev-quick.ps1
  Note: File is UTF-8 with BOM so Windows PowerShell 5.x -File parses Chinese comments correctly.
#>
param(
  [switch]$SkipDbCheck,
  [switch]$SkipFrontend,
  [switch]$SkipAgent,
  [switch]$SkipAgentPip,
  [int]$AgentWaitSec = 45
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backend = Join-Path $root "softeng-platform\softeng-platform"
$frontend = Join-Path $root "softeng-platform-frontend"
$agentDir = Join-Path $root "agent"

if (-not (Test-Path $backend)) {
  Write-Host "未找到后端目录: $backend" -ForegroundColor Red
  exit 1
}

if (-not $SkipDbCheck) {
  Write-Host "=== 检查数据库表 ===" -ForegroundColor Cyan
  Push-Location $backend
  try {
    $out = & go run .\cmd\dbcheck\main.go 2>&1
    Write-Host $out
    if ($LASTEXITCODE -eq 2) {
      Write-Host ""
      Write-Host "提示: 请用 MySQL root 依次执行 database/bootstrap_user.sql、database/schema.sql，再导入演示数据 database/seed_demo.sql（旧库可先执行 database/patch_existing_to_demo.sql）。" -ForegroundColor Yellow
    }
  } catch {
    Write-Host "dbcheck 执行失败（请确认已安装 Go 且在 PATH 中）: $_" -ForegroundColor Yellow
  } finally {
    Pop-Location
  }
  Write-Host ""
}

$air = Get-Command air -ErrorAction SilentlyContinue
if (-not $air) {
  Write-Host "未检测到 air，正在执行: go install github.com/air-verse/air@latest" -ForegroundColor Yellow
  & go install github.com/air-verse/air@latest
  $goBin = Join-Path ([Environment]::GetFolderPath("UserProfile")) "go\bin"
  if (Test-Path $goBin) {
    $env:Path = $goBin + ";" + $env:Path
  }
}

if (-not (Get-Command air -ErrorAction SilentlyContinue)) {
  Write-Host "仍找不到 air，请手动执行: go install github.com/air-verse/air@latest" -ForegroundColor Red
  Write-Host "并将 Go 的 bin 目录（如 %USERPROFILE%\go\bin）加入 PATH 后重试。" -ForegroundColor Red
  exit 1
}

Write-Host "=== 启动后端（Air，新窗口）===" -ForegroundColor Green
$backendCmd = 'Set-Location "' + $backend + '"; Write-Host "Backend (air) - Ctrl+C 停止" -ForegroundColor Magenta; cmd /c air'
Start-Process powershell -WorkingDirectory $backend -ArgumentList @("-NoExit", "-Command", $backendCmd) | Out-Null

Start-Sleep -Seconds 2

function Test-AgentHealth {
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8766/health" -UseBasicParsing -TimeoutSec 3
    return ($r.StatusCode -eq 200)
  } catch {
    return $false
  }
}

if (-not $SkipAgent) {
  if (Test-Path $agentDir) {
    $agentEnv = Join-Path $agentDir ".env"
    if (-not (Test-Path $agentEnv)) {
      Write-Host "跳过 Agent：缺少 agent\.env（可从 agent\.env.example 复制）" -ForegroundColor Yellow
      Write-Host "  → RAG 将只能走 Go 降级模式，无法使用智能体检索。" -ForegroundColor Yellow
    } else {
      $agentCmd = $null
      $condaExe = $null
      $condaBase = $null
      if (Get-Command conda -ErrorAction SilentlyContinue) {
        try {
          $condaBase = (& conda info --base 2>$null | Select-Object -First 1).Trim()
          if ($condaBase -and (Test-Path $condaBase)) {
            $condaExe = Join-Path $condaBase "Scripts\conda.exe"
            if (-not (Test-Path $condaExe)) {
              $condaExe = Join-Path $condaBase "condabin\conda.bat"
            }
          }
        } catch {
          $condaBase = $null
        }
      }

      if ($condaExe -and (Test-Path $condaExe)) {
        Write-Host "=== 启动 LangChain Agent（conda: agent，新窗口，8766）===" -ForegroundColor Green
        # 子窗口用 conda 绝对路径，避免新 PowerShell 未加载 conda 导致 Agent 闪退
        $skipPipLine = ''
        if ($SkipAgentPip) {
          $skipPipLine = "`$env:AGENT_SKIP_PIP='1'; "
        }
        $agentCmd = @"
Set-Location '$agentDir'
`$env:PYTHONUTF8='1'
$skipPipLine
if (Test-Path '$condaBase\shell\condabin\conda-hook.ps1') { . '$condaBase\shell\condabin\conda-hook.ps1' }
Write-Host '[Agent] Keep this window open. First start may install deps 1-3 min.' -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File .\run_dev.ps1
"@
      } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Host "=== 启动 LangChain Agent（python，新窗口，8766）===" -ForegroundColor Green
        $agentCmd = @"
Set-Location '$agentDir'
Write-Host 'Agent http://127.0.0.1:8766 - Ctrl+C 停止' -ForegroundColor Magenta
python -m pip install -r requirements.txt -q
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8766
"@
      } else {
        Write-Host "跳过 Agent：未安装 conda 或 python" -ForegroundColor Yellow
        Write-Host "  → 请安装 Miniconda/Anaconda 或 Python 3.10+ 后重试。" -ForegroundColor Yellow
      }

      if ($agentCmd) {
        Start-Process powershell -WorkingDirectory $agentDir -ArgumentList @("-NoExit", "-Command", $agentCmd) | Out-Null
        if ($AgentWaitSec -gt 0) {
          Write-Host "等待 Agent 就绪（最多 $AgentWaitSec 秒；日常可用 run-dev-quick.ps1 少等待）..." -ForegroundColor DarkGray
          $ready = $false
          $loops = [Math]::Max(1, [int][Math]::Ceiling($AgentWaitSec / 2))
          for ($i = 0; $i -lt $loops; $i++) {
            Start-Sleep -Seconds 2
            if (Test-AgentHealth) {
              $ready = $true
              break
            }
          }
          if ($ready) {
            Write-Host "Agent 已就绪: http://127.0.0.1:8766/health" -ForegroundColor Green
          } else {
            Write-Host "提示: Agent 仍在后台启动（pip/uvicorn），请稍后看 Agent 窗口；学习助手需 8766 就绪。" -ForegroundColor Yellow
          }
        } else {
          Write-Host "已启动 Agent 窗口（未等待 health，加快脚本返回）。" -ForegroundColor DarkGray
        }
      }
    }
  }
}

if (-not $SkipFrontend) {
  if (-not (Test-Path $frontend)) {
    Write-Host "未找到前端目录: $frontend" -ForegroundColor Red
    exit 1
  }
  if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "=== 首次安装前端依赖 npm install ===" -ForegroundColor Yellow
    Push-Location $frontend
    & npm install
    Pop-Location
  }
  Write-Host "=== 启动前端（npm run serve，新窗口）===" -ForegroundColor Green
  $feCmd = 'Set-Location "' + $frontend + '"; Write-Host "Frontend http://localhost:3000 - Ctrl+C 停止" -ForegroundColor Cyan; npm run serve'
  Start-Process powershell -WorkingDirectory $frontend -ArgumentList @("-NoExit", "-Command", $feCmd) | Out-Null
}

Write-Host ""
Write-Host "已在新窗口启动。API http://localhost:8080  Agent http://127.0.0.1:8766  前端 http://localhost:3000" -ForegroundColor White
Write-Host "RAG：登录后点左下角学习助手；须保持 Agent 窗口打开且上方显示 Agent 已就绪" -ForegroundColor DarkGray
