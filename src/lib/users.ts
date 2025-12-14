import { requireD1, nowSeconds } from "@/lib/d1";
import { newId } from "@/lib/id";

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  credits_balance: number;
  created_at: number;
  updated_at: number;
};

/**
 * 确保 OAuth 登录在本地 D1 里有对应的 `users` 记录。
 *
 * NextAuth 可以不使用 DB adapter 运行；这里我们自行落库，确保积分/订阅等业务
 * 都能绑定到稳定的 `user.id`。
 */
export const ensureUserFromOAuth = async (params: {
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<UserRow> => {
  const db = requireD1();
  const now = nowSeconds();

  const existing = await db
    .prepare(
      `
      SELECT u.*
      FROM oauth_accounts oa
      JOIN users u ON u.id = oa.user_id
      WHERE oa.provider = ? AND oa.provider_account_id = ?
      LIMIT 1
    `.trim()
    )
    .bind(params.provider, params.providerAccountId)
    .first<UserRow>();

  if (existing) {
    // 适度更新用户头像/昵称信息，但不要在这里改动积分。
    await db
      .prepare(
        `UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), updated_at = ? WHERE id = ?`
      )
      .bind(params.name ?? null, params.avatarUrl ?? null, now, existing.id)
      .run();
    return existing;
  }

  // 按 email 做去重：避免同一邮箱用不同 OAuth 渠道登录时生成重复用户。
  const byEmail = await db
    .prepare(`SELECT * FROM users WHERE email = ? LIMIT 1`)
    .bind(params.email)
    .first<UserRow>();

  const userId = byEmail?.id ?? newId("user");
  if (!byEmail) {
    await db
      .prepare(
        `
        INSERT INTO users(id, email, name, avatar_url, credits_balance, created_at, updated_at)
        VALUES(?, ?, ?, ?, 0, ?, ?)
      `.trim()
      )
      .bind(
        userId,
        params.email,
        params.name ?? null,
        params.avatarUrl ?? null,
        now,
        now
      )
      .run();
  }

  await db
    .prepare(
      `
      INSERT INTO oauth_accounts(id, user_id, provider, provider_account_id, created_at)
      VALUES(?, ?, ?, ?, ?)
    `.trim()
    )
    .bind(
      newId("acct"),
      userId,
      params.provider,
      params.providerAccountId,
      now
    )
    .run();

  const created = await db
    .prepare(`SELECT * FROM users WHERE id = ? LIMIT 1`)
    .bind(userId)
    .first<UserRow>();

  if (!created) {
    throw new Error("Failed to create user record");
  }

  return created;
};

export const getUserById = async (userId: string): Promise<UserRow | null> => {
  const db = requireD1();
  return db
    .prepare(`SELECT * FROM users WHERE id = ? LIMIT 1`)
    .bind(userId)
    .first<UserRow>();
};
