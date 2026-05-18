@echo off
REM 双击或 CMD 中运行：一键检查库表 + 打开后端 Air + 前端 dev（各独立窗口）
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-dev.ps1" %*
