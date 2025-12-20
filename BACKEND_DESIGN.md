# 后端架构设计（账号 / 积分 / 订阅 / 双支付通道）

本项目是 AI 生图站点，目标：
- Google + Facebook 登录（NextAuth）
- 用户数据落库（用于积分、订阅、订单、生成记录）
- 支持 **Creem + Stripe** 双支付通道（先上 Creem，后续加 Stripe 兜底）
- 积分按模型扣费（不同模型单张消耗不同）
- 积分发放：一次性可叠加；订阅不可叠加，且必须等订阅结束后才能重新订阅
- 部署目标：Cloudflare（D1 / R2 / Queues 可选）

> 代码现状：已加入 D1 schema、NextAuth 登录落库、生成接口扣积分与流水、Billing/Webhook 的可插拔骨架（详见本文与相关文件）。

---

## 1. 组件划分（推荐 Cloudflare 形态）

**计算/路由**
- Next.js App Router：`src/app/api/*` 路由处理登录、生成、billing API 等

**存储**
- Cloudflare D1：用户、账户绑定、余额、流水、订单/订阅、生成任务元数据
- Cloudflare R2（后续）：生成图片文件（DB 只存 key，不存 base64）

**异步（后续强烈建议）**
- Cloudflare Queues：生图请求入队，消费者调用上游模型，避免长请求超时

---

## 2. 数据模型（D1 / SQLite）

数据库 schema 位于：
- `db/migrations/0001_init.sql`

核心表：
- `users`：用户主体（`credits_balance` 为余额快照）
- `oauth_accounts`：OAuth 绑定（`provider + provider_account_id` 唯一）
- `model_pricing`：按模型扣积分（服务端权威价格）
- `credit_ledger`：积分流水（审计/幂等/退款回滚）
- `orders`：一次性与订阅相关的支付订单（统一抽象）
- `subscriptions`：订阅状态（“不可叠加”规则以此表判断）
- `provider_events`：Webhook 幂等去重（同一事件不重复处理）
- `generation_jobs`：生图任务元数据（扣费 ref、状态、错误等）

### 2.1 积分体系：余额 + 流水（推荐）

- `users.credits_balance` 用于快速判断是否足够扣费（原子 UPDATE）。
- `credit_ledger` 记录每次变更（可审计、可定位错误、可防 webhook 重放）。

幂等建议：
- webhook 发放积分：`UNIQUE(reason, ref_provider, ref_id)`
- 订阅每期发放：`ref_id = subscription_id + ':' + periodStart`

---

## 3. 登录与用户落库（Google/Facebook）

NextAuth 配置：
- `src/lib/auth.ts`
- NextAuth route：`src/app/api/auth/[...nextauth]/route.ts`

落库逻辑：
- `src/lib/users.ts`：`ensureUserFromOAuth(...)`
  - 先按 `(provider, providerAccountId)` 找现有绑定
  - 不存在则按 `email` 去重（同邮箱多 Provider 合并到同一个 `users.id`）
  - 创建 `users` 与 `oauth_accounts`

Session 扩展：
- `src/types/next-auth.d.ts`：给 `session.user` 增加 `id` 与 `credits`
- `auth.ts` 的 `callbacks.session` 会把 `credits` 写入 session，便于 UI 展示

验证接口（可选）：
- `src/app/api/me/route.ts`

---

## 4. 生图扣费（按模型）

当前生图接口：
- `src/app/api/image/generate/route.ts`

关键策略：
1) 必须登录：没有 `session.user.id` 直接 401  
2) 服务端定价：从 `model_pricing` 读取 `credits_per_image`  
3) 原子扣费：`UPDATE users SET credits_balance = credits_balance - cost WHERE credits_balance >= cost`  
4) 记录流水：`credit_ledger` 写入 `generation_charge`  
5) 记录 job：`generation_jobs` 写入 running/succeeded/failed  
6) 上游失败自动退款：写 `generation_refund` 并回补余额

> 备注：当前是同步请求。长耗时模型强烈建议改为队列（Queues）异步，以防超时/断线导致未退款等边界问题。

兼容旧接口（仍会扣费，但不支持多模型）：
- `src/app/api/nano-banana/generate/route.ts`

---

## 5. 双支付通道（Creem + Stripe）设计

### 5.1 统一抽象层（可插拔）

目标：业务层不感知 Creem/Stripe 差异。

- Provider 适配器：`src/lib/billing/providers.ts`
  - `createCheckout(...)`
  - 后续再补：`cancelSubscription(...)`、`createPortal(...)` 等

统一事件模型（Webhook 归一化）：
- `src/lib/billing/types.ts`：`BillingEvent`

统一事件处理：
- `src/lib/billing/handleEvent.ts`
  - `provider_events` 去重（幂等）
  - one-time：更新订单 + 发放积分
  - subscription：upsert subscription + 每期发放积分（按 periodStart 幂等）
  - ended：标记订阅结束

### 5.2 订阅规则（不叠加 / 结束后再订）

入口处强校验（checkout 时就拒绝）：
- `src/app/api/billing/checkout/route.ts`
- `src/lib/billing/subscriptions.ts`：`getBlockingSubscription(userId)`

规则：
- 若存在 `status in ('active','trialing','past_due')` 或 `current_period_end > now` 且 `ended_at IS NULL`
  - 返回 409：提示“订阅不可叠加，需等待结束”

Webhook 侧仍做幂等与状态更新，防止并发/绕过带来的数据问题。

### 5.3 Webhook（目前为占位/可测试形态）

目前 webhook endpoint 为“先跑通内部逻辑”的占位版本：
- `src/app/api/billing/webhook/creem/route.ts`
- `src/app/api/billing/webhook/stripe/route.ts`

TODO（接真实渠道前必须做）：
- 验签（Creem/Stripe 各自 secret）
- 把 provider 原始 payload 解析/归一为 `BillingEvent`

> 现在你可以直接 POST 一个符合 `BillingEvent` 的 JSON 来测试 DB/积分逻辑，等拿到 Creem 的 webhook 文档与示例 payload 后再替换解析层。

---

## 6. 环境变量（必须项）

鉴权：
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`（生产环境建议配置）
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`

上游生图：
- `APIYI_API_KEY`（或 `NANO_BANANA_API_KEY`）
- `APIYI_API_BASE_URL`（可选）

本地/预览环境快捷同步（需要已登录 wrangler 且有权限）：
- `npm run secrets:sync`（从 `.env.local` 同步到 Cloudflare Workers Secrets）
- 会同步：`NEXTAUTH_SECRET`、`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`APIYI_API_KEY`（或 `NANO_BANANA_API_KEY`）

支付（后续接入时补齐）：
- `CREEM_API_KEY` / `CREEM_WEBHOOK_SECRET`（命名可按实际文档调整）
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`

Cloudflare D1 绑定：
- `DB`（D1 database binding，非字符串）

---

## 7. 迁移/初始化（D1）

本仓库提供 SQL schema 文件，但不包含自动 migration runner。

建议用 Cloudflare Wrangler 执行（示意）：
```bash
wrangler d1 execute <YOUR_DB_NAME> --file=./db/migrations/0001_init.sql
```

并确保生产环境绑定名为 `DB`，以便代码读取。

---

## 8. 下一步（按优先级）

1) 接入 Creem：
   - 实现 `src/lib/billing/providers.ts` 中 `creem.createCheckout`
   - 完成 `src/app/api/billing/webhook/creem/route.ts` 的验签与 payload 归一化
2) 补齐产品表：
   - 插入 `products`（订阅套餐 / 一次性积分包）与 provider 对应的 product/price id
3) 生图异步化：
   - `/api/image/generate` 创建 job + 扣费后入队
   - 队列消费者调用上游并写回 job 状态，必要时退款
4) 增加“积分/订阅”展示与历史：
   - `/api/me` + `/api/jobs` + `/api/billing/status` 等
