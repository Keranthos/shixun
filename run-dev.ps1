<#
  One command: dbcheck (optional) + backend Air + frontend npm run serve (each in a new window).
  From repo root (shixun):
    powershell -ExecutionPolicy Bypass -File .\run-dev.ps1
  Switches:
    -SkipDbCheck   Skip MySQL table check
    -SkipFrontend  Backend only
  Note: File is UTF-8 with BOM so Windows PowerShell 5.x -File parses Chinese comments correctly.
#>
param(
  [switch]$SkipDbCheck,
  [switch]$SkipFrontend
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backend = Join-Path $root "softeng-platform\softeng-platform"
$frontend = Join-Path $root "softeng-platform-frontend"

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
Write-Host "已在新窗口启动。API http://localhost:8080  前端 http://localhost:3000" -ForegroundColor White
