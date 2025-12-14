"use client";

import React from 'react';
import styles from './Examples.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const Examples = () => {
    const siteContent = useSiteContent();
    const { title, items, resultAlt, afterLabel, promptUsedLabel } = siteContent.examples;

    return (
        <section className={styles.examplesSection}>
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>

                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.imageComparison}>
                                {/* For simplicity, showing the 'after' image as the result. 
                                    In a real comparison, we'd have a slider or toggle. */}
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
