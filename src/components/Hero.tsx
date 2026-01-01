"use client";

import React from 'react';
import styles from './Hero.module.css';
import Link from 'next/link';
import { useSiteContent } from "@/components/useSiteContent";

const Hero = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, ctaPrimary, ctaSecondary, ctaPrimaryHref, ctaSecondaryHref } = siteContent.hero;
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className={styles.hero}>
            {/* 背景装饰元素 */}
            <div className={styles.bgDecor}>
                <div className={styles.bgCircle1} />
                <div className={styles.bgCircle2} />
                <div className={styles.bgCircle3} />
            </div>

            <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.subtitle}>{subtitle}</p>
                <div className={styles.ctaGroup}>
                    <Link href={ctaPrimaryHref || '/dashboard'} className={styles.primaryBtn}>
                        {ctaPrimary}
                        <span className={styles.btnArrow}>→</span>
                    </Link>
                    {ctaSecondary && ctaSecondaryHref && (
                        <Link href={ctaSecondaryHref} className={styles.secondaryBtn}>
                            {ctaSecondary}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;
