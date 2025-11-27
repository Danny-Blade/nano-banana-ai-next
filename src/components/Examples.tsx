"use client";

import React from 'react';
import styles from './Examples.module.css';
import { siteContent } from '@/config/content';

const Examples = () => {
    const { title, items } = siteContent.examples;
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const nextExample = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevExample = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const currentExample = items[currentIndex];

    return (
        <section className={styles.examplesSection}>
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>

                <div className={styles.exampleViewer}>
                    <div className={styles.imageComparison}>
                        <div className={styles.imageBox}>
                            <span className={styles.label}>Before</span>
                            <div className={styles.imagePlaceholder}>
                                <img src={currentExample.before} alt="Before transformation" />
                            </div>
                        </div>

                        <div className={styles.arrow}>→</div>

                        <div className={styles.imageBox}>
                            <span className={styles.label}>After</span>
                            <div className={styles.imagePlaceholder}>
                                <img src={currentExample.after} alt="After transformation" />
                            </div>
                        </div>
                    </div>

                    <div className={styles.promptDisplay}>
                        <strong>Prompt used:</strong>
                        <p>"{currentExample.prompt}"</p>
                    </div>

                    <div className={styles.navigation}>
                        <button
                            className={styles.navBtn}
                            onClick={prevExample}
                            aria-label="Previous example"
                        >
                            ←
                        </button>
                        <span className={styles.counter}>
                            {currentIndex + 1} / {items.length}
                        </span>
                        <button
                            className={styles.navBtn}
                            onClick={nextExample}
                            aria-label="Next example"
                        >
                            →
                        </button>
                    </div>

                    <p className={styles.hint}>
                        Click on images to view full size • Swipe or use arrows to see more examples
                    </p>
                </div>

                <div className={styles.thumbnails}>
                    {items.map((item, index) => (
                        <button
                            key={index}
                            className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        >
                            <div className={styles.thumbnailPlaceholder}>
                                <img src={item.after} alt={`Example ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Examples;
