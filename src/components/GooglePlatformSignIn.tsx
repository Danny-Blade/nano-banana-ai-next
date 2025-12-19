"use client";

import React from "react";
import { signIn } from "next-auth/react";

declare global {
	interface Window {
		google?: unknown;
	}
}

const GOOGLE_CLIENT_ID =
	process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
	"5783249126-pofhal0pprh4dfguso8u5luhov883jdm.apps.googleusercontent.com";

const ENABLE_GOOGLE_OAUTH_REDIRECT_FALLBACK =
	process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH_REDIRECT_FALLBACK !== "false";

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

type GoogleIdCredentialResponse = {
	credential: string;
	select_by?: string;
};

type GooglePromptMomentNotification = {
	isDisplayed?: () => boolean;
	isNotDisplayed?: () => boolean;
	getNotDisplayedReason?: () => string;
	isSkippedMoment?: () => boolean;
	getSkippedReason?: () => string;
	isDismissedMoment?: () => boolean;
	getDismissedReason?: () => string;
};

type GoogleAccountsId = {
	initialize: (options: {
		client_id: string;
		callback: (response: GoogleIdCredentialResponse) => void;
		ux_mode?: "popup" | "redirect";
	}) => void;
	prompt: (callback?: (notification: GooglePromptMomentNotification) => void) => void;
	cancel?: () => void;
};

function getGoogleAccountsId(): GoogleAccountsId | null {
	const google = (window as unknown as { google?: unknown }).google;
	if (!google || typeof google !== "object") return null;
	const accounts = (google as Record<string, unknown>).accounts;
	if (!accounts || typeof accounts !== "object") return null;
	const id = (accounts as Record<string, unknown>).id;
	if (!id || typeof id !== "object") return null;

	const initialize = (id as Record<string, unknown>).initialize;
	const prompt = (id as Record<string, unknown>).prompt;
	const cancel = (id as Record<string, unknown>).cancel;
	if (typeof initialize !== "function") return null;
	if (typeof prompt !== "function") return null;

	return {
		initialize: initialize as GoogleAccountsId["initialize"],
		prompt: prompt as GoogleAccountsId["prompt"],
		cancel: typeof cancel === "function" ? (cancel as GoogleAccountsId["cancel"]) : undefined,
	};
}

async function loadGsiScript(): Promise<void> {
	if (getGoogleAccountsId()) return;

	const existing = document.querySelector(
		'script[data-google-gsi="1"]',
	) as HTMLScriptElement | null;
	if (!existing) {
		await new Promise<void>((resolve, reject) => {
			const script = document.createElement("script");
			script.src = "https://accounts.google.com/gsi/client";
			script.async = true;
			script.defer = true;
			script.dataset.googleGsi = "1";
			script.onload = () => resolve();
			script.onerror = () =>
				reject(new Error("Failed to load Google Identity Services script"));
			document.head.appendChild(script);
		});
	}

	for (let i = 0; i < 120; i++) {
		if (getGoogleAccountsId()) return;
		await sleep(50);
	}
	throw new Error("Google Identity Services did not initialize");
}

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
	const initializedRef = React.useRef(false);
	const [error, setError] = React.useState<string | null>(null);
	const [gsiStatus, setGsiStatus] = React.useState<"loading" | "ready" | "failed">(
		"loading",
	);

	const fallbackRedirect = React.useCallback(async () => {
		if (!ENABLE_GOOGLE_OAUTH_REDIRECT_FALLBACK) {
			setError("当前网络无法拉起 Google 登录，请开启代理/VPN 后刷新重试。");
			return;
		}
		const result = await signIn("google", { redirect: false });
		if (result?.url) window.location.href = result.url;
		else setError(result?.error || "Google 登录失败，请检查网络/代理设置。");
	}, []);

	React.useEffect(() => {
		let cancelled = false;

		const init = async () => {
			if (initializedRef.current) return;
			initializedRef.current = true;

			if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes("your-google-client-id")) {
				if (!cancelled) {
					setError("Google Client ID 未配置，请检查环境变量。");
					setGsiStatus("failed");
				}
				return;
			}

			try {
				await loadGsiScript();
				if (cancelled) return;

				const accountsId = getGoogleAccountsId();
				if (!accountsId) throw new Error("Google Identity Services not available");

				accountsId.initialize({
					client_id: GOOGLE_CLIENT_ID,
					ux_mode: "popup",
					callback: async (response) => {
						const idToken = response?.credential;
						if (!idToken) {
							if (!cancelled) setError("未获取到 Google id_token，请重试。");
							return;
						}

						try {
							const result = await signIn("credentials", {
								idToken,
								redirect: false,
							});

							if (result?.url) {
								window.location.href = result.url;
								return;
							}

							if (result?.ok) {
								if (!cancelled) setError(null);
								onSignedIn?.();
								return;
							}

							if (!cancelled) setError(result?.error || "登录失败，请重试。");
						} catch (err) {
							console.warn("[google] credentials signIn failed:", err);
							if (!cancelled) setError("登录失败，请重试。");
						}
					},
				});

				if (!cancelled) {
					setGsiStatus("ready");
					setError(null);
				}
			} catch (err) {
				console.warn("[google] GSI init failed:", err);
				if (!cancelled) setGsiStatus("failed");
			}
		};

		void init();
		return () => {
			cancelled = true;
		};
	}, [onSignedIn]);

	return (
		<div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
			<button
				type="button"
				className={buttonClassName}
				onClick={async () => {
					setError(null);

					try {
						const accountsId = getGoogleAccountsId();
						if (gsiStatus !== "ready" || !accountsId) {
							await fallbackRedirect();
							return;
						}

						accountsId.prompt((notification) => {
							const blocked =
								notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.();
							if (!blocked) return;

							const reason =
								notification?.getNotDisplayedReason?.() ||
								notification?.getSkippedReason?.() ||
								notification?.getDismissedReason?.() ||
								"unknown";
							console.warn("[google] GSI prompt not displayed:", reason);
							void fallbackRedirect();
						});
					} catch (err) {
						console.warn("[google] GSI prompt failed:", err);
						await fallbackRedirect();
					}
				}}
			>
				<img
					src="https://www.svgrepo.com/show/475656/google-color.svg"
					alt="Google"
					className={iconClassName}
				/>
				{label}
			</button>

			{gsiStatus === "ready" && !error ? (
				<div style={{ color: "#6b7280", fontSize: 12, textAlign: "center" }}>
					如果点击无反应，请检查 Google Cloud Console 的 Authorized JavaScript origins 是否包含：
					{" "}
					<code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
						{typeof window !== "undefined" ? window.location.origin : ""}
					</code>{" "}
					（并允许弹窗）。
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
