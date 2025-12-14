"use client";

import React from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import LoginModal from './LoginModal';
import { useI18n } from "@/components/I18nProvider";
import type { Locale } from "@/lib/i18n";
import { useSiteContent } from "@/components/useSiteContent";

const Header = () => {
    const siteContent = useSiteContent();
    const { logo, logoImage, navLinks, loginButton, logoutButton, toggleMenuAriaLabel } = siteContent.header;
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
    const { data: session } = useSession();
    const { locale, setLocale, t } = useI18n();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Link href="/">
                        {logoImage ? (
                            <img src={logoImage} alt={logo} height={40} style={{ display: 'block' }} />
                        ) : (
                            logo
                        )}
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className={styles.nav}>
                    {navLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={styles.navLink}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.langSwitch}>
                        <span className={styles.langLabel}>{t("common.language")}</span>
                        <select
                            className={styles.langSelect}
                            value={locale}
                            onChange={(e) => setLocale(e.target.value as Locale)}
                            aria-label={t("common.language")}
                        >
                            <option value="en">English</option>
                            <option value="zh">中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                        </select>
                    </div>
                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium hidden md:block">
                                {session.user?.name || session.user?.email}
                            </span>
                            <button
                                onClick={() => signOut()}
                                className={styles.loginBtn}
                                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                            >
                                {logoutButton}
                            </button>
                        </div>
                    ) : (
                        <button
                            className={styles.loginBtn}
                            onClick={() => setIsLoginModalOpen(true)}
                        >
                            {loginButton}
                        </button>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className={`${styles.mobileMenuBtn} ${isMenuOpen ? styles.open : ''}`}
                        onClick={toggleMenu}
                        aria-label={toggleMenuAriaLabel}
                    >
                        <span className={styles.hamburgerLine}></span>
                        <span className={styles.hamburgerLine}></span>
                        <span className={styles.hamburgerLine}></span>
                    </button>
                </div>

                {/* Mobile Nav Overlay */}
                <div className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ''}`}>
                    {navLinks.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className={styles.mobileNavLink}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </header>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    );
};

export default Header;
