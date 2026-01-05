# 本地开发调试指南

本文档说明如何在本地环境中调试项目，包括 Google 登录和 D1 数据库的完整测试。

## 环境要求

- Node.js 18+
- Yarn 1.22+
- Wrangler CLI（通过 npm 自动安装）

## 首次设置

### 1. 复制配置文件

```bash
cp wrangler.dev.toml.example wrangler.dev.toml
cp .dev.vars.example .dev.vars
```

### 2. 配置环境变量

编辑 `.dev.vars` 文件，填入以下必要变量：

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 开发模式绕过登录（可选）
DEV_AUTH_BYPASS=true
DEV_AUTH_EMAIL=your-email@example.com
DEV_AUTH_CREDITS=1000
```

### 3. 配置 wrangler.dev.toml

确保 `database_id` 已填写（从 Cloudflare Dashboard 获取）：

```toml
[[d1_databases]]
binding = "DB"
database_name = "nano_banana_Dev"
database_id = "your-database-id"
```

### 4. 初始化本地数据库

```bash
yarn d1:migrate:local
```

## 启动开发服务器

```bash
yarn dev
```

访问 http://localhost:3000 进行测试。

> **说明**：`yarn dev` 通过 `initOpenNextCloudflareForDev` 自动集成本地 D1 绑定，无需每次都运行构建。数据持久化在 `.wrangler/state/v3` 目录中。

## 本地 D1 数据库操作

### 查询用户信息

```bash
npx wrangler d1 execute nano_banana_Dev --local --config wrangler.dev.toml \
  --command "SELECT * FROM users WHERE email = 'user@example.com';"
```

### 查询所有用户

```bash
npx wrangler d1 execute nano_banana_Dev --local --config wrangler.dev.toml \
  --command "SELECT id, email, name, credits_balance FROM users;"
```

### 更新用户积分

```bash
# 设置用户积分为指定值
npx wrangler d1 execute nano_banana_Dev --local --config wrangler.dev.toml \
  --command "UPDATE users SET credits_balance = 100, updated_at = strftime('%s','now') WHERE email = 'user@example.com';"

# 增加用户积分
npx wrangler d1 execute nano_banana_Dev --local --config wrangler.dev.toml \
  --command "UPDATE users SET credits_balance = credits_balance + 50, updated_at = strftime('%s','now') WHERE email = 'user@example.com';"
```

### 添加积分流水记录

为了保持数据一致性，更新积分时建议同时添加流水记录：

```bash
npx wrangler d1 execute nano_banana_Dev --local --config wrangler.dev.toml \
  --command "INSERT INTO credit_ledger (id, user_id, delta, reason, ref_provider, ref_id, created_at) VALUES ('ledger_dev_$(date +%s)', 'USER_ID_HERE', 100, 'dev_grant', 'internal', 'dev_test', strftime('%s','now'));"
```

### 查询积分流水

```bash
npx wrangler d1 execute nano_banana_Dev --local --config wrangler.dev.toml \
  --command "SELECT * FROM credit_ledger WHERE user_id = 'USER_ID_HERE' ORDER BY created_at DESC;"
```

### 查询生成任务历史

```bash
npx wrangler d1 execute nano_banana_Dev --local --config wrangler.dev.toml \
  --command "SELECT id, model_key, cost_credits, status, created_at FROM generation_jobs WHERE user_id = 'USER_ID_HERE' ORDER BY created_at DESC LIMIT 10;"
```

### 查询数据库表结构

```bash
# 列出所有表
npx wrangler d1 execute nano_banana_Dev --local --config wrangler.dev.toml \
  --command "SELECT name FROM sqlite_master WHERE type='table';"

# 查看表结构
npx wrangler d1 execute nano_banana_Dev --local --config wrangler.dev.toml \
  --command "PRAGMA table_info(users);"
```

### 重置本地数据库

如需完全重置本地数据库：

```bash
# 删除本地数据库文件
rm -rf .wrangler/state/v3/d1

# 重新运行迁移
yarn d1:migrate:local
```

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `yarn dev` | 启动开发服务器（含 D1 绑定） |
| `yarn d1:migrate:local` | 运行本地数据库迁移 |
| `yarn build:local` | 本地构建（不需要生产环境变量） |
| `yarn dev:worker` | 启动完整 Workers 环境（需先 build:local） |

## 故障排查

### D1 报错 "no such table"

确保已运行数据库迁移：

```bash
yarn d1:migrate:local
```

### 登录后积分显示为 0

1. 检查用户是否存在于数据库
2. 使用上述命令手动添加积分

### wrangler dev 报错 "workerdHttp Agent undefined"

使用 `yarn dev` 代替 `yarn dev:worker`。`yarn dev` 通过 Next.js 开发服务器运行，自动集成 D1 绑定，避免 workerd 兼容性问题。

## 相关文档

- [数据库设计](./database-schema.md)
- [认证流程](./auth-flow-diagram.md)
- [架构设计](./architecture-diagram.md)
