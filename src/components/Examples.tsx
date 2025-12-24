"use client";

import React from 'react';
import styles from './Examples.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const Examples = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, items, promptLabel, tryItLabel } = siteContent.textToImage;
    const sectionRef = React.useRef<HTMLElement>(null);
    const [visibleCards, setVisibleCards] = React.useState<Set<number>>(new Set());
    const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);

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
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        const cards = sectionRef.current?.querySelectorAll('[data-index]');
        cards?.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className={styles.examplesSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.badge}>Text to Image</div>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            data-index={index}
                            className={`${styles.card} ${visibleCards.has(index) ? styles.visible : ''}`}
                            style={{ transitionDelay: `${index * 80}ms` }}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className={styles.imageWrapper}>
                                <img
                                    src={item.image}
                                    alt={item.prompt}
                                    className={styles.image}
                                />
                                <div className={`${styles.overlay} ${hoveredCard === index ? styles.overlayVisible : ''}`}>
                                    <a href="/dashboard" className={styles.tryButton}>
                                        {tryItLabel}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div className={styles.content}>
                                <div className={styles.promptBadge}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                    </svg>
                                    {promptLabel}
                                </div>
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
