import { NextAuthOptions } from "next-auth";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import { ensureUserFromOAuth, getUserById } from "@/lib/users";
import { custom } from "openid-client";
import { HttpsProxyAgent } from "next/dist/compiled/https-proxy-agent";
import { getD1 } from "@/lib/d1";

type GoogleOAuthJson = {
	web?: { client_id?: unknown; client_secret?: unknown };
	installed?: { client_id?: unknown; client_secret?: unknown };
};

type GoogleProfile = {
	sub: string;
	name?: string;
	email?: string;
	picture?: string;
};

// openid-client 默认请求超时是 3500ms；在部分网络环境下（或首次 TLS/DNS 较慢时）
// 会导致 Google OAuth 的 Issuer discovery / token 请求直接超时失败。
// 这里统一把超时调大（可通过环境变量覆盖）。
const OAUTH_HTTP_TIMEOUT_MS = Number(process.env.OAUTH_HTTP_TIMEOUT_MS) || 15_000;
const OAUTH_HTTP_PROXY =
	process.env.OAUTH_HTTP_PROXY?.trim() ||
	process.env.HTTPS_PROXY?.trim() ||
	process.env.HTTP_PROXY?.trim() ||
	process.env.ALL_PROXY?.trim() ||
	"";
const OAUTH_DNS_RESULT_ORDER = process.env.OAUTH_DNS_RESULT_ORDER?.trim() || "";

function redactProxyUrl(proxyUrl: string): string {
	try {
		const url = new URL(proxyUrl);
		if (url.username) url.username = "***";
		if (url.password) url.password = "***";
		return url.toString();
	} catch {
		return proxyUrl.replace(/\/\/.*@/, "//***:***@");
	}
}

// 某些网络环境（例如仅浏览器走代理/VPN，而 Node 进程未走）会导致 NextAuth 在 callback
// 阶段请求 Google token/userinfo 超时。这里允许通过代理环境变量显式为 openid-client 配置 agent。
const httpOptionsDefaults: Parameters<typeof custom.setHttpOptionsDefaults>[0] = {
	timeout: OAUTH_HTTP_TIMEOUT_MS,
};

if (OAUTH_HTTP_PROXY) {
	if (OAUTH_HTTP_PROXY.toLowerCase().startsWith("socks")) {
		// 仅提示：socks 代理需要 socks-proxy-agent；这里先不引入依赖，避免构建与部署复杂度。
		console.warn(
			`[auth] OAuth proxy looks like SOCKS (${redactProxyUrl(
				OAUTH_HTTP_PROXY,
			)}). Please provide an HTTP(S) proxy url or handle SOCKS agent yourself.`,
		);
	} else {
		httpOptionsDefaults.agent = new HttpsProxyAgent(OAUTH_HTTP_PROXY);
		if (process.env.NODE_ENV !== "production") {
			console.info("[auth] OAuth proxy enabled:", redactProxyUrl(OAUTH_HTTP_PROXY));
		}
	}
}

if (OAUTH_DNS_RESULT_ORDER) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const dns = require("node:dns") as typeof import("node:dns");
		const order = OAUTH_DNS_RESULT_ORDER.toLowerCase();
		if (order === "ipv4first" || order === "ipv6first" || order === "verbatim") {
			dns.setDefaultResultOrder(order as "ipv4first" | "ipv6first" | "verbatim");
			if (process.env.NODE_ENV !== "production") {
				console.info("[auth] DNS result order:", order);
			}
		} else {
			console.warn("[auth] Invalid OAUTH_DNS_RESULT_ORDER:", OAUTH_DNS_RESULT_ORDER);
		}
	} catch (err) {
		console.warn("[auth] Failed to set DNS result order:", err);
	}
}

custom.setHttpOptionsDefaults(httpOptionsDefaults);

/**
 * Google OAuth Provider without OIDC discovery.
 *
 * NextAuth's built-in Google provider uses `wellKnown` which triggers a network call
 * (`Issuer.discover`) on `/api/auth/signin/google`. In some networks (or slow DNS/TLS),
 * that request can hang, so the browser never gets the authorization URL.
 *
 * By providing static endpoints, NextAuth will construct the authorization URL immediately.
 */
function GoogleNoDiscovery<P extends GoogleProfile>(
	options: OAuthUserConfig<P>,
): OAuthConfig<P> {
	return {
		id: "google",
		name: "Google",
		type: "oauth",
		issuer: "https://accounts.google.com",
		authorization: {
			url: "https://accounts.google.com/o/oauth2/v2/auth",
			params: { scope: "openid email profile" },
		},
		token: { url: "https://oauth2.googleapis.com/token" },
		userinfo: { url: "https://openidconnect.googleapis.com/v1/userinfo" },
		jwks_endpoint: "https://www.googleapis.com/oauth2/v3/certs",
		idToken: true,
		checks: ["pkce", "state"],
		profile(profile) {
			return {
				id: profile.sub,
				name: profile.name,
				email: profile.email,
				image: profile.picture,
			};
		},
		style: {
			logo: "/google.svg",
			bg: "#fff",
			text: "#000",
		},
		options,
	};
}

function getGoogleOAuthCredentials(): { clientId: string; clientSecret: string } {
	// 推荐：分别配置（更清晰，也更容易在 Cloudflare 控制台管理）
	const directClientId = process.env.GOOGLE_CLIENT_ID?.trim();
	const directClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
	if (directClientId && directClientSecret) {
		return { clientId: directClientId, clientSecret: directClientSecret };
	}

	// 兼容：把 Google 下载的 OAuth JSON（你发的那份结构）整体放到环境变量里（建议用 Secret）
	// 例如：GOOGLE_OAUTH_JSON='{"web":{"client_id":"...","client_secret":"...","javascript_origins":[...]}}'
	const jsonText = process.env.GOOGLE_OAUTH_JSON?.trim();
	if (jsonText) {
		try {
			const parsed = JSON.parse(jsonText) as GoogleOAuthJson;
			const block = parsed.web ?? parsed.installed;
			const clientId = typeof block?.client_id === "string" ? block.client_id : "";
			const clientSecret = typeof block?.client_secret === "string" ? block.client_secret : "";
			if (clientId && clientSecret) return { clientId, clientSecret };

			console.warn(
				"[auth] 已设置 GOOGLE_OAUTH_JSON，但未找到 web.client_id / web.client_secret（或 installed.*）",
			);
		} catch (err) {
			console.warn("[auth] GOOGLE_OAUTH_JSON 不是有效 JSON：", err);
		}
	}

	// 兜底：保持类型稳定，避免构建期因为缺少变量而报错；但登录时会失败。
	return { clientId: directClientId ?? "", clientSecret: directClientSecret ?? "" };
}

export const authOptions: NextAuthOptions = {
    // 生产环境必须配置。注意不要把 secret 打进前端包。
    secret:
        process.env.NEXTAUTH_SECRET ||
        (process.env.NODE_ENV === "development" ? "dev-only-secret" : undefined),
    // @ts-expect-error trustHost is a valid option but missing in types
    trustHost: true,
    providers: [
        GoogleNoDiscovery({
            ...getGoogleOAuthCredentials(),
        }),
    ],
    pages: {
        signIn: '/login', // 我们用弹窗登录；这里是兜底路由
    },
    // 目前使用 JWT Session，暂不引入服务端 sessions 表。
    // 用户持久化落在我们自己的 D1 表里（见 db/migrations）。
    session: { strategy: "jwt" },
	callbacks: {
        /**
         * 将 OAuth 用户落库到 D1，并把内部 `userId` 写入 JWT。
         * 这样积分/订阅等业务就有稳定的主键可用。
         */
		async jwt({ token, account, profile }) {
			if (account?.provider && account.providerAccountId) {
				const db = getD1();
				if (!db) {
					// 本地 Next.js dev 直接跑时通常没有 Cloudflare D1 绑定；这不影响 OAuth 登录，
					// 但积分/订阅等依赖 DB 的功能无法使用。
					if (process.env.NODE_ENV === "production") {
						throw new Error(
							"未找到 D1 数据库绑定（DB）。请在 Cloudflare 环境绑定 D1 为 `DB`，否则无法持久化用户/积分数据。",
						);
					}

					// 给前端一个稳定的 userId，避免 session.user.id 为空导致 UI 逻辑异常。
					token.userId ??= `${account.provider}:${account.providerAccountId}`;
					return token;
				}

				const p = profile as Record<string, unknown> | undefined;
				const email =
					(typeof p?.email === "string" ? (p.email as string) : undefined) ||
					(typeof token.email === "string" ? token.email : undefined);

                // 有些渠道取决于权限配置，可能不会返回 email。
                if (email) {
                    const name =
                        (typeof p?.name === "string" ? (p.name as string) : undefined) ||
                        (typeof token.name === "string" ? token.name : undefined) ||
                        null;
                    const avatarUrl =
                        (typeof p?.picture === "string" ? (p.picture as string) : undefined) ||
                        (typeof p?.["avatar_url"] === "string"
                            ? (p["avatar_url"] as string)
                            : undefined) ||
                        null;

                    try {
                        const user = await ensureUserFromOAuth({
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            email,
                            name,
                            avatarUrl,
                        });
                        token.userId = user.id;
                    } catch (err) {
                        // 本地 Node 直接运行通常没有 D1 绑定。
                        // 生产环境出现这种情况应视为配置错误。
						if (process.env.NODE_ENV === "production") throw err;
						console.warn("[auth] Failed to persist user to D1:", err);
					}
				}
			}
			return token;
        },

        /**
         * 将内部 `userId` 与 `credits` 挂到客户端 session 上。
         * 这样 UI 可以直接展示积分，减少额外请求。
         */
		async session({ session, token }) {
			const userId = typeof token.userId === "string" ? token.userId : null;
			if (session.user && userId) {
				session.user.id = userId;
				const db = getD1();
				if (!db) {
					if (process.env.NODE_ENV === "production") {
						throw new Error(
							"未找到 D1 数据库绑定（DB）。请在 Cloudflare 环境绑定 D1 为 `DB`，否则无法读取用户/积分数据。",
						);
					}
					session.user.credits = 0;
					return session;
				}
				try {
					const user = await getUserById(userId);
					session.user.credits = user?.credits_balance ?? 0;
				} catch (err) {
					if (process.env.NODE_ENV === "production") throw err;
                    session.user.credits = 0;
                }
            }
            return session;
        },
    },
};
