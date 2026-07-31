> **⚠️ 本仓库已归档（只读）**  
> 项目已迁入 monorepo：**https://github.com/Keranthos/shixun**  
> 上游来源：[Yangshi408/reader](https://github.com/Yangshi408/reader)  
> 后续开发、Issue 与 PR 请提交到 monorepo。

---

# 软工资源平台 · 前端

Vue 3 + Vuex + Element Plus。本地开发默认 http://localhost:3000 ，API 默认 http://localhost:8080。

完整启动步骤见仓库根目录 [`运行说明.md`](../运行说明.md)。

## 开发

```powershell
npm install
npm run serve
```

## 配置

复制 `.env.example`；开发环境可用 `.env.development` 设置 `VUE_APP_API_BASE`。

## 构建

```powershell
npm run build
```

产物在 `dist/`。
