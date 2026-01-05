"use client";

import React from 'react';
import styles from './CommunityGallery.module.css';
import { useI18n, LocaleLink } from "@/components/I18nProvider";
import { useSiteContent } from "@/components/useSiteContent";

const CommunityGallery = () => {
    const { localePath } = useI18n();
    const siteContent = useSiteContent();
    const { title, subtitle, items, beforeLabel, afterLabel, promptLabel, tryItLabel, moreLabel } = siteContent.imageToImageExamples;
    const sectionRef = React.useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);
    const [visibleCards, setVisibleCards] = React.useState<Set<number>>(new Set());
    const [sliderPositions, setSliderPositions] = React.useState<{ [key: number]: number }>({});
    const [activeSlider, setActiveSlider] = React.useState<number | null>(null);

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
            { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
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

    const handleSliderMove = (e: React.MouseEvent | React.TouchEvent, index: number, element: HTMLDivElement) => {
        const rect = element.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPositions(prev => ({ ...prev, [index]: percentage }));
    };

    const handleMouseDown = (index: number) => {
        setActiveSlider(index);
    };

    const handleMouseUp = () => {
        setActiveSlider(null);
    };

    React.useEffect(() => {
        if (activeSlider !== null) {
            const handleGlobalMouseUp = () => setActiveSlider(null);
            window.addEventListener('mouseup', handleGlobalMouseUp);
            window.addEventListener('touchend', handleGlobalMouseUp);
            return () => {
                window.removeEventListener('mouseup', handleGlobalMouseUp);
                window.removeEventListener('touchend', handleGlobalMouseUp);
            };
        }
    }, [activeSlider]);

    return (
        <section ref={sectionRef} className={styles.gallerySection}>
            <div className={styles.container}>
                <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
                    <div className={styles.badge}>Image to Image</div>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.grid}>
                    {items.map((item, index) => {
                        const sliderPos = sliderPositions[index] ?? 50;
                        return (
                            <div
                                key={index}
                                data-index={index}
                                className={`${styles.card} ${visibleCards.has(index) ? styles.visible : ''}`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div
                                    className={styles.comparisonWrapper}
                                    onMouseMove={(e) => activeSlider === index && handleSliderMove(e, index, e.currentTarget)}
                                    onTouchMove={(e) => activeSlider === index && handleSliderMove(e, index, e.currentTarget)}
                                    onMouseDown={() => handleMouseDown(index)}
                                    onTouchStart={() => handleMouseDown(index)}
                                    onMouseUp={handleMouseUp}
                                    onTouchEnd={handleMouseUp}
                                >
                                    {/* After Image (Background) */}
                                    <img
                                        src={item.after}
                                        alt="After"
                                        className={styles.afterImage}
                                    />

                                    {/* Before Image (Clipped) */}
                                    <div
                                        className={styles.beforeWrapper}
                                        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                                    >
                                        <img
                                            src={item.before}
                                            alt="Before"
                                            className={styles.beforeImage}
                                        />
                                    </div>

                                    {/* Slider Handle */}
                                    <div
                                        className={styles.sliderHandle}
                                        style={{ left: `${sliderPos}%` }}
                                    >
                                        <div className={styles.sliderLine} />
                                        <div className={styles.sliderKnob}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M18 8l4 4-4 4" />
                                                <path d="M6 8l-4 4 4 4" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Labels */}
                                    <div className={styles.labels}>
                                        <span className={styles.beforeLabel}>{beforeLabel}</span>
                                        <span className={styles.afterLabel}>{afterLabel}</span>
                                    </div>
                                </div>

                                <div className={styles.content}>
                                    <div className={styles.promptSection}>
                                        <div className={styles.promptBadge}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                            </svg>
                                            {promptLabel}
                                        </div>
                                        <p className={styles.promptText}>{item.prompt}</p>
                                    </div>
                                    <a href={localePath(`/dashboard?prompt=${encodeURIComponent(item.prompt)}&refImage=${encodeURIComponent(item.before)}`)} className={styles.tryButton}>
                                        {tryItLabel}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.moreButtonWrapper}>
                    <LocaleLink href="/prompt" className={styles.moreButton}>
                        {moreLabel}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </LocaleLink>
                </div>
            </div>
        </section>
    );
};

export default CommunityGallery;
