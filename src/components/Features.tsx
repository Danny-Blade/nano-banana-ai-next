"use client";

import React from 'react';
import styles from './Features.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const Features = () => {
    const siteContent = useSiteContent();
    const { title, features } = siteContent.whyChoose;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <span className={styles.icon}>{feature.icon}</span>
                            <h3 className={styles.featureTitle}>{feature.title}</h3>
                            <p className={styles.featureDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
