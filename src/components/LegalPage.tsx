"use client";

import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSiteContent } from "@/components/useSiteContent";
import styles from "./LegalPage.module.css";

type LegalPageKind = "support" | "tos" | "privacy" | "refund";

interface LegalPageProps {
    kind: LegalPageKind;
}

const LegalPage: React.FC<LegalPageProps> = ({ kind }) => {
    const siteContent = useSiteContent();
    const title = siteContent.legal.titles[kind];
    const content = siteContent.legal.content[kind];

    return (
        <main className={styles.main}>
            <Header />
            <div className={styles.container}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.lastUpdated}>{content.lastUpdated}</p>

                {content.sections.map((section: { heading: string; paragraphs: string[] }, index: number) => (
                    <section key={index} className={styles.section}>
                        <h2 className={styles.sectionTitle}>{section.heading}</h2>
                        {section.paragraphs.map((paragraph: string, pIndex: number) => (
                            <p key={pIndex} className={styles.paragraph}>{paragraph}</p>
                        ))}
                    </section>
                ))}

                {content.contactEmail && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>{content.contactTitle}</h2>
                        <p className={styles.paragraph}>
                            {content.contactText}{' '}
                            <a href={`mailto:${content.contactEmail}`} className={styles.link}>
                                {content.contactEmail}
                            </a>
                        </p>
                    </section>
                )}
            </div>
            <Footer />
        </main>
    );
};

export default LegalPage;
