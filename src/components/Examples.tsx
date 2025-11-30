"use client";

import React from 'react';
import styles from './Examples.module.css';
import { siteContent } from '@/config/content';

const Examples = () => {
    const { title, items } = siteContent.examples;

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
                                <img src={item.after} alt="Result" className={styles.image} />
                                <span className={styles.label}>After</span>
                            </div>
                            <div className={styles.prompt}>
                                <span className={styles.promptLabel}>Prompt used:</span>
                                <p className={styles.promptText}>"{item.prompt}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Examples;
