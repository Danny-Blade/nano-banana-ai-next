-- =====================================================================
-- 初始数据库结构（Cloudflare D1 / SQLite）
-- 总结：这份脚本用于搭建 AI 生图订阅站的核心数据表：用户、OAuth、商品/订单/订阅、积分账本、任务记录，并考虑 webhook 幂等。
-- =====================================================================

-- 开启外键约束（SQLite 默认可能不强制执行外键）
-- 总结：确保 FOREIGN KEY、级联删除等规则真正生效，防止脏数据。
PRAGMA foreign_keys = ON;

-- =====================================================================
-- users：用户主表
-- 总结：系统内“用户唯一身份”的根表；积分余额与计费关联的主键来源。
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (               -- 创建 users 表（若不存在才创建）
  id TEXT PRIMARY KEY,                           -- 用户主键（建议 UUID）；总结：全系统用户的唯一标识
  email TEXT NOT NULL UNIQUE,                    -- 邮箱（必填且唯一）；总结：用于登录/找回/去重
  name TEXT,                                     -- 昵称（可空）；总结：展示用字段
  avatar_url TEXT,                               -- 头像 URL（可空）；总结：展示用字段
  credits_balance INTEGER NOT NULL DEFAULT 0,    -- 当前积分余额（默认 0）；总结：快速读取余额的缓存值
  created_at INTEGER NOT NULL,                   -- 创建时间（Unix 秒）；总结：审计与排序
  updated_at INTEGER NOT NULL                    -- 更新时间（Unix 秒）；总结：便于同步与追踪
);

-- =====================================================================
-- oauth_accounts：OAuth 账号绑定表（Google / Facebook）
-- 总结：一个用户可绑定多个第三方账号；用于 NextAuth 等 OAuth 登录映射。
-- =====================================================================
CREATE TABLE IF NOT EXISTS oauth_accounts (      -- 创建 oauth_accounts 表（若不存在才创建）
  id TEXT PRIMARY KEY,                           -- 绑定记录主键；总结：OAuth 绑定的唯一 id
  user_id TEXT NOT NULL,                         -- 关联 users.id；总结：这条绑定属于哪个用户
  provider TEXT NOT NULL,                        -- 渠道名（google/facebook...）；总结：区分 OAuth 来源
  provider_account_id TEXT NOT NULL,             -- 渠道侧账号唯一 id；总结：第三方账户的唯一标识
  created_at INTEGER NOT NULL,                   -- 绑定创建时间；总结：审计与排查
  UNIQUE(provider, provider_account_id),         -- 防重复绑定；总结：同渠道同账号只能出现一次
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  -- 外键 + 级联删除；总结：删除用户时自动清理其 OAuth 绑定
);

CREATE INDEX IF NOT EXISTS oauth_accounts_user_id_idx ON oauth_accounts(user_id);
-- 索引 user_id；总结：加速按用户查询其绑定账号列表

-- =====================================================================
-- model_pricing：模型计费表
-- 总结：配置不同模型每生成一张图消耗多少积分，并可启用/禁用模型。
-- =====================================================================
CREATE TABLE IF NOT EXISTS model_pricing (        -- 创建 model_pricing 表
  model_key TEXT PRIMARY KEY,                     -- 模型 key；总结：模型的唯一标识
  credits_per_image INTEGER NOT NULL,             -- 每张图扣多少积分；总结：计费规则核心字段
  enabled INTEGER NOT NULL DEFAULT 1,             -- 是否启用（1/0）；总结：可快速下线某模型
  updated_at INTEGER NOT NULL                     -- 价格更新时间；总结：追踪调价与审计
);

-- 默认模型扣费配置（不存在才插入）
-- 总结：初始化一套默认价格，便于上线即用；之后可通过后台更新。
INSERT OR IGNORE INTO model_pricing(model_key, credits_per_image, enabled, updated_at)
VALUES
  ('nano-banana', 2, 1, strftime('%s','now')),        -- 总结：nano-banana 默认 2 积分/张
  ('nano-banana-pro', 4, 1, strftime('%s','now')),    -- 总结：nano-banana-pro 默认 4 积分/张
  ('seedream-4-5', 5, 1, strftime('%s','now')),       -- 总结：seedream-4-5 默认 5 积分/张
  ('sora-image', 6, 1, strftime('%s','now')),         -- 总结：sora-image 默认 6 积分/张
  ('flux-kontext-pro', 3, 1, strftime('%s','now')),   -- 总结：flux-kontext-pro 默认 3 积分/张
  ('flux-kontext-max', 8, 1, strftime('%s','now'));   -- 总结：flux-kontext-max 默认 8 积分/张

-- =====================================================================
-- products：商品表（订阅套餐 / 一次性积分包）
-- 总结：统一管理“订阅每期发放积分”和“一次性购买发放积分”的商品信息。
-- =====================================================================
CREATE TABLE IF NOT EXISTS products (             -- 创建 products 表
  id TEXT PRIMARY KEY,                            -- 商品主键；总结：内部商品唯一标识
  type TEXT NOT NULL,                             -- 'subscription' | 'one_time'；总结：区分订阅和一次性
  name TEXT NOT NULL,                             -- 商品名；总结：展示与后台管理
  credits INTEGER NOT NULL,                       -- 发放积分数；总结：订阅=每期发放，一次性=立即发放
  active INTEGER NOT NULL DEFAULT 1,              -- 是否上架（1/0）；总结：控制售卖开关
  provider_product_ref TEXT,                      -- JSON 字符串：{creem:{...}, stripe:{...}}；总结：映射渠道商品/价格 id
  created_at INTEGER NOT NULL,                    -- 创建时间；总结：审计与排序
  updated_at INTEGER NOT NULL                     -- 更新时间；总结：同步与追踪
);

-- =====================================================================
-- orders：订单表（一次性购买 + 订阅相关支付记录）
-- 总结：统一记录付款流水，便于对账/退款/追踪支付状态；与用户、商品关联。
-- =====================================================================
CREATE TABLE IF NOT EXISTS orders (               -- 创建 orders 表
  id TEXT PRIMARY KEY,                            -- 订单主键；总结：内部订单唯一标识
  user_id TEXT NOT NULL,                          -- 下单用户；总结：订单归属用户
  provider TEXT NOT NULL,                         -- 'creem' | 'stripe'；总结：支付渠道来源
  provider_order_id TEXT NOT NULL,                -- 渠道订单号；总结：用于 webhook 对账与幂等
  type TEXT NOT NULL,                             -- 'subscription' | 'one_time'；总结：订单类型
  product_id TEXT,                                -- 关联商品（可空）；总结：订阅事件可能不直接对应商品
  status TEXT NOT NULL,                           -- 'created'|'paid'|'failed'|'refunded'；总结：订单生命周期状态
  amount INTEGER,                                 -- 金额（最小货币单位，如 cents）；总结：对账关键字段
  currency TEXT,                                  -- 币种（USD/SGD...）；总结：多币种支持
  created_at INTEGER NOT NULL,                    -- 创建时间；总结：审计与排序
  updated_at INTEGER NOT NULL,                    -- 更新时间；总结：状态变更追踪
  UNIQUE(provider, provider_order_id),            -- 幂等去重；总结：同渠道同订单号只记录一次
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- 外键 + 级联删除；总结：删除用户时自动删除其订单
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
  -- 外键；总结：删除商品不删除订单，仅将 product_id 置空以保留历史
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
-- 索引 user_id；总结：加速按用户查询订单列表

-- =====================================================================
-- subscriptions：订阅表
-- 总结：记录渠道订阅信息与当前周期；业务层保证“同一时间用户最多一个有效订阅”。
-- =====================================================================
CREATE TABLE IF NOT EXISTS subscriptions (        -- 创建 subscriptions 表
  id TEXT PRIMARY KEY,                            -- 订阅记录主键；总结：内部订阅唯一标识
  user_id TEXT NOT NULL,                          -- 订阅所属用户；总结：订阅归属
  provider TEXT NOT NULL,                         -- 'creem' | 'stripe'；总结：订阅渠道来源
  provider_customer_id TEXT,                      -- 渠道 customer id（可空）；总结：用于渠道侧用户映射/扣款主体
  provider_subscription_id TEXT NOT NULL,         -- 渠道 subscription id；总结：webhook 对账核心
  status TEXT NOT NULL,                           -- 渠道原始状态（active/canceled...）；总结：保持原样以兼容渠道状态体系
  current_period_start INTEGER,                   -- 当前周期开始；总结：用于判断发放周期与权益
  current_period_end INTEGER,                     -- 当前周期结束；总结：用于判断续费/到期
  canceled_at INTEGER,                            -- 取消时间；总结：记录取消动作发生点
  ended_at INTEGER,                               -- 结束时间；总结：记录订阅真正终止点
  created_at INTEGER NOT NULL,                    -- 创建时间；总结：审计
  updated_at INTEGER NOT NULL,                    -- 更新时间；总结：状态/周期变更追踪
  UNIQUE(provider, provider_subscription_id),     -- 幂等去重；总结：同渠道同订阅号只允许一条记录
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  -- 外键 + 级联删除；总结：删除用户时删除其订阅记录
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
-- 索引 user_id；总结：加速按用户读取订阅信息

-- =====================================================================
-- provider_events：渠道事件表（webhook 幂等）
-- 总结：记录已处理的 webhook 事件，防止重复处理导致重复发积分/重复更新状态。
-- =====================================================================
CREATE TABLE IF NOT EXISTS provider_events (      -- 创建 provider_events 表
  id TEXT PRIMARY KEY,                            -- 事件记录主键；总结：内部唯一 id
  provider TEXT NOT NULL,                         -- 'creem' | 'stripe'；总结：区分事件来源渠道
  event_id TEXT NOT NULL,                         -- 渠道事件 id；总结：webhook 幂等去重的关键
  received_at INTEGER NOT NULL,                   -- 接收时间；总结：排查重放/延迟事件
  UNIQUE(provider, event_id)                      -- 联合唯一；总结：同渠道同事件只能处理一次
);

-- =====================================================================
-- credit_ledger：积分流水（可审计账本）
-- 总结：所有积分变动只“追加写入”；用唯一约束保证 webhook 重试不会重复加/扣积分。
-- =====================================================================
CREATE TABLE IF NOT EXISTS credit_ledger (        -- 创建 credit_ledger 表
  id TEXT PRIMARY KEY,                            -- 流水主键；总结：每一笔积分变动的唯一记录
  user_id TEXT NOT NULL,                          -- 用户 id；总结：这笔流水属于谁
  delta INTEGER NOT NULL,                         -- 变动值（+加 / -扣）；总结：积分增减的数额
  reason TEXT NOT NULL,                           -- 变动原因；总结：分类便于统计与审计
  ref_provider TEXT NOT NULL DEFAULT 'internal',  -- 引用来源（internal/creem/stripe...）；总结：追踪变动来自哪里
  ref_id TEXT NOT NULL,                           -- 引用 id（订单/事件/任务 id）；总结：定位这笔变动对应的业务对象
  created_at INTEGER NOT NULL,                    -- 创建时间；总结：审计与排序
  UNIQUE(reason, ref_provider, ref_id),           -- 幂等键；总结：防止 webhook 重试导致重复记账
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  -- 外键 + 级联删除；总结：删除用户时删除其积分流水
);

CREATE INDEX IF NOT EXISTS credit_ledger_user_id_idx ON credit_ledger(user_id);
-- 索引 user_id；总结：加速查询某用户的积分流水列表

-- =====================================================================
-- generation_jobs：生图任务表
-- 总结：记录每次生图请求的参数、扣费与执行结果；用于排队、失败追踪、对账与历史查询。
-- =====================================================================
CREATE TABLE IF NOT EXISTS generation_jobs (      -- 创建 generation_jobs 表
  id TEXT PRIMARY KEY,                            -- 任务主键；总结：每次生图请求的唯一标识
  user_id TEXT NOT NULL,                          -- 发起用户；总结：任务归属
  model_key TEXT NOT NULL,                        -- 使用模型；总结：决定计费与生成策略
  cost_credits INTEGER NOT NULL,                  -- 本次消耗积分；总结：写死到任务上便于历史对账（即使模型价格后改）
  prompt TEXT NOT NULL,                           -- 提示词；总结：生成输入（需注意隐私与合规）
  aspect_ratio TEXT,                              -- 比例（可空）；总结：生成参数之一
  image_size TEXT,                                -- 尺寸（可空）；总结：生成参数之一
  status TEXT NOT NULL,                           -- 'queued'|'running'|'succeeded'|'failed'；总结：任务状态机
  error TEXT,                                     -- 错误信息（可空）；总结：失败诊断
  output_r2_key TEXT,                             -- R2 对象 key（可空）；总结：生成结果存储位置
  created_at INTEGER NOT NULL,                    -- 创建时间；总结：排队与审计
  updated_at INTEGER NOT NULL,                    -- 更新时间；总结：状态变更追踪
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  -- 外键 + 级联删除；总结：删除用户时删除其任务记录
);

CREATE INDEX IF NOT EXISTS generation_jobs_user_id_idx ON generation_jobs(user_id);
-- 索引 user_id；总结：加速按用户查询生图历史
