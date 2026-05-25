# The-Life · 人生分岔路

Vue 3 前端 + Fastify/Prisma 后端，支持人物建模、命轨树、衍化选路、对比、论道与终局报告。

## 结构

| 目录 | 说明 |
|------|------|
| `The-Life-main/` | 前端（Vite + Vue 3） |
| `server/` | 后端 API（Fastify + Prisma + SQLite） |

## 快速启动

### 后端

```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

API：`http://localhost:3001/api`

### 前端

```bash
cd The-Life-main
npm install
npm run dev
```

应用：`http://localhost:3000`（Vite 已代理 `/api` → 3001）

### Ollama

默认模型见 `server/.env.example`（`OLLAMA_MODEL`）。需本地运行 [Ollama](https://ollama.com)。

## 环境变量

见 `server/.env.example`。
