"use client";

import React from 'react';
import styles from './Examples.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const Examples = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, items, promptLabel, tryItLabel, moreLabel } = siteContent.textToImage;
    const sectionRef = React.useRef<HTMLElement>(null);
    const [visibleCards, setVisibleCards] = React.useState<Set<number>>(new Set());
    const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);
    const [previewImage, setPreviewImage] = React.useState<{ src: string; prompt: string } | null>(null);

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

    const handleImageClick = (e: React.MouseEvent, src: string, prompt: string) => {
        e.stopPropagation();
        setPreviewImage({ src, prompt });
    };

    const closePreview = () => {
        setPreviewImage(null);
    };

    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closePreview();
        };
        if (previewImage) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [previewImage]);

    return (
        <section ref={sectionRef} className={styles.examplesSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.badge}>Text to Image</div>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                    <a href="/prompt" className={styles.moreButton}>
                        {moreLabel}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>

                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            data-index={index}
                            className={`${styles.card} ${visibleCards.has(index) ? styles.visible : ''}`}
                            style={{ animationDelay: `${index * 80}ms` }}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div
                                className={styles.imageWrapper}
                                onClick={(e) => handleImageClick(e, item.image, item.prompt)}
                                style={{ cursor: 'zoom-in' }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.prompt}
                                    className={styles.image}
                                />
                                <div className={`${styles.overlay} ${hoveredCard === index ? styles.overlayVisible : ''}`}>
                                    <a
                                        href={`/dashboard?prompt=${encodeURIComponent(item.prompt)}`}
                                        className={styles.tryButton}
                                        onClick={(e) => e.stopPropagation()}
                                    >
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

            {/* Image Preview Modal */}
            {previewImage && (
                <div className={styles.previewOverlay} onClick={closePreview}>
                    <button className={styles.closeButton} onClick={closePreview} aria-label="Close preview">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                    <div className={styles.previewContent} onClick={(e) => e.stopPropagation()}>
                        <img
                            src={previewImage.src}
                            alt={previewImage.prompt}
                            className={styles.previewImage}
                        />
                        <div className={styles.previewPrompt}>
                            <div className={styles.promptBadge}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                {promptLabel}
                            </div>
                            <p className={styles.previewPromptText}>{previewImage.prompt}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Examples;
