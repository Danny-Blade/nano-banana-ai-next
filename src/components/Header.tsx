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
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
    const userMenuRef = React.useRef<HTMLDivElement>(null);
    const { data: session } = useSession();
    const { locale, setLocale, t } = useI18n();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setIsUserMenuOpen(false);
    };

    React.useEffect(() => {
        if (!isUserMenuOpen) return;

        const onMouseDown = (e: MouseEvent) => {
            const root = userMenuRef.current;
            if (!root) return;
            if (e.target instanceof Node && root.contains(e.target)) return;
            setIsUserMenuOpen(false);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsUserMenuOpen(false);
        };

        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isUserMenuOpen]);

    React.useEffect(() => {
        if (!session) setIsUserMenuOpen(false);
    }, [session]);

    const userName = session?.user?.name?.trim() ? session.user.name : null;
    const userEmail = session?.user?.email?.trim() ? session.user.email : null;
    const userDisplayName = userName ?? userEmail ?? "";
    const userInitial = (userDisplayName.trim().charAt(0) || 'U').toLocaleUpperCase();
    const credits = session?.user?.credits ?? 0;
    const userEmailToShow = userEmail && userEmail !== userDisplayName ? userEmail : null;

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
                        <div className={styles.userMenu} ref={userMenuRef}>
                            <button
                                type="button"
                                className={styles.userAvatarBtn}
                                aria-label={t("common.userMenu")}
                                aria-haspopup="menu"
                                aria-expanded={isUserMenuOpen}
                                onClick={() => {
                                    setIsUserMenuOpen(!isUserMenuOpen);
                                    setIsMenuOpen(false);
                                }}
                            >
                                <span className={styles.userAvatarInitial}>{userInitial}</span>
                            </button>

                            {isUserMenuOpen ? (
                                <div className={styles.userDropdown} role="menu">
                                    <div className={styles.userDropdownHeader}>
                                        <div className={styles.userDropdownAvatar} aria-hidden="true">
                                            {userInitial}
                                        </div>
                                        <div className={styles.userDropdownMeta}>
                                            <div className={styles.userDropdownName}>
                                                {userDisplayName || "User"}
                                            </div>
                                            {userEmailToShow ? (
                                                <div className={styles.userDropdownEmail}>{userEmailToShow}</div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className={styles.userDropdownStats}>
                                        <div className={styles.userDropdownStatLabel}>{t("common.credits")}</div>
                                        <div className={styles.userDropdownStatValue}>{credits}</div>
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.userDropdownLogout}
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            void signOut({ redirect: false });
                                        }}
                                    >
                                        {logoutButton}
                                    </button>
                                </div>
                            ) : null}
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
