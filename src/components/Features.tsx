import React from 'react';
import styles from './Features.module.css';
import { siteContent } from '@/config/content';

const Features = () => {
    const { title, items } = siteContent.features;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <h3 className={styles.question}>{item.question}</h3>
                            <p className={styles.answer}>{item.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
