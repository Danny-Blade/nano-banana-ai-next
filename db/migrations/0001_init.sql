-- 初始数据库结构（Cloudflare D1 / SQLite）：
-- - OAuth 用户（NextAuth：Google/Facebook）
-- - 积分余额 + 积分流水（可审计）
-- - 订阅 / 一次性购买（先 Creem，后 Stripe 作为备选）
-- - 生图任务元数据

PRAGMA foreign_keys = ON;

-- 用户主表：积分与计费的主键来源。
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- OAuth 账号绑定（Google/Facebook）。
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(provider, provider_account_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS oauth_accounts_user_id_idx ON oauth_accounts(user_id);

-- 模型计费表（每张图消耗多少积分）。
CREATE TABLE IF NOT EXISTS model_pricing (
  model_key TEXT PRIMARY KEY,
  credits_per_image INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);

-- 默认模型扣费（后续可用管理工具/后台更新）。
INSERT OR IGNORE INTO model_pricing(model_key, credits_per_image, enabled, updated_at)
VALUES
  ('nano-banana', 2, 1, strftime('%s','now')),
  ('nano-banana-pro', 4, 1, strftime('%s','now')),
  ('seedream-4-0', 5, 1, strftime('%s','now')),
  ('sora-image', 6, 1, strftime('%s','now')),
  ('flux-kontext-pro', 3, 1, strftime('%s','now')),
  ('flux-kontext-max', 8, 1, strftime('%s','now'));

-- 商品表：统一“一次性积分包”和“订阅套餐”。
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'subscription' | 'one_time'
  name TEXT NOT NULL,
  credits INTEGER NOT NULL, -- subscription：每期发放积分；one_time：一次性发放积分
  active INTEGER NOT NULL DEFAULT 1,
  provider_product_ref TEXT, -- JSON 字符串：{ creem: {...}, stripe: {...} }
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 订单表：统一“一次性购买”和“订阅相关支付记录”。
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'creem' | 'stripe'
  provider_order_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'subscription' | 'one_time'
  product_id TEXT,
  status TEXT NOT NULL, -- 'created' | 'paid' | 'failed' | 'refunded'
  amount INTEGER, -- 最小货币单位（例如 cents）
  currency TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(provider, provider_order_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- 订阅表：每个用户同一时间只允许一个有效订阅（在业务逻辑中强校验）。
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'creem' | 'stripe'
  provider_customer_id TEXT,
  provider_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 渠道原始状态字符串（例如 active/canceled 等）
  current_period_start INTEGER,
  current_period_end INTEGER,
  canceled_at INTEGER,
  ended_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(provider, provider_subscription_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);

-- 渠道事件表：用于 webhook 幂等去重（防止重复发放/重复处理）。
CREATE TABLE IF NOT EXISTS provider_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL, -- 'creem' | 'stripe'
  event_id TEXT NOT NULL,
  received_at INTEGER NOT NULL,
  UNIQUE(provider, event_id)
);

-- 积分流水表：追加写入（可审计）。
-- 用 (reason, provider, ref_id) 做幂等，避免 webhook 重试导致重复加积分。
CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'generation_charge' | 'generation_refund' | 'one_time_grant' | 'subscription_grant' | ...
  ref_provider TEXT NOT NULL DEFAULT 'internal',
  ref_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(reason, ref_provider, ref_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS credit_ledger_user_id_idx ON credit_ledger(user_id);

-- 生图任务表：记录每次请求的扣费与状态。
CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  model_key TEXT NOT NULL,
  cost_credits INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  aspect_ratio TEXT,
  image_size TEXT,
  status TEXT NOT NULL, -- 'queued' | 'running' | 'succeeded' | 'failed'
  error TEXT,
  output_r2_key TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS generation_jobs_user_id_idx ON generation_jobs(user_id);
