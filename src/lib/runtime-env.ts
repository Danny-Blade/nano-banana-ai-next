/**
 * Read environment variables in both Node.js and OpenNext/Cloudflare runtime.
 *
 * In Cloudflare Workers, variables/secrets are primarily available on the runtime `env`
 * object. Depending on the build/runtime, `process.env` may not contain them.
 */

export function getRuntimeEnv(key: string): string | undefined {
  const direct = (process.env as Record<string, string | undefined>)[key];
  if (typeof direct === "string") return direct;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare") as typeof import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext?.();
    const value = (ctx?.env as Record<string, unknown> | undefined)?.[key];
    return typeof value === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}

export function hasRuntimeEnv(key: string): boolean {
  const value = getRuntimeEnv(key);
  return typeof value === "string" && value.trim().length > 0;
}

