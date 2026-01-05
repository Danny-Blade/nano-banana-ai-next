"use client";

import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from '../../[locale]/image-to-video/image-to-video.module.css';
import { useSiteContent } from "@/components/useSiteContent";

export default function ImageToVideoPage() {
    const siteContent = useSiteContent();
    const {
        title,
        subtitle,
        model,
        examplePrompt,
        uploadPanelTitle,
        uploadPlaceholder,
        uploadHint,
        animationPromptLabel,
        animationPromptPlaceholder,
        generateButton,
        generatedPanelTitle,
        generatedPlaceholder,
        exampleModelLabel,
        examplePromptLabel,
    } = siteContent.imageToVideo;
    const [prompt, setPrompt] = React.useState('');

    return (
        <main>
            <Header />
            <section className={styles.videoSection}>
                <div className={styles.container}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>

                    <div className={styles.modelInfo}>{model}</div>

                        <div className={styles.contentGrid}>
                            <div className={styles.uploadPanel}>
                            <h3 className={styles.panelTitle}>{uploadPanelTitle}</h3>
                            <div className={styles.uploadArea}>
                                <div className={styles.uploadPlaceholder}>
                                    <span className={styles.uploadIcon}>📸</span>
                                    <p>{uploadPlaceholder}</p>
                                    <p className={styles.uploadHint}>{uploadHint}</p>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>{animationPromptLabel}</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder={animationPromptPlaceholder}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <button className={styles.generateBtn}>
                                {generateButton}
                            </button>
                        </div>

                        <div className={styles.examplePanel}>
                            <h3 className={styles.panelTitle}>{generatedPanelTitle}</h3>
                            <div className={styles.videoPlaceholder}>
                                <div className={styles.videoIcon}>🎬</div>
                                <p>{generatedPlaceholder}</p>
                            </div>

                            <div className={styles.exampleInfo}>
                                <p className={styles.exampleLabel}>{exampleModelLabel}</p>
                                <p className={styles.examplePrompt}>
                                    <strong>{examplePromptLabel}</strong> {examplePrompt}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
