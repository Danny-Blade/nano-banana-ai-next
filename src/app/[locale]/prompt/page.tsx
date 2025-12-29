"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import styles from "./prompt.module.css";
import { useSiteContent } from "@/components/useSiteContent";

type TabType = "textToImage" | "imageToImage";

type TextToImageItem = {
    image: string;
    prompt: string;
};

type ImageToImageItem = {
    before: string;
    after: string;
    prompt: string;
};

export default function PromptPage() {
    const siteContent = useSiteContent();
    const [activeTab, setActiveTab] = React.useState<TabType>("textToImage");
    const [selectedCompareIndex, setSelectedCompareIndex] = React.useState(0);
    const [sliderPosition, setSliderPosition] = React.useState(50);
    const [isDragging, setIsDragging] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState<{ url: string; prompt: string } | null>(null);
    const [toast, setToast] = React.useState<string | null>(null);

    const compareRef = React.useRef<HTMLDivElement>(null);

    const textToImageItems: TextToImageItem[] = siteContent.textToImage?.items || [];
    const imageToImageItems: ImageToImageItem[] = siteContent.imageToImageExamples?.items || [];
    const currentCompareItem = imageToImageItems[selectedCompareIndex];

    const promptContent = siteContent.prompt || {
        title: "Nano Banana Pro Showcase",
        subtitle: "Explore stunning AI-generated images and discover the prompts behind them",
        textToImageTab: "Text to Image",
        imageToImageTab: "Image to Image",
        textToImageTitle: "Text to Image Gallery",
        textToImageSubtitle: "Click any image to see the full prompt",
        imageToImageTitle: "Image Transformation Examples",
        imageToImageSubtitle: "Drag the slider to compare before and after",
        beforeLabel: "Before",
        afterLabel: "After",
        promptLabel: "Prompt",
        copyPrompt: "Copy Prompt",
        copied: "Copied!",
        ctaTitle: "Ready to create your own?",
        ctaSubtitle: "Start generating amazing images with Nano Banana AI",
        ctaButton: "Try Nano Banana Now",
        modelLabel: "Nano Banana Pro"
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setToast(promptContent.copied);
            setTimeout(() => setToast(null), 2000);
        } catch {
            // fallback
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setToast(promptContent.copied);
            setTimeout(() => setToast(null), 2000);
        }
    };

    const handleSliderMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleSliderTouchStart = () => {
        setIsDragging(true);
    };

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !compareRef.current) return;
            const rect = compareRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            setSliderPosition(percent);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging || !compareRef.current) return;
            const rect = compareRef.current.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            setSliderPosition(percent);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("touchmove", handleTouchMove);
            document.addEventListener("touchend", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleMouseUp);
        };
    }, [isDragging]);

    return (
        <main>
            <Header />
            <section className={styles.promptSection}>
                <div className={styles.container}>
                    {/* Hero */}
                    <div className={styles.hero}>
                        <h1 className={styles.title}>{promptContent.title}</h1>
                        <p className={styles.subtitle}>{promptContent.subtitle}</p>

                        {/* Tab Switcher */}
                        <div className={styles.tabContainer}>
                            <button
                                className={`${styles.tab} ${activeTab === "textToImage" ? styles.tabActive : ""}`}
                                onClick={() => setActiveTab("textToImage")}
                            >
                                <span className={styles.tabIcon}>🎨</span>
                                {promptContent.textToImageTab}
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === "imageToImage" ? styles.tabActive : ""}`}
                                onClick={() => setActiveTab("imageToImage")}
                            >
                                <span className={styles.tabIcon}>🖼️</span>
                                {promptContent.imageToImageTab}
                            </button>
                        </div>
                    </div>

                    {/* Text to Image Gallery */}
                    {activeTab === "textToImage" && (
                        <div className={styles.gallerySection}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h2 className={styles.sectionTitle}>{promptContent.textToImageTitle}</h2>
                                    <p className={styles.sectionSubtitle}>{promptContent.textToImageSubtitle}</p>
                                </div>
                            </div>

                            <div className={styles.galleryGrid}>
                                {textToImageItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className={styles.galleryItem}
                                        onClick={() => setPreviewImage({ url: item.image, prompt: item.prompt })}
                                    >
                                        <img
                                            src={item.image}
                                            alt={`Generated image ${index + 1}`}
                                            className={styles.image}
                                            loading="lazy"
                                        />
                                        <div className={styles.overlay}>
                                            <div className={styles.overlayModel}>{promptContent.modelLabel}</div>
                                            <div className={styles.overlayPrompt}>{item.prompt}</div>
                                            <button
                                                className={styles.copyBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(item.prompt);
                                                }}
                                            >
                                                <span className={styles.copyIcon}>📋</span>
                                                {promptContent.copyPrompt}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Image to Image Section */}
                    {activeTab === "imageToImage" && currentCompareItem && (
                        <div className={styles.compareSection}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h2 className={styles.sectionTitle}>{promptContent.imageToImageTitle}</h2>
                                    <p className={styles.sectionSubtitle}>{promptContent.imageToImageSubtitle}</p>
                                </div>
                            </div>

                            <div className={styles.compareContainer}>
                                {/* Before/After Compare */}
                                <div
                                    ref={compareRef}
                                    className={styles.compareMain}
                                    onMouseDown={handleSliderMouseDown}
                                    onTouchStart={handleSliderTouchStart}
                                >
                                    {/* Before Image (Background) */}
                                    <div className={styles.compareImageWrapper}>
                                        <img
                                            src={currentCompareItem.before}
                                            alt="Before"
                                            className={styles.compareImage}
                                        />
                                    </div>

                                    {/* After Image (Clipped) */}
                                    <div
                                        className={styles.compareAfterWrapper}
                                        style={{ width: `${sliderPosition}%` }}
                                    >
                                        <img
                                            src={currentCompareItem.after}
                                            alt="After"
                                            className={styles.compareImage}
                                            style={{ width: compareRef.current?.offsetWidth || "100%" }}
                                        />
                                    </div>

                                    {/* Slider */}
                                    <div
                                        className={styles.compareSlider}
                                        style={{ left: `${sliderPosition}%` }}
                                    >
                                        <div className={styles.compareSliderHandle}>
                                            <span className={styles.compareSliderArrows}>⬌</span>
                                        </div>
                                    </div>

                                    {/* Labels */}
                                    <div className={styles.compareLabels}>
                                        <span className={styles.compareLabel}>{promptContent.afterLabel}</span>
                                        <span className={styles.compareLabel}>{promptContent.beforeLabel}</span>
                                    </div>
                                </div>

                                {/* Prompt Box */}
                                <div className={styles.comparePromptBox}>
                                    <div className={styles.comparePromptLabel}>{promptContent.promptLabel}</div>
                                    <div className={styles.comparePromptText}>{currentCompareItem.prompt}</div>
                                    <div className={styles.comparePromptActions}>
                                        <button
                                            className={styles.compareCopyBtn}
                                            onClick={() => copyToClipboard(currentCompareItem.prompt)}
                                        >
                                            <span>📋</span>
                                            {promptContent.copyPrompt}
                                        </button>
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                <div className={styles.thumbnails}>
                                    {imageToImageItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`${styles.thumbnail} ${selectedCompareIndex === index ? styles.thumbnailActive : ""}`}
                                            onClick={() => {
                                                setSelectedCompareIndex(index);
                                                setSliderPosition(50);
                                            }}
                                        >
                                            <img
                                                src={item.after}
                                                alt={`Example ${index + 1}`}
                                                className={styles.thumbnailImage}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className={styles.ctaSection}>
                        <h2 className={styles.ctaTitle}>{promptContent.ctaTitle}</h2>
                        <p className={styles.ctaSubtitle}>{promptContent.ctaSubtitle}</p>
                        <Link href="/dashboard" className={styles.ctaButton}>
                            <span className={styles.ctaIcon}>🚀</span>
                            {promptContent.ctaButton}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className={styles.modal} onClick={() => setPreviewImage(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setPreviewImage(null)}>
                            ×
                        </button>
                        <img
                            src={previewImage.url}
                            alt="Preview"
                            className={styles.modalImage}
                        />
                        <div className={styles.modalPrompt}>
                            <div className={styles.modalPromptText}>{previewImage.prompt}</div>
                            <button
                                className={styles.modalCopyBtn}
                                onClick={() => copyToClipboard(previewImage.prompt)}
                            >
                                <span>📋</span>
                                {promptContent.copyPrompt}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <div className={styles.toast}>{toast}</div>}

            <Footer />
        </main>
    );
}
