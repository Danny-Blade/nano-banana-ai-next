"use client";

import React from 'react';
import styles from './Editor.module.css';
import { siteContent } from '@/config/content';

const Editor = () => {
    const { title, subtitle } = siteContent.editor;
    const [prompt, setPrompt] = React.useState('');
    const [selectedModel, setSelectedModel] = React.useState('gemini-2.5-flash');
    const [aspectRatio, setAspectRatio] = React.useState('1:1');
    const [quality, setQuality] = React.useState('standard');

    return (
        <section className={styles.editorSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.editorGrid}>
                    {/* Editor Panel */}
                    <div className={styles.editorPanel}>
                        <h3 className={styles.panelTitle}>Nano Banana AI Editor</h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Selected Model</label>
                            <select
                                className={styles.select}
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                            >
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Add images to edit (optional)</label>
                            <div className={styles.uploadArea}>
                                <div className={styles.uploadPlaceholder}>
                                    <span className={styles.uploadIcon}>📁</span>
                                    <p>Click to upload or drag and drop</p>
                                    <p className={styles.uploadHint}>Leave empty to generate from prompt</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Prompt</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Describe what you want to create or edit..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Output Quality</label>
                                <select
                                    className={styles.select}
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value)}
                                >
                                    <option value="standard">Standard</option>
                                    <option value="high">High Quality</option>
                                    <option value="ultra">Ultra HD</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Aspect Ratio</label>
                                <select
                                    className={styles.select}
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value)}
                                >
                                    <option value="1:1">1:1 Square</option>
                                    <option value="16:9">16:9 Landscape</option>
                                    <option value="9:16">9:16 Portrait</option>
                                    <option value="4:3">4:3 Classic</option>
                                </select>
                            </div>
                        </div>

                        <button className={styles.generateBtn}>
                            Generate Image
                        </button>
                    </div>

                    {/* Result Panel */}
                    <div className={styles.resultPanel}>
                        <h3 className={styles.panelTitle}>Nano Banana Result</h3>
                        <div className={styles.resultPlaceholder}>
                            <div className={styles.resultIcon}>🎨</div>
                            <p>Your generated image will appear here</p>
                            <p className={styles.resultHint}>Start by entering a prompt and clicking generate</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Editor;
