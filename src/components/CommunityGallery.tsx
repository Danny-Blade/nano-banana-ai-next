"use client";

import React from 'react';
import styles from './CommunityGallery.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const CommunityGallery = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, showcases, promptLabel, videoPromptLabel } = siteContent.communityGallery;

    return (
        <section className={styles.gallerySection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.grid}>
                    {showcases.map((item, index) => (
                        <div key={index} className={styles.card}>
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
