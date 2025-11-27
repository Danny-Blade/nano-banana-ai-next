"use client";

import React from 'react';
import styles from './Header.module.css';
import { siteContent } from '@/config/content';
import Link from 'next/link';

const Header = () => {
    const { logo, logoImage, navLinks, loginButton } = siteContent.header;
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
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
                <button className={styles.loginBtn}>{loginButton}</button>

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
    );
};

export default Header;
