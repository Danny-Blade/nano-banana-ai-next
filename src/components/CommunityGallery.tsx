"use client";

import React from 'react';
import styles from './CommunityGallery.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const CommunityGallery = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, showcases, promptLabel, videoPromptLabel } = siteContent.communityGallery;
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

    return (
        <section ref={sectionRef} className={styles.gallerySection}>
            <div className={styles.container}>
                <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.grid}>
                    {showcases.map((item, index) => (
                        <div
                            key={index}
                            data-index={index}
                            className={`${styles.card} ${visibleCards.has(index) ? styles.visible : ''}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className={styles.mediaWrapper}>
                                {item.video ? (
                                    <video
                                        src={item.video}
                                        className={styles.media}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        poster={item.image}
                                    />
                                ) : (
                                    <img src={item.image} alt={item.title} className={styles.media} />
                                )}
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.cardTitle}>{item.title}</h3>

                                <span className={styles.promptLabel}>{promptLabel}</span>
                                <p className={styles.promptText}>{item.prompt}</p>

                                {item.videoPrompt && (
                                    <>
                                        <span className={styles.promptLabel}>{videoPromptLabel}</span>
                                        <p className={styles.promptText}>{item.videoPrompt}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CommunityGallery;
