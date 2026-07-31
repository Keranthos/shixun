# 以 UTF-8 重新写入课程摘要与学习路径（避免 PowerShell 管道导致中文变 ?）
# 用法（仓库根目录）: powershell -ExecutionPolicy Bypass -File .\scripts\reimport_course_content.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$sql = Join-Path $root "softeng-platform\softeng-platform\database\seed_course_content_all_19.sql"
if (-not (Test-Path $sql)) {
  Write-Error "未找到: $sql"
}

$patch = Join-Path $root "softeng-platform\softeng-platform\database\patch_course_content_insight.sql"
Write-Host "=== 确保字段存在 ===" -ForegroundColor Cyan
cmd /c "chcp 65001>nul && mysql -h 127.0.0.1 -u root -pWan05609 --default-character-set=utf8mb4 softeng < `"$patch`""

Write-Host "=== 写入 19 门课程摘要与路径（UTF-8）===" -ForegroundColor Cyan
cmd /c "chcp 65001>nul && mysql -h 127.0.0.1 -u root -pWan05609 --default-character-set=utf8mb4 softeng < `"$sql`""

Write-Host "=== 抽样校验 ===" -ForegroundColor Cyan
mysql -h 127.0.0.1 -u root -pWan05609 -D softeng --default-character-set=utf8mb4 -e "SELECT course_id, name, JSON_UNQUOTE(JSON_EXTRACT(learning_path, '$.milestones[0].title')) AS m1 FROM courses WHERE course_id IN (1001,1014) ORDER BY course_id;"
Write-Host "完成。请重启后端（Air 窗口）并刷新浏览器。" -ForegroundColor Green
