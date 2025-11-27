import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteContent } from "@/config/content";
import styles from './history.module.css';

export default function HistoryPage() {
    const { title, subtitle, emptyMessage } = siteContent.history;

    return (
        <main>
            <Header />
            <section className={styles.historySection}>
                <div className={styles.container}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>

                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🕒</div>
                        <p className={styles.emptyMessage}>{emptyMessage}</p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
