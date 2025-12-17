import { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import { ensureUserFromOAuth, getUserById } from "@/lib/users";
import { custom } from "openid-client";

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
custom.setHttpOptionsDefaults({ timeout: OAUTH_HTTP_TIMEOUT_MS });

const DEFAULT_GOOGLE_CLIENT_ID =
	"5783249126-pofhal0pprh4dfguso8u5luhov883jdm.apps.googleusercontent.com";

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

function getGoogleClientId(): string {
	const directClientId = process.env.GOOGLE_CLIENT_ID?.trim();
	if (directClientId) return directClientId;

	const jsonText = process.env.GOOGLE_OAUTH_JSON?.trim();
	if (jsonText) {
		try {
			const parsed = JSON.parse(jsonText) as GoogleOAuthJson;
			const block = parsed.web ?? parsed.installed;
			const clientId = typeof block?.client_id === "string" ? block.client_id : "";
			if (clientId) return clientId;
		} catch {
			/* 忽略：仅作为兜底 */
		}
	}

	const publicClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
	if (publicClientId) return publicClientId;

	return DEFAULT_GOOGLE_CLIENT_ID;
}

async function verifyGoogleIdToken(idToken: string): Promise<{
	sub: string;
	email: string;
	name?: string;
	picture?: string;
}> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), OAUTH_HTTP_TIMEOUT_MS);

	try {
		const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
		const resp = await fetch(url, { signal: controller.signal });
		if (!resp.ok) {
			throw new Error(`Google tokeninfo 响应异常：${resp.status}`);
		}
		const data = (await resp.json()) as Record<string, unknown>;

		const aud = typeof data.aud === "string" ? data.aud : "";
		const expectedAud = getGoogleClientId();
		if (aud !== expectedAud) {
			throw new Error("Google id_token 的 aud 不匹配（可能是 client_id 配置错误）");
		}

		const sub = typeof data.sub === "string" ? data.sub : "";
		const email = typeof data.email === "string" ? data.email : "";
		if (!sub || !email) {
			throw new Error("Google tokeninfo 缺少 sub/email");
		}

		const name = typeof data.name === "string" ? data.name : undefined;
		const picture = typeof data.picture === "string" ? data.picture : undefined;
		return { sub, email, name, picture };
	} finally {
		clearTimeout(timer);
	}
}

export const authOptions: NextAuthOptions = {
    // 生产环境必须配置。注意不要把 secret 打进前端包。
    secret:
        process.env.NEXTAUTH_SECRET ||
        (process.env.NODE_ENV === "development" ? "dev-only-secret" : undefined),
    // @ts-expect-error trustHost is a valid option but missing in types
	    trustHost: true,
	    providers: [
	        CredentialsProvider({
	            name: "Google（platform.js）",
            credentials: {
                idToken: { label: "Google ID Token", type: "text" },
            },
            async authorize(credentials) {
                const idToken = typeof credentials?.idToken === "string" ? credentials.idToken.trim() : "";
                if (!idToken) return null;

                const { sub, email, name, picture } = await verifyGoogleIdToken(idToken);

                // 与 OAuth Provider 保持一致：落库后得到内部 userId，用于积分/订阅等业务主键
                try {
                    const user = await ensureUserFromOAuth({
                        provider: "google",
                        providerAccountId: sub,
                        email,
                        name: name ?? null,
                        avatarUrl: picture ?? null,
                    });
                    return {
                        id: user.id,
                        name: user.name ?? undefined,
                        email: user.email ?? undefined,
                        image: user.avatar_url ?? undefined,
                    };
                } catch (err) {
                    // 本地 Node 直接运行通常没有 D1 绑定。
                    // 生产环境出现这种情况应视为配置错误。
                    if (process.env.NODE_ENV === "production") throw err;
                    console.warn("[auth] Failed to persist user to D1:", err);
                    return { id: `google:${sub}`, name, email, image: picture };
	                }
	            },
	        }),
	        GoogleNoDiscovery({
	            ...getGoogleOAuthCredentials(),
	        }),
	        FacebookProvider({
	            clientId: process.env.FACEBOOK_CLIENT_ID || "",
	            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
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
        async jwt({ token, account, profile, user }) {
            // Credentials 登录（google platform.js）走的是 authorize()，这里直接把内部 userId 写进 token
            if (account?.provider === "credentials" && user?.id) {
                token.userId = user.id;
            }

            if (account?.provider && account.providerAccountId) {
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
