# 用户积分管理命令

本地 D1 数据库用户积分管理相关命令。

## 数据库信息

- **数据库名称**: `nano_banana`
- **Database ID**: `5212d261-a569-41f3-9b44-c6d6620a3deb`

## 查询用户积分

### 按邮箱查询

```bash
npx wrangler d1 execute nano_banana --local --command "SELECT id, email, name, credits_balance FROM users WHERE email = 'user@example.com';"
```

### 查询所有用户积分

```bash
npx wrangler d1 execute nano_banana --local --command "SELECT id, email, name, credits_balance FROM users;"
```

## 更新用户积分

### 设置用户积分为指定值

```bash
npx wrangler d1 execute nano_banana --local --command "UPDATE users SET credits_balance = 1000, updated_at = strftime('%s','now') WHERE email = 'user@example.com';"
```

### 增加用户积分

```bash
npx wrangler d1 execute nano_banana --local --command "UPDATE users SET credits_balance = credits_balance + 100, updated_at = strftime('%s','now') WHERE email = 'user@example.com';"
```

### 减少用户积分

```bash
npx wrangler d1 execute nano_banana --local --command "UPDATE users SET credits_balance = credits_balance - 50, updated_at = strftime('%s','now') WHERE email = 'user@example.com';"
```

## 远程数据库操作

如需操作远程（生产）数据库，添加 `--remote` 参数：

```bash
npx wrangler d1 execute nano_banana --remote --command "SELECT id, email, name, credits_balance FROM users WHERE email = 'user@example.com';"
```

## 注意事项

- 本地数据库数据存储在 `.wrangler/state/v3/d1/` 目录
- 更新积分时建议同时更新 `updated_at` 字段
- 执行写操作前建议先查询确认用户存在
