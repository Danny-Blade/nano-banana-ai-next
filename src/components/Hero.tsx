import React from 'react';
import styles from './Hero.module.css';
import { siteContent } from '@/config/content';
import Link from 'next/link';

const Hero = () => {
    const { title, subtitle, ctaPrimary, ctaSecondary, ctaPrimaryHref, ctaSecondaryHref } = siteContent.hero;

    return (
        <section className={styles.hero}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            <div className={styles.ctaGroup}>
                <Link href={ctaPrimaryHref || '/dashboard'} className={styles.primaryBtn}>
                    {ctaPrimary}
                </Link>
                <Link href={ctaSecondaryHref || '/image-to-video'} className={styles.secondaryBtn}>
                    {ctaSecondary}
                </Link>
            </div>
        </section>
    );
};

export default Hero;

