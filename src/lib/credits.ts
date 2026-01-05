import { requireD1, nowSeconds } from "@/lib/d1";
import { newId } from "@/lib/id";

/**
 * 从用户余额中“原子扣积分”。
 *
 * - 返回 `true`：扣费成功
 * - 返回 `false`：余额不足
 *
 * 重要：扣费逻辑必须在服务端执行，防止客户端篡改价格/扣费。
 */
export const chargeCredits = async (params: {
  userId: string;
  amount: number;
  reason: string;
  refProvider?: string | null;
  refId: string;
}): Promise<boolean> => {
  const db = requireD1();
  const now = nowSeconds();
  const amount = Math.max(0, Math.floor(params.amount));
  if (!amount) return true;

  // 1) 原子扣款：并发场景下避免“双花”。
  const update = await db
    .prepare(
      `UPDATE users SET credits_balance = credits_balance - ?, updated_at = ? WHERE id = ? AND credits_balance >= ?`
    )
    .bind(amount, now, params.userId, amount)
    .run();

  if ((update.meta.changes ?? 0) !== 1) return false;

  // 2) 写入流水：用于审计/排查/对账。
  await db
    .prepare(
      `
      INSERT INTO credit_ledger(id, user_id, delta, reason, ref_provider, ref_id, created_at)
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `.trim()
    )
    .bind(
      newId("cl"),
      params.userId,
      -amount,
      params.reason,
      params.refProvider ?? "internal",
      params.refId,
      now
    )
    .run();

  return true;
};

export const refundCredits = async (params: {
  userId: string;
  amount: number;
  reason: string;
  refProvider?: string | null;
  refId: string;
}): Promise<void> => {
  const db = requireD1();
  const now = nowSeconds();
  const amount = Math.max(0, Math.floor(params.amount));
  if (!amount) return;

  await db
    .prepare(
      `UPDATE users SET credits_balance = credits_balance + ?, updated_at = ? WHERE id = ?`
    )
    .bind(amount, now, params.userId)
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
      params.userId,
      amount,
      params.reason,
      params.refProvider ?? "internal",
      params.refId,
      now
    )
    .run();
};

export const getModelCost = async (modelKey: string): Promise<number | null> => {
  const db = requireD1();
  const row = await db
    .prepare(
      `SELECT credits_per_image as credits FROM model_pricing WHERE model_key = ? AND enabled = 1 LIMIT 1`
    )
    .bind(modelKey)
    .first<{ credits: number }>();
  if (!row) return null;
  return Math.max(0, Math.floor(row.credits));
};
