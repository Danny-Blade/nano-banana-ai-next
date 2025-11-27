import React from 'react';
import styles from './CommunityGallery.module.css';
import { siteContent } from '@/config/content';
import Link from 'next/link';

const CommunityGallery = () => {
    const { title, subtitle, showcases } = siteContent.communityGallery;

    return (
        <section className={styles.gallerySection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.showcaseGrid}>
                    {showcases.map((showcase, index) => (
                        <div key={index} className={styles.showcaseCard}>
                            <div className={styles.showcaseImage}>
                                <div className={styles.imagePlaceholder}>
                                    <span className={styles.icon}>
                                        {index === 0 ? '🎬' : index === 1 ? '🌃' : '🎨'}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.showcaseContent}>
                                <h3 className={styles.showcaseTitle}>{showcase.title}</h3>
                                <p className={styles.showcasePrompt}>"{showcase.prompt}"</p>
                                {showcase.videoPrompt && (
                                    <p className={styles.videoPrompt}>
                                        <strong>Video:</strong> "{showcase.videoPrompt}"
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.ctaContainer}>
                    <Link href="/explore" className={styles.exploreBtn}>
                        View More Creations
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CommunityGallery;
