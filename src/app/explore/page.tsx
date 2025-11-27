import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteContent } from "@/config/content";
import styles from './explore.module.css';

export default function ExplorePage() {
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
                                    alt={`Explore item ${index + 1}`}
                                    className={styles.image}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
