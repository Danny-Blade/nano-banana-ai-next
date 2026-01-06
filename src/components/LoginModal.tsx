"use client";

import React from 'react';
import { signIn } from 'next-auth/react';
import styles from './LoginModal.module.css';
import { useI18n } from "@/components/I18nProvider";
import { trackEvents } from "@/lib/gtag";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    callbackUrl?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, callbackUrl }) => {
    const { t } = useI18n();
    const [oauthError, setOauthError] = React.useState<string | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
    const [isDevLoading, setIsDevLoading] = React.useState(false);
    const [showDevLogin, setShowDevLogin] = React.useState(false);

    React.useEffect(() => {
        // Avoid hydration mismatch: server render has no access to `window`.
        if (typeof window === "undefined") return;
        const host = window.location.hostname;
        // Show dev login on localhost (any port)
        setShowDevLogin(["localhost", "127.0.0.1", "::1"].includes(host));
    }, []);

    const getSafeCallbackUrl = React.useCallback(() => {
        try {
            const raw = callbackUrl?.trim() || "/";
            const url = new URL(raw, window.location.origin);
            if (url.origin !== window.location.origin) return "/";
            return `${url.pathname}${url.search}${url.hash}`;
        } catch {
            return "/";
        }
    }, [callbackUrl]);

    const formatAuthError = React.useCallback((code: string | null | undefined) => {
        switch (code) {
            case "OAuthSignin":
            case "OAuthCallback":
            case "Callback":
                return "Google 授权失败，请检查网络/代理设置后重试。";
            case "CredentialsSignin":
                return "本地 Dev 登录失败，请检查本地环境变量与 D1 初始化。";
            case "AccessDenied":
                return "你已取消授权。";
            case "Configuration":
                return "登录配置错误，请联系管理员。";
            case "Verification":
                return "验证失败，请重试。";
            default:
                return "Google 登录失败，请重试。";
        }
    }, []);

    React.useEffect(() => {
        if (!isOpen) return;

        setOauthError(null);
        setIsGoogleLoading(false);
        setIsDevLoading(false);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;
    const isBusy = isGoogleLoading || isDevLoading;

    return (
        <div className={styles.modalOverlay} onClick={isBusy ? undefined : onClose}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-modal-title"
            >
                <button
                    className={styles.closeButton}
                    onClick={isBusy ? undefined : onClose}
                    aria-label={t("auth.close")}
                    disabled={isBusy}
                >
                    ×
                </button>

                <div className={styles.header}>
                    <h2 id="login-modal-title" className={styles.title}>{t("auth.welcomeBack")}</h2>
                    <p className={styles.subtitle}>{t("auth.subtitle")}</p>
                </div>

                <div className={styles.socialButtons}>
                    <button
                        className={styles.socialBtn}
                        onClick={async () => {
                            setOauthError(null);
                            setIsGoogleLoading(true);
                            try {
                                const result = await signIn("google", {
                                    redirect: false,
                                    // 必须是干净的站内地址；不要用 window.location.href，
                                    // 否则在 /login?callbackUrl=... 场景会出现递归 callbackUrl，导致 cookie 过长/回调失败。
                                    callbackUrl: getSafeCallbackUrl(),
                                });
                                // next-auth 在发生跳转（例如 provider 不存在）时会返回 undefined。
                                // 此时不应在弹窗里提示错误，直接等待页面跳转即可。
                                if (!result) return;
                                // next-auth 在某些情况下会返回非 2xx，但依然给出可用的 url；
                                // 只要 url 存在就直接跳转，避免误报“登录失败”。
                                if (result?.url) {
                                    trackEvents.login('google');
                                    window.location.href = result.url;
                                    return;
                                }
                                console.warn("[auth] google signIn returned:", result);
                                setOauthError(formatAuthError(result?.error));
                            } catch (err) {
                                console.warn("[auth] google signIn failed:", err);
                                setOauthError("Google 登录失败，请检查网络后重试。");
                            } finally {
                                setIsGoogleLoading(false);
                            }
                        }}
                        disabled={isGoogleLoading}
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt=""
                            aria-hidden="true"
                            className={styles.icon}
                        />
                        {isGoogleLoading ? `${t("auth.continueWithGoogle")}…` : t("auth.continueWithGoogle")}
                    </button>

                    {showDevLogin ? (
                        <button
                            className={styles.socialBtn}
                            onClick={async () => {
                                setOauthError(null);
                                setIsDevLoading(true);
                                try {
                                    const result = await signIn("dev", {
                                        redirect: false,
                                        callbackUrl: getSafeCallbackUrl(),
                                    });
                                    if (!result) return;
                                    if (result?.url) {
                                        // If the provider is missing/misconfigured, NextAuth can bounce back to /api/auth/signin.
                                        // Don't treat that as success.
                                        if (result.url.includes("/api/auth/signin")) {
                                            setOauthError(
                                                "Dev 登录未启用：请在 `.dev.vars` 设置 DEV_AUTH_BYPASS=true，然后重启 wrangler。",
                                            );
                                            return;
                                        }
                                        trackEvents.login('dev');
                                        window.location.href = result.url;
                                        return;
                                    }
                                    console.warn("[auth] dev signIn returned:", result);
                                    setOauthError(formatAuthError(result?.error));
                                } catch (err) {
                                    console.warn("[auth] dev signIn failed:", err);
                                    setOauthError(formatAuthError("CredentialsSignin"));
                                } finally {
                                    setIsDevLoading(false);
                                }
                            }}
                            disabled={isDevLoading || isGoogleLoading}
                        >
                            {isDevLoading ? `${t("auth.continueWithDev")}…` : t("auth.continueWithDev")}
                        </button>
                    ) : null}
                  </div>

                {oauthError ? (
                    <div className={styles.error} role="alert">
                        {oauthError}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default LoginModal;
