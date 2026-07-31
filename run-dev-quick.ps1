# 日常开发快速启动：跳过 dbcheck、不阻塞等待 Agent、Agent 跳过重复 pip
# 用法: powershell -ExecutionPolicy Bypass -File .\run-dev-quick.ps1
& "$PSScriptRoot\run-dev.ps1" -SkipDbCheck -AgentWaitSec 12 -SkipAgentPip
