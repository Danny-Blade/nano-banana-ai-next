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
    if (!isOpen) return null;
    const { t } = useI18n();

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label={t("auth.close")}
                >
                    ×
                </button>

                <h2 className={styles.title}>{t("auth.welcomeBack")}</h2>
                <p className={styles.subtitle}>{t("auth.subtitle")}</p>

                <div className={styles.socialButtons}>
                    <button
                        className={styles.socialBtn}
                        onClick={() => signIn('google')}
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className={styles.icon} />
                        {t("auth.continueWithGoogle")}
                    </button>

                    <button
                        className={styles.socialBtn}
                        onClick={() => signIn('facebook')}
                    >
                        <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className={styles.icon} />
                        {t("auth.continueWithFacebook")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
