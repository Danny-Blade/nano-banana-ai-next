/**
 * Cloudflare D1 最小类型定义 + 访问辅助方法。
 *
 * 在生产环境（Cloudflare Pages/Workers）中，把 D1 数据库绑定为 `DB`。
 * 本项目会从 `process.env.DB`（nodejs_compat 风格）或 `globalThis.DB` 读取。
 *
 * 在本地 Node.js 直接运行时，这些绑定通常不存在（除非使用 Cloudflare 工具链运行）。
 * 对于依赖 DB 的 API 路由，我们会抛出清晰的错误，避免静默异常。
 */

export type D1ResultMeta = {
  changes?: number;
  last_row_id?: number;
};

export type D1ExecResult = {
  success: boolean;
  meta: D1ResultMeta;
};

export type D1AllResult<T> = {
  results: T[];
};

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1AllResult<T>>;
  run(): Promise<D1ExecResult>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export const getD1 = (): D1Database | null => {
  const envDb = (process.env as unknown as { DB?: D1Database }).DB;
  if (envDb) return envDb;

  const globalDb = (globalThis as unknown as { DB?: D1Database }).DB;
  if (globalDb) return globalDb;

  // OpenNext/Cloudflare: runtime bindings live on the Cloudflare context `env`.
  // We try to read it opportunistically; in plain `next dev` this may throw,
  // so we swallow errors and behave like "no binding".
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare") as typeof import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext?.();
    const db = (ctx?.env as unknown as { DB?: D1Database } | undefined)?.DB;
    if (db) return db;
  } catch {
    // ignore
  }

  return null;
};

export const requireD1 = (): D1Database => {
  const db = getD1();
  if (!db) {
    throw new Error(
      "未找到 D1 数据库绑定。请将 Cloudflare D1 数据库绑定为 `DB`（例如通过 wrangler.toml），以便 API 路由可以持久化用户/积分数据。"
    );
  }
  return db;
};

export const nowSeconds = () => Math.floor(Date.now() / 1000);
