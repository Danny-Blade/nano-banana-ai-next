import { requireD1, nowSeconds } from "@/lib/d1";
import { newId } from "@/lib/id";
import type { BillingEvent } from "@/lib/billing/types";

/**
 * 统一的计费事件处理器（业务规则集中在这里）。
 *
 * Webhook 路由（Creem/Stripe）应当：
 * 1) 验签（各渠道不同）
 * 2) 将 payload 归一化为 `BillingEvent`
 * 3) 调用 `handleBillingEvent`（本文件）
 *
 * 这样可以保证多支付渠道下业务规则一致。
 */
export const handleBillingEvent = async (event: BillingEvent) => {
  const db = requireD1();
  const now = nowSeconds();

  // 幂等：支付渠道会重试 webhook，必须避免重复加积分/重复处理。
  const inserted = await db
    .prepare(
      `INSERT OR IGNORE INTO provider_events(id, provider, event_id, received_at) VALUES(?, ?, ?, ?)`
    )
    .bind(newId("evt"), event.provider, event.providerEventId, now)
    .run();

  if ((inserted.meta.changes ?? 0) === 0) {
    return { ok: true, deduped: true };
  }

  if (event.type === "ONE_TIME_PAID") {
    await db
      .prepare(
        `UPDATE orders SET status = ?, updated_at = ? WHERE provider = ? AND provider_order_id = ?`
      )
      .bind("paid", now, event.provider, event.providerOrderId)
      .run();

    await db
      .prepare(
        `
        INSERT OR IGNORE INTO credit_ledger(id, user_id, delta, reason, ref_provider, ref_id, created_at)
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `.trim()
      )
      .bind(
        newId("cl"),
        event.userId,
        event.credits,
        "one_time_grant",
        event.provider,
        event.providerOrderId,
        now
      )
      .run();

    await db
      .prepare(
        `UPDATE users SET credits_balance = credits_balance + ?, updated_at = ? WHERE id = ?`
      )
      .bind(event.credits, now, event.userId)
      .run();

    return { ok: true };
  }

  if (event.type === "SUBSCRIPTION_PERIOD_PAID") {
    // 注意：订阅不可叠加主要在 checkout 阶段拦截。
    // webhook 仍需依赖 provider event id 做幂等，防止重复处理。
    await db
      .prepare(
        `
        INSERT INTO subscriptions(
          id, user_id, provider, provider_customer_id, provider_subscription_id,
          status, current_period_start, current_period_end, canceled_at, ended_at,
          created_at, updated_at
        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)
        ON CONFLICT(provider, provider_subscription_id) DO UPDATE SET
          status = excluded.status,
          current_period_start = excluded.current_period_start,
          current_period_end = excluded.current_period_end,
          provider_customer_id = COALESCE(excluded.provider_customer_id, subscriptions.provider_customer_id),
          updated_at = excluded.updated_at
      `.trim()
      )
      .bind(
        newId("sub"),
        event.userId,
        event.provider,
        event.providerCustomerId ?? null,
        event.providerSubscriptionId,
        event.status,
        event.periodStart,
        event.periodEnd,
        now,
        now
      )
      .run();

    // 发放当期积分：用 subscription+periodStart 做幂等，避免重复发放。
    const grantRefId = `${event.providerSubscriptionId}:${event.periodStart}`;
    await db
      .prepare(
        `
        INSERT OR IGNORE INTO credit_ledger(id, user_id, delta, reason, ref_provider, ref_id, created_at)
        VALUES(?, ?, ?, ?, ?, ?, ?)
      `.trim()
      )
      .bind(
        newId("cl"),
        event.userId,
        event.credits,
        "subscription_grant",
        event.provider,
        grantRefId,
        now
      )
      .run();

    await db
      .prepare(
        `UPDATE users SET credits_balance = credits_balance + ?, updated_at = ? WHERE id = ?`
      )
      .bind(event.credits, now, event.userId)
      .run();

    return { ok: true };
  }

  if (event.type === "SUBSCRIPTION_ENDED") {
    await db
      .prepare(
        `
        UPDATE subscriptions
        SET status = ?, ended_at = ?, updated_at = ?
        WHERE provider = ? AND provider_subscription_id = ?
      `.trim()
      )
      .bind(event.status, event.endedAt, now, event.provider, event.providerSubscriptionId)
      .run();
    return { ok: true };
  }

  return { ok: true };
};
