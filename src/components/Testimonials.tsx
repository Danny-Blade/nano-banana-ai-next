"use client";

import React from 'react';
import styles from './Testimonials.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const Testimonials = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, items } = siteContent.testimonials;
    const sectionRef = React.useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);
    const [visibleCards, setVisibleCards] = React.useState<Set<number>>(new Set());

    React.useEffect(() => {
        const headerObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.2 }
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
            { threshold: 0.15, rootMargin: '0px 0px -20px 0px' }
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

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>
                ★
            </span>
        ));
    };

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
                            data-index={index}
                            className={`${styles.card} ${visibleCards.has(index) ? styles.visible : ''}`}
                            style={{ transitionDelay: `${(index % 4) * 100}ms` }}
                        >
                            <div className={styles.cardHeader}>
                                <img
                                    src={item.avatar}
                                    alt={item.name}
                                    className={styles.avatar}
                                />
                                <div className={styles.userInfo}>
                                    <h4 className={styles.userName}>{item.name}</h4>
                                    <span className={styles.userRole}>{item.role}</span>
                                </div>
                            </div>
                            <div className={styles.stars}>
                                {renderStars(item.rating)}
                            </div>
                            <p className={styles.content}>{item.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
