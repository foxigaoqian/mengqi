# AI 小红书笔记复刻器（AI XHS Recreator）PRD（全面技术版）

## 1. 产品总体描述

### 1.1 产品名称
- **AI XHS Recreator**

### 1.2 产品定位
一款自动抓取小红书笔记内容和图片，并利用大模型（Gemini）生成同主题但表达不同的新笔记（含 AI 图像），可直接复制发布的内容创作工具。

### 1.3 核心价值
- **零输入门槛**：用户仅需输入小红书笔记链接。
- **自动抓取 + 自动生成**：端到端自动化工作流。
- **可直接复制发布**：输出结构和排版建议可直接用于小红书发布。
- **托管部署友好**：GitHub → Vercel + Supabase 一体化上线。

### 1.4 目标用户
- 个人内容创作者
- 小微团队运营者
- 产品尝试者 / 内部工具使用者

---

## 2. 技术选型（标准化 Stack）

### 2.1 前端（UI）
- **框架**：React + Next.js（推荐 Supabase 官方 Next.js Starter）
- **样式**：TailwindCSS / shadcn UI
- **交互与渲染**：React Hooks + Server Components（按场景选择）

> 建议：优先使用 Next.js + Supabase Starter 模板，快速集成 Auth、DB 与环境变量配置。

### 2.2 后端与 API
基于 Next.js App Router 实现服务端逻辑：
- **API 目录**：`app/api/...`
- **爬虫实现**：Puppeteer / Playwright / Axios + Cheerio（按复杂度选型）
- **大模型调用**：Gemini API（文本生成 + 图像能力）

#### 选择理由
- 单仓库统一部署到 Vercel，无需单独维护后端服务器
- 可直接读写 Supabase DB / Storage
- GitHub 推送触发 CI/CD，自动部署

### 2.3 数据库与 BaaS（Supabase）
- **数据库**：Supabase Postgres
- **认证**：Supabase Auth（邮箱密码 + OAuth）
- **对象存储**：Supabase Storage（原图与生成图）

数据用途：
- 存储抓取原始笔记结构化数据
- 存储生成后的文案、标签、图像链接
- 管理用户配额与任务记录

---

## 3. 核心功能设计

### 3.1 用户账号体系（可选但建议）
| 功能 | 说明 |
|---|---|
| 注册 / 登录 | 邮箱密码 + OAuth |
| 用户会话 | JWT / Session |
| 访问控制 | 用户数据隔离 |
| 生成配额 | 限制模型调用次数 |

### 3.2 链接抓取模块
流程：
1. 用户粘贴小红书笔记链接。
2. 后端抓取标题、正文、图片 URL。
3. 数据结构化写入 Supabase。

抓取结果结构：

| 字段 | 类型 | 说明 |
|---|---|---|
| `url` | String | 原笔记链接 |
| `title` | String | 原文标题 |
| `content` | Text | 原文正文 |
| `images` | JSON | 原图链接列表 |
| `created_at` | Timestamp | 抓取时间 |

### 3.3 文案与图像生成模块
流程：
1. 读取抓取文本与图片。
2. 构造 Gemini Prompt（重写文案 + 图像生成提示）。
3. 调用 Gemini API 获取输出。
4. 将结果写入数据库并回传前端。

生成结果结构：

| 字段 | 类型 | 说明 |
|---|---|---|
| `generated_text` | Text | 新文案 |
| `generated_images` | JSON | 生成图片 URL |
| `tags` | JSON | 推荐话题标签 |
| `style` | String | 重写风格 |

### 3.4 图像处理策略
支持三种模式：
- 直接由 Gemini 生成图像
- 基于原图风格进行相似图像生成
- 保留原图（适用于内部参考）

### 3.5 导出与发布草稿
支持导出：
- 可复制文本（含排版建议）
- Markdown
- 图片打包下载
- JSON（供 API 或自动化流程使用）

---

## 4. 系统架构与部署方案

```text
GitHub（源代码）
   ↓ Push 触发 CI/CD
Vercel（Next.js 前后端）
   ↓
Supabase（DB + Auth + Storage）
   ↓
爬虫任务 + Gemini 生成
   ↓
结果回传前端展示与导出
```

环境变量由 Vercel 管理并安全注入运行环境。

---

## 5. 环境变量与安全

建议在 Vercel 中配置：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `GEMINI_API_KEY`

安全策略建议：
- `SERVICE_ROLE_KEY` 仅用于服务端 API。
- 客户端仅暴露 `NEXT_PUBLIC_` 前缀变量。
- 关键接口需鉴权与速率限制。

---

## 6. 开发规范

### 6.1 前端规范
- 使用 Next.js + React + TailwindCSS
- 通过 Supabase 客户端访问 Auth 与数据
- API 调用统一由 `app/api/...` 提供

### 6.2 后端规范
API Routes 负责：
- 链接抓取接口
- 内容与图像生成接口
- 用户历史记录查询接口

长耗时任务建议：
- 下沉至队列机制或边缘函数执行
- 提供任务状态查询接口（pending / running / done / failed）

---

## 7. 性能与运维
- GitHub Push 自动触发部署，支持快速迭代
- Vercel Serverless / Edge 适配轻量运维
- Supabase Studio 用于数据可视化管理

建议增强：
- 对爬虫接口增加缓存与重试策略
- 对模型生成加入并发与配额控制
- 记录链路日志用于故障追踪

---

## 8. 里程碑计划

| 阶段 | 输出内容 |
|---|---|
| 规划 | 完整 PRD |
| 技术准备 | GitHub + Supabase + Vercel 初始化 |
| 核心功能 | 链接抓取 + 内容生成 |
| UI | 输入页 + 结果页 |
| 导出模块 | 文本/Markdown/JSON/图片导出 |
| QA | 功能与稳定性测试 |
| 发布 | 正式上线 |

---

## 9. 验收标准（Definition of Done）

| 条目 | 验收条件 |
|---|---|
| 输入链接 | 成功抓取笔记文本与图片 |
| 模型生成 | 与原主题一致且表达有差异 |
| 输出显示 | 文案与图像渲染正确 |
| 部署 | Vercel 可访问且关键功能可用 |

---

## 10. 推荐起步模板
- 使用 **Supabase 官方 Next.js Starter**：
  - 已集成 Auth、数据库连接与基础 UI
  - 适配 Vercel 部署与环境变量管理

---

## 11. 结论
本 PRD 明确了：
- 技术栈（Next.js + React + Supabase + Gemini）
- 前后端职责边界
- GitHub → Vercel → Supabase 的部署链路
- 可直接落地执行的里程碑和验收标准
