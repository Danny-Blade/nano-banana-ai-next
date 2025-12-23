# Nano Banana AI

AI 图像生成平台，基于 Next.js 16 + Cloudflare Workers 部署。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **部署**: Cloudflare Workers + D1 数据库
- **认证**: NextAuth.js (Google OAuth)
- **语言**: TypeScript, React 19

## 项目结构

```
src/
├── app/           # Next.js App Router 页面
├── components/    # React 组件
│   ├── Dashboard.tsx       # 主控制面板（生图/批量/对比/历史）
│   ├── ImageHistory.tsx    # 历史记录组件
│   └── ...
├── hooks/         # 自定义 Hooks
│   └── useImageHistory.ts  # 历史记录状态管理
├── lib/           # 工具库
│   ├── auth.ts    # 认证配置
│   ├── d1.ts      # D1 数据库
│   └── i18n/      # 国际化
└── types/         # TypeScript 类型
```

## 常用命令

```bash
yarn dev              # 本地开发
yarn build:local      # 本地构建
yarn d1:migrate:local # 运行本地数据库迁移
```

## 环境变量

配置文件: `.dev.vars` (本地) / `.env.local`

必需变量:
- `D1_DATABASE_ID` - Cloudflare D1 数据库 ID
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `NEXTAUTH_SECRET` - NextAuth 密钥

## 核心功能模块

1. **图像生成 (Generate)**: 单张图片生成，支持参考图
2. **批量生成 (Batch)**: 多提示词批量生图
3. **模型对比 (Compare)**: 双模型同提示词对比
4. **历史记录 (History)**: 本地存储生成历史

## 代码规范

- 组件使用 CSS Modules (`*.module.css`)
- 使用 `useI18n` hook 进行国际化
- 客户端组件需添加 `"use client"` 指令
