"use client";

import React from 'react';
import styles from './Footer.module.css';
import Image from 'next/image';
import { LocaleLink } from "@/components/I18nProvider";
import { useSiteContent } from "@/components/useSiteContent";

const ShieldIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
);

const CertificateIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
);

const MailIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
);

const getBadgeIcon = (icon: string) => {
    switch (icon) {
        case 'shield': return <ShieldIcon />;
        case 'lock': return <LockIcon />;
        case 'certificate': return <CertificateIcon />;
        default: return null;
    }
};

const Footer = () => {
    const siteContent = useSiteContent();
    const {
        logo,
        logoImage,
        tagline,
        description,
        copyright,
        sections,
        contact,
        badges
    } = siteContent.footer;

    // JSON-LD structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Nano Banana Pro AI",
        "url": "https://ainanobanana.io",
        "logo": logoImage,
        "description": description,
        "contactPoint": {
            "@type": "ContactPoint",
            "email": contact.email,
            "contactType": "customer support"
        }
    };

    return (
        <footer className={styles.footer} role="contentinfo" itemScope itemType="https://schema.org/WPFooter">
            {/* JSON-LD Script for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className={styles.container}>
                {/* Top Section: Brand + Link Columns */}
                <div className={styles.topSection}>
                    {/* Brand Column */}
                    <div className={styles.brandColumn}>
                        <div className={styles.logoWrapper}>
                            {logoImage && (
                                <Image
                                    src={logoImage}
                                    alt={`${logo} logo`}
                                    width={40}
                                    height={40}
                                    className={styles.logoImage}
                                />
                            )}
                            <span className={styles.logoText} itemProp="name">{logo}</span>
                        </div>
                        <p className={styles.tagline}>{tagline}</p>
                        <p className={styles.description} itemProp="description">{description}</p>

                        {/* Trust Badges */}
                        <div className={styles.badges} aria-label="Security certifications">
                            {badges.map((badge: { text: string; icon: string }, index: number) => (
                                <span key={index} className={styles.badge}>
                                    {getBadgeIcon(badge.icon)}
                                    <span>{badge.text}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className={styles.navColumns}>
                        {/* Product Links */}
                        <nav className={styles.navColumn} aria-label={sections.product.title}>
                            <h3 className={styles.columnTitle}>{sections.product.title}</h3>
                            <ul className={styles.linkList}>
                                {sections.product.links.map((link: { label: string; href: string; description: string }, index: number) => (
                                    <li key={index}>
                                        <LocaleLink
                                            href={link.href}
                                            className={styles.navLink}
                                            title={link.description}
                                        >
                                            {link.label}
                                        </LocaleLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Resources Links */}
                        <nav className={styles.navColumn} aria-label={sections.resources.title}>
                            <h3 className={styles.columnTitle}>{sections.resources.title}</h3>
                            <ul className={styles.linkList}>
                                {sections.resources.links.map((link: { label: string; href: string; description: string }, index: number) => (
                                    <li key={index}>
                                        <LocaleLink
                                            href={link.href}
                                            className={styles.navLink}
                                            title={link.description}
                                        >
                                            {link.label}
                                        </LocaleLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Company Links */}
                        <nav className={styles.navColumn} aria-label={sections.company.title}>
                            <h3 className={styles.columnTitle}>{sections.company.title}</h3>
                            <ul className={styles.linkList}>
                                {sections.company.links.map((link: { label: string; href: string; description: string }, index: number) => (
                                    <li key={index}>
                                        <LocaleLink
                                            href={link.href}
                                            className={styles.navLink}
                                            title={link.description}
                                        >
                                            {link.label}
                                        </LocaleLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Contact Column */}
                        <div className={styles.navColumn}>
                            {/* Contact */}
                            <address className={styles.contactSection} itemProp="contactPoint" itemScope itemType="https://schema.org/ContactPoint">
                                <h3 className={styles.columnTitle}>{contact.title}</h3>
                                <a
                                    href={`mailto:${contact.email}`}
                                    className={styles.emailLink}
                                    itemProp="email"
                                >
                                    <MailIcon />
                                    <span>{contact.email}</span>
                                </a>
                            </address>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Copyright */}
                <div className={styles.bottomSection}>
                    <p className={styles.copyright}>{copyright}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
