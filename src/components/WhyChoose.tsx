"use client";

import React from 'react';
import styles from './WhyChoose.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const WhyChoose = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, features } = siteContent.whyChoose;
    const sectionRef = React.useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);
    const [visibleCards, setVisibleCards] = React.useState<Set<number>>(new Set());

    React.useEffect(() => {
        const headerObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.3 }
        );

        const cardObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = Number(entry.target.getAttribute('data-index'));
                    if (entry.isIntersecting) {
                        setVisibleCards((prev) => new Set([...prev, index]));
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -30px 0px' }
        );

        const section = sectionRef.current;
        if (section) {
            headerObserver.observe(section);
            section.querySelectorAll('[data-index]').forEach((card) => cardObserver.observe(card));
        }

        return () => {
            headerObserver.disconnect();
            cardObserver.disconnect();
        };
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.container}>
                <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            data-index={index}
                            className={`${styles.card} ${visibleCards.has(index) ? styles.visible : ''}`}
                            style={{ transitionDelay: `${index * 80}ms` }}
                        >
                            <span className={styles.icon}>{feature.icon}</span>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.description}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChoose;
