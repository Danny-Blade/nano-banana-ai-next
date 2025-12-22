"use client";

import React from "react";
import { signIn } from "next-auth/react";

export default function GooglePlatformSignIn({
	onSignedIn,
	label,
	buttonClassName,
	iconClassName,
}: {
	onSignedIn?: () => void;
	label: string;
	buttonClassName?: string;
	iconClassName?: string;
}) {
	const [error, setError] = React.useState<string | null>(null);
	const [origin, setOrigin] = React.useState("");

	React.useEffect(() => {
		// Avoid hydration mismatch: `window` is not available during SSR.
		if (typeof window === "undefined") return;
		setOrigin(window.location.origin);
	}, []);
	const signInWithGoogle = React.useCallback(async () => {
		setError(null);
		try {
			const result = await signIn("google", { redirect: false });
			if (result?.url && !result.url.includes("/api/auth/error")) {
				window.location.href = result.url;
				return;
			}
			setError(
				result?.error ||
					"Google 登录失败：请检查 Cloudflare 环境变量 NEXTAUTH_SECRET / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / NEXTAUTH_URL 是否已配置。",
			);
		} catch (err) {
			console.warn("[google] signIn failed:", err);
			setError(
				"Google 登录失败：请检查 Cloudflare 环境变量 NEXTAUTH_SECRET / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / NEXTAUTH_URL 是否已配置。",
			);
		}
	}, []);

	return (
		<div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
			<button
				type="button"
				className={buttonClassName}
				onClick={async () => {
					await signInWithGoogle();
				}}
			>
				<img
					src="https://www.svgrepo.com/show/475656/google-color.svg"
					alt="Google"
					className={iconClassName}
				/>
				{label}
			</button>

			{!error ? (
				<div style={{ color: "#6b7280", fontSize: 12, textAlign: "center" }}>
					Google Cloud Console 的 Authorized redirect URIs 需要包含：
					{" "}
					<code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
						{origin ? `${origin}/api/auth/callback/google` : ""}
					</code>
				</div>
			) : null}

			{error ? (
				<div style={{ color: "#ef4444", fontSize: 12, textAlign: "center" }}>
					{error}
				</div>
			) : null}
		</div>
	);
}
