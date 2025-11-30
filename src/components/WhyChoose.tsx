"use client";

import React from 'react';
import styles from './WhyChoose.module.css';
import { siteContent } from '@/config/content';

const WhyChoose = () => {
    const { title, subtitle, features } = siteContent.whyChoose;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <span className={styles.icon}>{feature.icon}</span>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.description}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChoose;
