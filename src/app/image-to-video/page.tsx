"use client";

import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteContent } from "@/config/content";
import styles from './image-to-video.module.css';

export default function ImageToVideoPage() {
    const { title, subtitle, model, examplePrompt } = siteContent.imageToVideo;
    const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
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
                        {/* Upload Section */}
                        <div className={styles.uploadPanel}>
                            <h3 className={styles.panelTitle}>Upload Image</h3>
                            <div className={styles.uploadArea}>
                                <div className={styles.uploadPlaceholder}>
                                    <span className={styles.uploadIcon}>📸</span>
                                    <p>Click to upload or drag and drop</p>
                                    <p className={styles.uploadHint}>Supported formats: JPG, PNG, WebP</p>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Animation Prompt</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Describe how you want your image to animate..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <button className={styles.generateBtn}>
                                Generate Video
                            </button>
                        </div>

                        {/* Example Section */}
                        <div className={styles.examplePanel}>
                            <h3 className={styles.panelTitle}>Generated Video</h3>
                            <div className={styles.videoPlaceholder}>
                                <div className={styles.videoIcon}>🎬</div>
                                <p>Your generated video will appear here</p>
                            </div>

                            <div className={styles.exampleInfo}>
                                <p className={styles.exampleLabel}>Model: Google Veo3</p>
                                <p className={styles.examplePrompt}>
                                    <strong>Example Prompt:</strong> {examplePrompt}
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
