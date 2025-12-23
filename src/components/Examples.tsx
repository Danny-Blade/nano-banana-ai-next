"use client";

import React from 'react';
import styles from './Examples.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const Examples = () => {
    const siteContent = useSiteContent();
    const { title, items, resultAlt, afterLabel, promptUsedLabel } = siteContent.examples;
    const sectionRef = React.useRef<HTMLElement>(null);
    const [visibleCards, setVisibleCards] = React.useState<Set<number>>(new Set());

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = Number(entry.target.getAttribute('data-index'));
                    if (entry.isIntersecting) {
                        setVisibleCards((prev) => new Set([...prev, index]));
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
        );

        const cards = sectionRef.current?.querySelectorAll('[data-index]');
        cards?.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className={styles.examplesSection}>
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>

                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            data-index={index}
                            className={`${styles.card} ${visibleCards.has(index) ? styles.visible : ''}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className={styles.imageComparison}>
                                <img src={item.after} alt={resultAlt} className={styles.image} />
                                <span className={styles.label}>{afterLabel}</span>
                            </div>
                            <div className={styles.prompt}>
                                <span className={styles.promptLabel}>{promptUsedLabel}</span>
                                <p className={styles.promptText}>{item.prompt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Examples;
