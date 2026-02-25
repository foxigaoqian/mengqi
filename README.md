# AI XHS Recreator

一个基于 Next.js 的小红书笔记复刻工具：输入链接后自动抓取内容，再调用 Gemini 生成可直接发布的新文案。

## 功能

- 链接抓取：提取标题、简介、图片链接
- AI 改写：基于 Gemini 生成同主题新文案和标签
- 数据落库：通过 Supabase REST API 写入 `source_notes` 与 `generated_notes`
- 历史记录：查看最近抓取与生成记录
- 导出接口：支持 Markdown/JSON 导出

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 创建环境变量

```bash
cp .env.example .env.local
```

需要配置：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `GEMINI_API_KEY`

3. 启动开发环境

```bash
npm run dev
```

打开：`http://localhost:3000`

## 数据库初始化

访问 `/create` 页面复制 SQL，粘贴到 Supabase SQL Editor 执行。

## API 概览

- `POST /api/crawl`：抓取链接
- `POST /api/generate`：生成新文案
- `GET /api/notes`：历史记录
- `POST /api/export`：导出 markdown/json

## 文档

- 全面技术版 PRD：`docs/ai-xhs-recreator-prd.md`
