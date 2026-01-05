"use client";

import React from 'react';
import styles from './ModelComparison.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const ModelComparison = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, tableHeaders, models, footer } = siteContent.modelComparison;
    const sectionRef = React.useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.1 }
        );

        const section = sectionRef.current;
        if (section) {
            observer.observe(section);
        }

        return () => observer.disconnect();
    }, []);

    const renderRating = (rating: number) => {
        return (
            <div className={styles.ratingContainer}>
                {Array.from({ length: 5 }, (_, i) => (
                    <span
                        key={i}
                        className={`${styles.ratingDot} ${i < rating ? styles.filled : styles.empty}`}
                    />
                ))}
            </div>
        );
    };

    const renderCell = (data: { value: string; rating: number; label: string }, isHighlighted: boolean) => {
        return (
            <div className={styles.cellContent}>
                <span className={`${styles.value} ${isHighlighted ? styles.highlighted : ''}`}>
                    {data.value}
                </span>
                {renderRating(data.rating)}
                <span className={styles.label}>{data.label}</span>
            </div>
        );
    };

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.container}>
                <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={`${styles.tableWrapper} ${isVisible ? styles.visible : ''}`}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>{tableHeaders.model}</th>
                                <th className={styles.th}>{tableHeaders.speed}</th>
                                <th className={styles.th}>{tableHeaders.quality}</th>
                                <th className={styles.th}>{tableHeaders.editingCapability}</th>
                                <th className={styles.th}>{tableHeaders.characterConsistency}</th>
                                <th className={styles.th}>{tableHeaders.pricing}</th>
                                <th className={styles.th}>{tableHeaders.multiLanguage}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {models.map((model, index) => (
                                <tr
                                    key={index}
                                    className={`${styles.tr} ${model.isHighlighted ? styles.highlightedRow : ''}`}
                                >
                                    <td className={styles.td}>
                                        <div className={styles.modelName}>
                                            <span className={styles.modelIcon}>{model.icon}</span>
                                            <span className={model.isHighlighted ? styles.highlighted : ''}>
                                                {model.name}
                                            </span>
                                            {model.isHighlighted && (
                                                <span className={styles.badge}>Recommended</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        {renderCell(model.speed, model.isHighlighted)}
                                    </td>
                                    <td className={styles.td}>
                                        {renderCell(model.quality, model.isHighlighted)}
                                    </td>
                                    <td className={styles.td}>
                                        {renderCell(model.editingCapability, model.isHighlighted)}
                                    </td>
                                    <td className={styles.td}>
                                        {renderCell(model.characterConsistency, model.isHighlighted)}
                                    </td>
                                    <td className={styles.td}>
                                        {renderCell(model.pricing, model.isHighlighted)}
                                    </td>
                                    <td className={styles.td}>
                                        {renderCell(model.multiLanguage, model.isHighlighted)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className={`${styles.footer} ${isVisible ? styles.visible : ''}`}>
                    {footer}
                </p>
            </div>
        </section>
    );
};

export default ModelComparison;
