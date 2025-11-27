import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from './history.module.css';

export default function HistoryPage() {
    return (
        <main>
            <Header />
            <section className={styles.historySection}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Generation History</h1>
                    <p className={styles.subtitle}>
                        View and manage all your AI-generated images and videos
                    </p>

                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📜</div>
                        <p className={styles.emptyMessage}>No generation history yet</p>
                        <p className={styles.emptyHint}>
                            Start creating amazing images to see them here!
                        </p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
