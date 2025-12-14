import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { ensureUserFromOAuth, getUserById } from "@/lib/users";

export const authOptions: NextAuthOptions = {
    // 生产环境必须配置。注意不要把 secret 打进前端包。
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
        async jwt({ token, account, profile }) {
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
