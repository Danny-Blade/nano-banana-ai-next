"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageHistory from "@/components/ImageHistory";
import styles from '../../[locale]/history/history.module.css';
import { useSiteContent } from "@/components/useSiteContent";

export default function HistoryPage() {
    const siteContent = useSiteContent();
    const { title, subtitle } = siteContent.history;

    return (
        <main>
            <Header />
            <section className={styles.historySection}>
                <div className={styles.container}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>
                    <ImageHistory />
                </div>
            </section>
            <Footer />
        </main>
    );
}
