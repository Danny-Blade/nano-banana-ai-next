import { requireD1 } from "@/lib/d1";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  provider: string;
  provider_subscription_id: string;
  status: string;
  current_period_end: number | null;
  ended_at: number | null;
};

/**
 * 订阅规则：
 * - 订阅不可叠加（同一时间只允许一个有效订阅）
 * - 必须等上一期订阅结束后才能重新订阅
 */
export const getBlockingSubscription = async (userId: string) => {
  const db = requireD1();
  return db
    .prepare(
      `
      SELECT *
      FROM subscriptions
      WHERE user_id = ?
        AND ended_at IS NULL
        AND (
          status IN ('active', 'trialing', 'past_due')
          OR (current_period_end IS NOT NULL AND current_period_end > strftime('%s','now'))
        )
      ORDER BY current_period_end DESC
      LIMIT 1
    `.trim()
    )
    .bind(userId)
    .first<SubscriptionRow>();
};
