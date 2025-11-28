"use client";

import React from 'react';
import styles from './Editor.module.css';
import { siteContent } from '@/config/content';
import { cn } from '@/lib/utils';
import { Upload, Sparkles, Download, RefreshCw } from 'lucide-react';

const Editor = () => {
    const { title, subtitle } = siteContent.editor;
    const [prompt, setPrompt] = React.useState('');
    const [selectedModel, setSelectedModel] = React.useState('gemini-2.5-flash');
    const [aspectRatio, setAspectRatio] = React.useState('1:1');
    const [quality, setQuality] = React.useState('standard');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [uploadedImages, setUploadedImages] = React.useState<File[]>([]);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setUploadedImages(prev => [...prev, ...files]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setUploadedImages(prev => [...prev, ...files]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && uploadedImages.length === 0) {
            alert('Please enter a prompt or upload an image to get started!');
            return;
        }

        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            setGeneratedImage('https://cdn.ainanobanana.io/nano-banana/c06bcfe8-b5f1-4a11-9181-21138d1b46d3.png');
            setIsGenerating(false);
        }, 3000);
    };

    const downloadImage = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = 'nano-banana-ai-generated.png';
            link.click();
        }
    };

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
                        <div className={styles.panelHeader}>
                            <Sparkles className={styles.panelIcon} />
                            <h3 className={styles.panelTitle}>Nano Banana AI Editor</h3>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>AI Model</label>
                            <select
                                className={styles.select}
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                            >
                                <option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash (Fastest)</option>
                                <option value="gemini-2.0-flash">🚀 Gemini 2.0 Flash</option>
                                <option value="gemini-pro">🎯 Gemini Pro (High Quality)</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Upload Images (Optional)</label>
                            <div
                                className={styles.uploadArea}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />

                                {uploadedImages.length > 0 ? (
                                    <div className={styles.uploadedImages}>
                                        {uploadedImages.map((file, index) => (
                                            <div key={index} className={styles.uploadedImage}>
                                                <img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} />
                                                <button
                                                    className={styles.removeImage}
                                                    onClick={() => removeImage(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <div className={styles.addMore} onClick={() => fileInputRef.current?.click()}>
                                            <Upload size={20} />
                                            <span>Add More</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        <Upload className={styles.uploadIcon} size={32} />
                                        <p>Click to upload or drag and drop</p>
                                        <p className={styles.uploadHint}>PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Prompt</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Describe what you want to create or edit... Be as specific as possible for best results!"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                            />
                            <div className={styles.promptExamples}>
                                <span className={styles.examplesLabel}>Examples:</span>
                                <div className={styles.exampleTags}>
                                    {["Photo to anime", "Change hair color", "Add sunglasses", "Make it cyberpunk"].map((example) => (
                                        <button
                                            key={example}
                                            className={styles.exampleTag}
                                            onClick={() => setPrompt(example)}
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Quality</label>
                                <select
                                    className={styles.select}
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value)}
                                >
                                    <option value="standard">Standard (Fast)</option>
                                    <option value="high">High Quality</option>
                                    <option value="ultra">Ultra HD (Best)</option>
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

                        <button
                            className={cn(styles.generateBtn, isGenerating && styles.generating)}
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className={styles.spinning} size={20} />
                                    Generating Magic...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Generate Image
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Panel */}
                    <div className={styles.resultPanel}>
                        <div className={styles.panelHeader}>
                            <Sparkles className={styles.panelIcon} />
                            <h3 className={styles.panelTitle}>Generated Result</h3>
                        </div>

                        {generatedImage ? (
                            <div className={styles.resultContent}>
                                <img
                                    src={generatedImage}
                                    alt="Generated result"
                                    className={styles.resultImage}
                                />
                                <div className={styles.resultActions}>
                                    <button className={styles.actionBtn} onClick={downloadImage}>
                                        <Download size={16} />
                                        Download
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => {
                                            setGeneratedImage(null);
                                            setPrompt('');
                                        }}
                                    >
                                        <RefreshCw size={16} />
                                        Generate Again
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.resultPlaceholder}>
                                <Sparkles className={styles.resultIcon} size={48} />
                                <h4>Your AI masterpiece awaits!</h4>
                                <p>Enter a prompt and click generate to create stunning images with Nano Banana AI</p>
                                <div className={styles.featureBadges}>
                                    <span className={styles.badge}>⚡ Lightning Fast</span>
                                    <span className={styles.badge}>🎨 High Quality</span>
                                    <span className={styles.badge}>🤖 AI Powered</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Editor;
