"use client";

import React from 'react';
import { signIn } from 'next-auth/react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>

                <h2 className={styles.title}>Welcome Back</h2>
                <p className={styles.subtitle}>Sign in to continue to Nano Banana AI</p>

                <div className={styles.socialButtons}>
                    <button
                        className={styles.socialBtn}
                        onClick={() => signIn('google')}
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className={styles.icon} />
                        Continue with Google
                    </button>

                    <button
                        className={styles.socialBtn}
                        onClick={() => signIn('facebook')}
                    >
                        <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className={styles.icon} />
                        Continue with Facebook
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
