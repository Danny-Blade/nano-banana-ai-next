import React from 'react';
import styles from './Footer.module.css';
import { siteContent } from '@/config/content';
import Link from 'next/link';

const Footer = () => {
    const { logo, copyright, links } = siteContent.footer;

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div>
                        <span className={styles.logo}>{logo}</span>
                    </div>
                    <div className={styles.links}>
                        {links.map((link, index) => (
                            <Link key={index} href={link.href} className={styles.link}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className={styles.bottom}>
                    <p>{copyright}</p>
                    {/* Language selector could go here */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
