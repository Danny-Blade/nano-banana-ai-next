"use client";

import React from 'react';
import { signIn } from 'next-auth/react';
import styles from './LoginModal.module.css';
import { useI18n } from "@/components/I18nProvider";
import GooglePlatformSignIn from "@/components/GooglePlatformSignIn";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();
    if (!isOpen) return null;

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
                    <div className={styles.googleSignInWrap}>
                        <GooglePlatformSignIn
                            onSignedIn={onClose}
                            label={t("auth.continueWithGoogle")}
                            buttonClassName={styles.socialBtn}
                            iconClassName={styles.icon}
                        />
                    </div>

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
