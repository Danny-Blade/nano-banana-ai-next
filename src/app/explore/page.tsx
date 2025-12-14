"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from './explore.module.css';
import { useSiteContent } from "@/components/useSiteContent";

export default function ExplorePage() {
    const siteContent = useSiteContent();
    const { title, subtitle, images } = siteContent.explore;

    return (
        <main>
            <Header />
            <section className={styles.exploreSection}>
                <div className={styles.container}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>

                    <div className={styles.galleryGrid}>
                        {images && images.map((imgUrl, index) => (
                            <div key={index} className={styles.galleryItem}>
                                <img
                                    src={imgUrl}
                                    alt={`${siteContent.explore.imageAltPrefix} ${index + 1}`}
                                    className={styles.image}
                                    loading="lazy"
                                />
                                <div className={styles.overlay}>
                                    <div className={styles.overlayModel}>{siteContent.explore.overlayModel}</div>
                                    <div className={styles.overlayPrompt}>{siteContent.explore.overlayPrompt}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
