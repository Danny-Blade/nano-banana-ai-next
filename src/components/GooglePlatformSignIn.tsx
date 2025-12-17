"use client";

import React from "react";
import { signIn } from "next-auth/react";

declare global {
	interface Window {
		gapi?: unknown;
	}
}

const GOOGLE_CLIENT_ID =
	process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
	"5783249126-pofhal0pprh4dfguso8u5luhov883jdm.apps.googleusercontent.com";

const ENABLE_GOOGLE_OAUTH_REDIRECT_FALLBACK =
	process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH_REDIRECT_FALLBACK !== "false"; // Default to true for better UX in restricted networks

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGapiButtonActuallyRendered(container: HTMLElement): boolean {
	// gapi.signin2.render 通常会往容器里插入 iframe 或 div 按钮
	if (container.childNodes.length === 0) return false;

	const iframe = container.querySelector("iframe");
	if (iframe) {
		const rect = iframe.getBoundingClientRect();
		return rect.width > 10 && rect.height > 10;
	}

	const firstElement = container.firstElementChild as HTMLElement | null;
	if (firstElement) {
		const rect = firstElement.getBoundingClientRect();
		return rect.width > 10 && rect.height > 10;
	}

	return true;
}

async function waitForGapiButtonRender(
	container: HTMLElement,
	options: { timeoutMs: number; isCancelled: () => boolean },
) {
	const start = Date.now();
	while (!options.isCancelled()) {
		if (isGapiButtonActuallyRendered(container)) return true;
		if (Date.now() - start > options.timeoutMs) return false;
		await sleep(50);
	}
	return false;
}

type GapiLike = {
	load: (feature: string, callback: () => void) => void;
	signin2: {
		render: (
			container: HTMLElement,
			options: {
				scope: string;
				width: number;
				height: number;
				longtitle: boolean;
				theme: "light" | "dark";
				onsuccess: (googleUser: unknown) => void;
				onfailure: (err: unknown) => void;
			},
		) => void;
	};
};

type GapiAuth2Init = (options: {
	client_id: string;
	cookiepolicy: string;
	scope: string;
}) => Promise<unknown>;

function getGapiBaseLike(): GapiLike | null {
	const gapi = (window as unknown as { gapi?: unknown }).gapi;
	if (!gapi || typeof gapi !== "object") return null;
	const record = gapi as Record<string, unknown>;

	const load = record.load;
	const signin2 = record.signin2;
	if (typeof load !== "function") return null;
	if (!signin2 || typeof signin2 !== "object") return null;

	const signin2Render = (signin2 as Record<string, unknown>).render;
	if (typeof signin2Render !== "function") return null;

	return {
		load: load as GapiLike["load"],
		signin2: { render: signin2Render as GapiLike["signin2"]["render"] },
	};
}

function getGapiAuth2Init(): GapiAuth2Init | null {
	const gapi = (window as unknown as { gapi?: unknown }).gapi;
	if (!gapi || typeof gapi !== "object") return null;
	const record = gapi as Record<string, unknown>;

	const auth2 = record.auth2;
	if (!auth2 || typeof auth2 !== "object") return null;
	const init = (auth2 as Record<string, unknown>).init;
	if (typeof init !== "function") return null;

	return init as GapiAuth2Init;
}

function getIdTokenFromGoogleUser(googleUser: unknown): string | null {
	if (!googleUser || typeof googleUser !== "object") return null;
	const getAuthResponse = (googleUser as Record<string, unknown>).getAuthResponse;
	if (typeof getAuthResponse !== "function") return null;
	const authResponse = (getAuthResponse as () => unknown)();
	if (!authResponse || typeof authResponse !== "object") return null;
	const idToken = (authResponse as Record<string, unknown>).id_token;
	return typeof idToken === "string" && idToken.trim() ? idToken : null;
}

function isGapiDeprecatedClientError(err: unknown): boolean {
	if (!err || typeof err !== "object") return false;
	const record = err as Record<string, unknown>;
	const code = record.error;
	const details = record.details;
	return (
		code === "idpiframe_initialization_failed" &&
		typeof details === "string" &&
		details.toLowerCase().includes("deprecated")
	);
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
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [error, setError] = React.useState<string | null>(null);
	const [gapiStatus, setGapiStatus] = React.useState<
		"loading" | "ready" | "failed"
	>("loading");

	React.useEffect(() => {
		let cancelled = false;
		const start = Date.now();

		const init = async () => {
			// 检查是否有有效的 Google Client ID
			if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes("your-google-client-id")) {
				if (!cancelled) {
					setError("Google Client ID 未配置，请检查环境变量。");
					setGapiStatus("failed");
				}
				return;
			}

			console.log("[google] Starting Google Platform initialization with Client ID:", GOOGLE_CLIENT_ID.substring(0, 10) + "...");

			// 等待 platform.js 注入 window.gapi
			while (!cancelled) {
				const gapi = getGapiBaseLike();
				if (gapi) {
					console.log("[google] Found gapi object");
					break;
				}

				if (Date.now() - start > 5_000) { // Reduced timeout to 5s
					if (!cancelled) {
						console.warn("[google] Platform.js loading timeout after 5 seconds, enabling fallback");
						// Instead of failing, we just set status to 'failed' which renders the fallback button
                        // But we want to auto-enable the fallback button immediately if script is slow
                        setGapiStatus("failed");
                        // Don't set error here, let the user click the button to try redirect flow
					}
					return;
				}
				await sleep(50);
			}

			if (cancelled) return;
			const gapi = getGapiBaseLike();
			if (!gapi) {
				console.error("[google] Gapi object not found after loading");
				return;
			}

			// 初始化并渲染 Google 登录按钮（按官方文档使用 platform.js）
			gapi.load("auth2", () => {
				void (async () => {
					try {
						console.log("[google] Initializing Google Auth2");
						const auth2Init = getGapiAuth2Init();
						if (!auth2Init) {
							throw new Error("gapi.auth2.init 不可用（auth2 未加载或被阻止）");
						}

						await auth2Init({
							client_id: GOOGLE_CLIENT_ID,
							cookiepolicy: "single_host_origin",
							scope: "profile email",
						});

						if (!containerRef.current || cancelled) return;
						containerRef.current.innerHTML = "";

						console.log("[google] Rendering Google Sign-In button");
						gapi.signin2.render(containerRef.current, {
							scope: "profile email",
							width: 320,
							height: 44,
							longtitle: true,
							theme: "light",
							onsuccess: async (googleUser: unknown) => {
								console.log("[google] Sign-in successful");
								try {
									const idToken = getIdTokenFromGoogleUser(googleUser);
									if (!idToken) {
										if (!cancelled) {
											setError("未获取到 Google id_token，请重试。");
										}
										return;
									}

									console.log("[google] Got ID token, calling NextAuth");

									// 用 NextAuth 的 credentials provider 换取本站 session
									const result = await signIn("credentials", {
										idToken,
										redirect: false,
									});

									if (result?.ok) {
										if (!cancelled) setError(null);
										onSignedIn?.();
									} else {
										console.error("[google] NextAuth failed:", result);
										if (!cancelled) {
											setError(result?.error || "登录失败，请重试。");
										}
									}
								} catch (err) {
									console.warn("[google] signIn failed:", err);
									if (!cancelled) setError("登录失败，请重试。");
								}
							},
							onfailure: (err: unknown) => {
								console.warn("[google] gapi sign-in failed:", err);
								if (!cancelled) setError("Google 登录失败，请重试。");
							},
						});

						// 注意：如果容器在 render 时被 display:none，可能会导致按钮尺寸为 0，进而"看不见"。
						// 这里等待一小段时间确认按钮真实渲染成功后，再隐藏兜底按钮。
						const rendered = await waitForGapiButtonRender(containerRef.current, {
							timeoutMs: 2_000,
							isCancelled: () => cancelled,
						});
						console.log("[google] Button render result:", rendered);
						if (!cancelled) {
							setGapiStatus(rendered ? "ready" : "failed");
							if (!rendered) {
								setError("Google 登录按钮渲染失败，将使用备选登录方式。");
							}
						}
					} catch (err) {
						console.error("[google] init failed:", err);
						if (!cancelled) {
							// 对“platform.js/auth2 已弃用”的情况：不显示红色错误，直接使用 OAuth 重定向兜底按钮即可。
							if (isGapiDeprecatedClientError(err)) {
								setError(null);
							} else {
								setError("Google 初始化失败，请检查 client_id 配置与网络。");
							}
							setGapiStatus("failed");
						}
					}
				})();
			});
		};

		init();
		return () => {
			cancelled = true;
		};
	}, [onSignedIn]);

	return (
		<div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
			{gapiStatus !== "ready" ? (
				<button
					type="button"
					className={buttonClassName}
					disabled={false}
					onClick={async () => {
                        // Even if loading, allow user to click to force redirect flow if they are impatient or network is blocked
						if (!ENABLE_GOOGLE_OAUTH_REDIRECT_FALLBACK) {
							setError(
								"当前网络无法加载 Google 登录组件（apis.google.com）。请开启代理/VPN 后刷新重试。",
							);
							return;
						}

						try {
							// 兜底：如果 platform.js 被拦截/加载失败，允许走 NextAuth 的 OAuth 重定向方案（redirect=false 便于展示错误）。
							const result = await signIn("google", { redirect: false });
							if (result?.ok && result.url) {
								window.location.href = result.url;
								return;
							}
							setError(result?.error || "Google 登录失败，请检查网络/代理设置。");
						} catch (err) {
							console.warn("[google] fallback signIn failed:", err);
							setError("Google 登录失败，请检查网络/代理设置。");
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
			) : null}

			<div style={{ display: "flex", justifyContent: "center" }}>
				<div
					ref={containerRef}
					style={{
						// 保持容器可见（不要用 display:none），否则 gapi 可能渲染出 0 尺寸按钮
						width: 320,
						height: 44,
						opacity: gapiStatus === "ready" ? 1 : 0,
						pointerEvents: gapiStatus === "ready" ? "auto" : "none",
					}}
				/>
			</div>
			{error ? (
				<div style={{ color: "#ef4444", fontSize: 12, textAlign: "center" }}>
					{error}
				</div>
			) : null}
		</div>
	);
}
