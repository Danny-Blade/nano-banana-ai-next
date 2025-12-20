import { authOptions } from "@/lib/auth";
import { hasRuntimeEnv } from "@/lib/runtime-env";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

async function safeHandler(...args: unknown[]) {
	try {
		// NextAuth 在生产环境必须要有 NEXTAUTH_SECRET；Cloudflare 上未配置时通常会直接 500，
		// 这里提前给出更明确的日志与响应（不泄露 secret 值，仅说明缺失项）。
		if (process.env.NODE_ENV === "production" && !hasRuntimeEnv("NEXTAUTH_SECRET")) {
			const msg =
				"[auth] Missing NEXTAUTH_SECRET in production. Set it in Cloudflare Workers Secrets.";
			console.error(msg);
			return Response.json({ ok: false, error: msg }, { status: 500 });
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
