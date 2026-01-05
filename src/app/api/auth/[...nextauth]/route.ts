import { authOptions } from "@/lib/auth";
import { hasRuntimeEnv } from "@/lib/runtime-env";
import { getRuntimeEnv } from "@/lib/runtime-env";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

function isLocalNextAuthUrl(): boolean {
	try {
		const raw = getRuntimeEnv("NEXTAUTH_URL")?.trim() || "";
		if (!raw) return false;
		const u = new URL(raw);
		const host = u.hostname.toLowerCase();
		// Local dev with wrangler/next typically uses http + localhost.
		if (u.protocol === "http:") return true;
		return host === "localhost" || host === "127.0.0.1" || host === "::1";
	} catch {
		return false;
	}
}

function hydrateNextAuthProcessEnv() {
	// In OpenNext/Cloudflare runtime, env vars may only exist on the Cloudflare `env` binding.
	// NextAuth itself reads from `process.env`, so we mirror runtime env into `process.env`.
	const keys = [
		"NEXTAUTH_URL",
		"NEXTAUTH_SECRET",
		"GOOGLE_CLIENT_ID",
		"GOOGLE_CLIENT_SECRET",
		"GOOGLE_OAUTH_JSON",
		"NEXTAUTH_DEBUG",
		"DEV_AUTH_BYPASS",
		"DEV_AUTH_EMAIL",
		"DEV_AUTH_CREDITS",
	];
	for (const key of keys) {
		const value = getRuntimeEnv(key);
		if (typeof value === "string" && value.trim()) {
			process.env[key] = value;
		}
	}
}

async function safeHandler(...args: unknown[]) {
	try {
		hydrateNextAuthProcessEnv();
		const strictProduction = process.env.NODE_ENV === "production" && !isLocalNextAuthUrl();

		// NextAuth 在生产环境必须要有 NEXTAUTH_SECRET；Cloudflare 上未配置时通常会直接 500，
		// 这里提前给出更明确的日志与响应（不泄露 secret 值，仅说明缺失项）。
		if (strictProduction && !hasRuntimeEnv("NEXTAUTH_SECRET")) {
			const msg =
				"[auth] Missing NEXTAUTH_SECRET in production. Set it in Cloudflare Workers Secrets.";
			console.error(msg);
			return Response.json({ ok: false, error: msg }, { status: 500 });
		}

		// Google OAuth 登录依赖 client id/secret；若线上未配置，会导致 /api/auth/session 等也报 500。
		if (
			strictProduction &&
			!hasRuntimeEnv("GOOGLE_OAUTH_JSON") &&
			(!hasRuntimeEnv("GOOGLE_CLIENT_ID") || !hasRuntimeEnv("GOOGLE_CLIENT_SECRET"))
		) {
			const msg =
				"[auth] Missing Google OAuth env vars in production. Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (or GOOGLE_OAUTH_JSON) in Cloudflare Workers Secrets.";
			console.error(msg);
			return Response.json({ ok: false, error: msg }, { status: 500 });
		}

		// NEXTAUTH_URL 强烈建议线上配置（避免 Host 推导错误）；这里不给 500，但会提示。
		if (strictProduction && !hasRuntimeEnv("NEXTAUTH_URL")) {
			console.warn(
				"[auth] NEXTAUTH_URL is not set in production. NextAuth will infer host from request headers; set NEXTAUTH_URL in Cloudflare Variables to avoid callback mismatch.",
			);
		}
		return await (handler as (...a: unknown[]) => Promise<Response>)(...args);
	} catch (err) {
		console.error("[auth] NextAuth route crashed:", err);
		return Response.json(
			{
				ok: false,
				error:
					"NextAuth route crashed. Check Cloudflare logs for stack trace and verify env vars: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_URL.",
			},
			{ status: 500 },
		);
	}
}

export { safeHandler as GET, safeHandler as POST };
