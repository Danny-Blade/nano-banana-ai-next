"use client";

import React from 'react';
import { signIn } from 'next-auth/react';
import styles from './LoginModal.module.css';
import { useI18n } from "@/components/I18nProvider";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();
    const [oauthError, setOauthError] = React.useState<string | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) return;

        setOauthError(null);
        setIsGoogleLoading(false);

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

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-modal-title"
            >
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label={t("auth.close")}
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
                                    callbackUrl: window.location.href,
                                });
                                if (result?.ok && result.url) {
                                    window.location.href = result.url;
                                    return;
                                }
                                setOauthError(result?.error || "Google 登录失败，请重试。");
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
