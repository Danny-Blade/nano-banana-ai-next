"use client";

import React from 'react';
import styles from './Stats.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const Stats = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, items } = siteContent.stats;
    const sectionRef = React.useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.3 }
        );

        const section = sectionRef.current;
        if (section) {
            observer.observe(section);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.container}>
                <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={`${styles.card} ${isVisible ? styles.visible : ''}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <span className={styles.value}>{item.value}</span>
                            <span className={styles.label}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
