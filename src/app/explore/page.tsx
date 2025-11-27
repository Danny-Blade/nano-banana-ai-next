import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteContent } from "@/config/content";
import styles from './explore.module.css';

export default function ExplorePage() {
    const { title, subtitle, emptyMessage } = siteContent.explore;

    return (
        <main>
            <Header />
            <section className={styles.exploreSection}>
                <div className={styles.container}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>

                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🎨</div>
                        <p className={styles.emptyMessage}>{emptyMessage}</p>
                        <p className={styles.emptyHint}>
                            Check back soon for amazing community creations!
                        </p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
