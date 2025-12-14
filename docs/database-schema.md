# 数据库关系图和设计文档

## 数据库关系图

```mermaid
erDiagram
    users {
        TEXT id PK "UUID主键"
        TEXT email UK "邮箱唯一"
        TEXT name "显示名称"
        TEXT avatar_url "头像URL"
        INTEGER credits_balance "积分余额"
        INTEGER created_at "创建时间"
        INTEGER updated_at "更新时间"
    }

    oauth_accounts {
        TEXT id PK
        TEXT user_id FK "关联用户"
        TEXT provider "OAuth提供商"
        TEXT provider_account_id "提供商账号ID"
        INTEGER created_at
    }

    model_pricing {
        TEXT model_key PK "模型唯一标识"
        INTEGER credits_per_image "每张图积分"
        INTEGER enabled "是否启用"
        INTEGER updated_at
    }

    products {
        TEXT id PK "商品ID"
        TEXT type "subscription|one_time"
        TEXT name "商品名称"
        INTEGER credits "积分数"
        INTEGER active "是否上架"
        TEXT provider_product_ref "JSON:提供商商品映射"
        INTEGER created_at
        INTEGER updated_at
    }

    orders {
        TEXT id PK "订单ID"
        TEXT user_id FK "下单用户"
        TEXT provider "creem|stripe"
        TEXT provider_order_id "提供商订单ID"
        TEXT type "订阅|一次性"
        TEXT product_id FK "关联商品"
        TEXT status "订单状态"
        INTEGER amount "金额(分)"
        TEXT currency "币种"
        INTEGER created_at
        INTEGER updated_at
    }

    subscriptions {
        TEXT id PK "订阅ID"
        TEXT user_id FK "订阅用户"
        TEXT provider "支付提供商"
        TEXT provider_customer_id "提供商客户ID"
        TEXT provider_subscription_id "提供商订阅ID"
        TEXT status "订阅状态"
        INTEGER current_period_start "当前周期开始"
        INTEGER current_period_end "当前周期结束"
        INTEGER canceled_at "取消时间"
        INTEGER ended_at "结束时间"
        INTEGER created_at
        INTEGER updated_at
    }

    provider_events {
        TEXT id PK "事件ID"
        TEXT provider "提供商"
        TEXT event_id "提供商事件ID"
        INTEGER received_at "接收时间"
    }

    credit_ledger {
        TEXT id PK "流水ID"
        TEXT user_id FK "用户ID"
        INTEGER delta "积分变动"
        TEXT reason "变动原因"
        TEXT ref_provider "引用来源"
        TEXT ref_id "引用ID"
        INTEGER created_at "创建时间"
    }

    generation_jobs {
        TEXT id PK "任务ID"
        TEXT user_id FK "发起用户"
        TEXT model_key "使用模型"
        INTEGER cost_credits "消耗积分"
        TEXT prompt "提示词"
        TEXT aspect_ratio "宽高比"
        TEXT image_size "图像尺寸"
        TEXT status "任务状态"
        TEXT error "错误信息"
        TEXT output_r2_key "R2存储Key"
        INTEGER created_at
        INTEGER updated_at
    }

    %% 关系定义
    users ||--o{ oauth_accounts : "一个用户多个OAuth账号"
    users ||--o{ orders : "一个用户多个订单"
    users ||--o{ subscriptions : "一个用户一个订阅"
    users ||--o{ credit_ledger : "一个用户多条积分流水"
    users ||--o{ generation_jobs : "一个用户多个生成任务"

    products ||--o{ orders : "一个商品多个订单"

    orders }o--|| subscriptions : "订单可能关联订阅"

    %% 唯一约束
    oauth_accounts {
        UNIQUE(provider, provider_account_id)
    }
    orders {
        UNIQUE(provider, provider_order_id)
    }
    subscriptions {
        UNIQUE(provider, provider_subscription_id)
    }
    provider_events {
        UNIQUE(provider, event_id)
    }
    credit_ledger {
        UNIQUE(reason, ref_provider, ref_id)
    }
```

## 详细表结构设计

### 1. 用户和认证相关

#### users 表 - 用户主表
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,                           -- UUID v4
    email TEXT NOT NULL UNIQUE,                    -- 邮箱，用于登录
    name TEXT,                                     -- 显示名称
    avatar_url TEXT,                               -- 头像URL
    credits_balance INTEGER NOT NULL DEFAULT 0,    -- 积分余额缓存
    created_at INTEGER NOT NULL,                   -- Unix时间戳
    updated_at INTEGER NOT NULL                    -- Unix时间戳
);

-- 索引
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_created_at_idx ON users(created_at);
```

**字段说明:**
- `id`: UUID v4，用户唯一标识
- `email`: 邮箱，唯一索引，用于登录和找回
- `credits_balance`: 积分余额，冗余字段便于快速查询
- `created_at/updated_at`: Unix秒级时间戳

#### oauth_accounts 表 - OAuth绑定
```sql
CREATE TABLE oauth_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,                    -- 'google' | 'facebook'
    provider_account_id TEXT NOT NULL,         -- 第三方账号ID
    created_at INTEGER NOT NULL,
    UNIQUE(provider, provider_account_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX oauth_accounts_user_id_idx ON oauth_accounts(user_id);
CREATE INDEX oauth_accounts_provider_idx ON oauth_accounts(provider);
```

### 2. 模型和商品配置

#### model_pricing 表 - 模型计费
```sql
CREATE TABLE model_pricing (
    model_key TEXT PRIMARY KEY,                     -- 'nano-banana' | 'flux-kontext-pro'
    credits_per_image INTEGER NOT NULL,             -- 每张图积分
    enabled INTEGER NOT NULL DEFAULT 1,             -- 是否启用
    updated_at INTEGER NOT NULL
);

-- 默认数据
INSERT OR IGNORE INTO model_pricing(model_key, credits_per_image, enabled, updated_at)
VALUES
    ('nano-banana', 2, 1, strftime('%s','now')),
    ('nano-banana-pro', 4, 1, strftime('%s','now')),
    ('seedream-4-0', 5, 1, strftime('%s','now')),
    ('sora-image', 6, 1, strftime('%s','now')),
    ('flux-kontext-pro', 3, 1, strftime('%s','now')),
    ('flux-kontext-max', 8, 1, strftime('%s','now'));
```

#### products 表 - 商品管理
```sql
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('subscription', 'one_time')),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    provider_product_ref TEXT,                    -- JSON: {creem:{price_id:...}, stripe:{price_id:...}}
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 示例数据
INSERT OR IGNORE INTO products(id, type, name, credits, created_at, updated_at)
VALUES
    ('starter-pack', 'one_time', '新手积分包(100积分)', 100, strftime('%s','now'), strftime('%s','now')),
    ('pro-pack', 'one_time', '专业积分包(500积分)', 500, strftime('%s','now'), strftime('%s','now')),
    ('basic-monthly', 'subscription', '基础月度订阅', 200, strftime('%s','now'), strftime('%s','now')),
    ('pro-monthly', 'subscription', '专业月度订阅', 500, strftime('%s','now'), strftime('%s','now'));
```

### 3. 订单和订阅

#### orders 表 - 订单记录
```sql
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('creem', 'stripe')),
    provider_order_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('subscription', 'one_time')),
    product_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
    amount INTEGER CHECK (amount >= 0),            -- 金额(分)
    currency TEXT CHECK (length(currency) = 3),    -- ISO 4217
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(provider, provider_order_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 索引
CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_at_idx ON orders(created_at);
```

#### subscriptions 表 - 订阅管理
```sql
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('creem', 'stripe')),
    provider_customer_id TEXT,
    provider_subscription_id TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_start INTEGER,
    current_period_end INTEGER,
    canceled_at INTEGER,
    ended_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(provider, provider_subscription_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);
CREATE INDEX subscriptions_period_end_idx ON subscriptions(current_period_end);
```

### 4. 积分和任务系统

#### credit_ledger 表 - 积分流水账本
```sql
CREATE TABLE credit_ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    delta INTEGER NOT NULL,                        -- 正数:增加, 负数:扣除
    reason TEXT NOT NULL,                          -- 'purchase' | 'generation' | 'refund' | 'subscription'
    ref_provider TEXT NOT NULL DEFAULT 'internal', -- 'internal' | 'creem' | 'stripe'
    ref_id TEXT NOT NULL,                          -- 关联的业务ID
    created_at INTEGER NOT NULL,
    UNIQUE(reason, ref_provider, ref_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX credit_ledger_user_id_idx ON credit_ledger(user_id);
CREATE INDEX credit_ledger_created_at_idx ON credit_ledger(created_at);
CREATE INDEX credit_ledger_reason_idx ON credit_ledger(reason);
```

#### generation_jobs 表 - 生成任务
```sql
CREATE TABLE generation_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    model_key TEXT NOT NULL,
    cost_credits INTEGER NOT NULL,
    prompt TEXT NOT NULL,                         -- 提示词(可能有敏感信息)
    aspect_ratio TEXT CHECK (
        aspect_ratio IN ('1:1', '16:9', '9:16', '4:3')
    ),
    image_size TEXT CHECK (
        image_size IN ('1K', '2K', '4K')
    ),
    status TEXT NOT NULL CHECK (
        status IN ('queued', 'running', 'succeeded', 'failed')
    ),
    error TEXT,
    output_r2_key TEXT,                          -- R2对象Key(可选)
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX generation_jobs_user_id_idx ON generation_jobs(user_id);
CREATE INDEX generation_jobs_status_idx ON generation_jobs(status);
CREATE INDEX generation_jobs_model_key_idx ON generation_jobs(model_key);
CREATE INDEX generation_jobs_created_at_idx ON generation_jobs(created_at);
```

### 5. 系统和事件

#### provider_events 表 - Webhook事件幂等
```sql
CREATE TABLE provider_events (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL CHECK (provider IN ('creem', 'stripe')),
    event_id TEXT NOT NULL,
    received_at INTEGER NOT NULL,
    UNIQUE(provider, event_id)
);

-- 索引
CREATE INDEX provider_events_provider_idx ON provider_events(provider);
CREATE INDEX provider_events_received_at_idx ON provider_events(received_at);
```

## 数据完整性约束

### 1. 外键约束
- 所有外键都设置了适当的 `ON DELETE` 动作
- `CASCADE`: 删除用户时清理相关数据
- `SET NULL`: 删除商品时不删除历史订单

### 2. 唯一约束
- 防止重复OAuth绑定
- 防止重复处理Webhook事件
- 防止重复积分记账
- 防止重复订单记录

### 3. 检查约束
- 枚举值验证(状态、类型等)
- 数值范围验证(积分、金额等)
- 格式验证(货币代码等)

## 索引策略

### 1. 主键索引
- 所有表都有主键索引

### 2. 唯一索引
- 业务唯一性约束

### 3. 查询索引
- 用户相关查询(user_id)
- 状态查询(status)
- 时间范围查询(created_at)
- 关联查询(foreign key)

## 性能优化

### 1. 查询优化
```sql
-- 用户积分和订阅查询
SELECT
    u.id, u.email, u.name, u.credits_balance,
    s.status as subscription_status,
    s.current_period_end
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE u.id = ?;

-- 用户历史任务查询(分页)
SELECT id, model_key, status, created_at
FROM generation_jobs
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 20 OFFSET ?;
```

### 2. 统计查询
```sql
-- 用户积分统计
SELECT
    COUNT(*) as total_transactions,
    SUM(CASE WHEN delta > 0 THEN delta ELSE 0 END) as total_credits_earned,
    SUM(CASE WHEN delta < 0 THEN delta ELSE 0 END) as total_credits_spent
FROM credit_ledger
WHERE user_id = ?;

-- 模型使用统计
SELECT
    model_key,
    COUNT(*) as total_jobs,
    SUM(cost_credits) as total_credits_spent,
    AVG(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as success_rate
FROM generation_jobs
WHERE created_at >= ? AND created_at <= ?
GROUP BY model_key;
```

### 3. 数据清理
```sql
-- 清理过期的Webhook事件(保留30天)
DELETE FROM provider_events
WHERE received_at < (strftime('%s','now') - 30*24*3600);

-- 清理失败的生成任务(保留90天)
DELETE FROM generation_jobs
WHERE status = 'failed'
AND updated_at < (strftime('%s','now') - 90*24*3600);
```

## 数据迁移和版本控制

### 1. 迁移文件命名
- `0001_init.sql` - 初始化数据库
- `0002_add_user_fields.sql` - 添加用户字段
- `0003_migrate_subscription_data.sql` - 数据迁移

### 2. 迁移脚本模板
```sql
-- migration: 0002_add_user_fields.sql
BEGIN TRANSACTION;

-- 添加新字段
ALTER TABLE users ADD COLUMN phone_number TEXT;
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';

-- 创建新索引
CREATE INDEX users_phone_number_idx ON users(phone_number);

-- 更新现有数据(可选)
UPDATE users SET timezone = 'UTC' WHERE timezone IS NULL;

COMMIT;
```

### 3. 回滚策略
```sql
-- rollback: 0002_add_user_fields.sql
BEGIN TRANSACTION;

DROP INDEX IF EXISTS users_phone_number_idx;

-- SQLite不支持删除列，需要重建表
-- 在生产环境中需要更复杂的处理逻辑

COMMIT;
```