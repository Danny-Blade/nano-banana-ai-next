"use client";

import React from 'react';
import styles from './Header.module.css';
import { siteContent } from '@/config/content';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import LoginModal from './LoginModal';

const Header = () => {
    const { logo, logoImage, navLinks, loginButton } = siteContent.header;
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
    const { data: session } = useSession();

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
                                Logout
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
                        aria-label="Toggle menu"
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
