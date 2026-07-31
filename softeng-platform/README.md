> **⚠️ 本仓库已归档（只读）**  
> 项目已迁入 monorepo：**https://github.com/Keranthos/shixun**  
> 上游来源：[ghy93/softeng-platform](https://github.com/ghy93/softeng-platform)  
> 后续开发、Issue 与 PR 请提交到 monorepo。

---

# 软工资源平台 · 后端

Go + Gin 后端，路径 `softeng-platform/softeng-platform/`。

**本地启动与数据库初始化请优先阅读仓库根目录 [`运行说明.md`](../../运行说明.md)。**

## 配置（`.env`）

复制 `.env.example` 为 `.env`。数据库通过分字段环境变量连接（**非** `DATABASE_URL`）：

| 变量 | 默认 | 说明 |
|------|------|------|
| `PORT` | `8080` | HTTP 端口 |
| `DB_HOST` | `127.0.0.1` | MySQL 主机 |
| `DB_PORT` | `3306` | MySQL 端口 |
| `DB_USER` | `softeng_app` | 应用账号（见 `database/bootstrap_user.sql`） |
| `DB_PASSWORD` | `123456` | 应用密码 |
| `DB_NAME` | `softeng` | 库名 |
| `JWT_SECRET` | — | JWT 签名密钥（必填） |

可选 RAG：`AGENT_BASE_URL`、`AGENT_AUTO_REINDEX` 等，见 `.env.example`。

## 路由概览

- `/auth` — 注册、登录
- `/users` — 个人中心（需登录）
- `/tools`、`/courses`、`/projects` — 三类资源
- `/admin` — 审核（管理员）
- `/api/agent` — RAG 问答与索引管理

## 开发

```powershell
air
# 或
go run .\cmd\server\main.go
```

更完整的架构说明见仓库根目录 `README.md`。
