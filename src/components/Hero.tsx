import React from 'react';
import styles from './Hero.module.css';
import { siteContent } from '@/config/content';
import Link from 'next/link';

const Hero = () => {
    const { title, subtitle, ctaPrimary, ctaSecondary, ctaPrimaryHref, ctaSecondaryHref } = siteContent.hero;

    return (
        <section className={`${styles.hero} animate-fade-in-up`}>
            <div className="container">
                <div className={styles.announcement}>
                    ✨ Powered by Google's Latest AI Technology
                </div>
                <h1 className={styles.title}>
                    <span className="gradient-text">Nano Banana AI</span>
                    <br />
                    Advanced Image Generation
                </h1>
                <p className={styles.subtitle}>{subtitle}</p>
                <div className={styles.ctaGroup}>
                    <Link
                        href={ctaPrimaryHref || '/dashboard'}
                        className={`${styles.primaryBtn} btn btn-primary focus-ring`}
                    >
                        {ctaPrimary}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </Link>
                    <Link
                        href={ctaSecondaryHref || '/image-to-video'}
                        className={`${styles.secondaryBtn} btn btn-secondary focus-ring`}
                    >
                        {ctaSecondary}
                    </Link>
                </div>

                {/* Demo Image */}
                <div className={styles.imageWrapper}>
                    <img
                        src="https://cdn.ainanobanana.io/ai-poster.png"
                        alt="Nano Banana AI - AI Image Generation Demo"
                        className={styles.heroImage}
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;

