"use client";

import React from 'react';
import styles from './FAQ.module.css';
import { useSiteContent } from "@/components/useSiteContent";

const FAQ = () => {
    const siteContent = useSiteContent();
    const { title, items } = siteContent.faq;
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const toggleQuestion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className={styles.faqSection}>
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>

                <div className={styles.faqList}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
                        >
                            <button
                                className={styles.question}
                                onClick={() => toggleQuestion(index)}
                            >
                                <span>{item.question}</span>
                                <span className={styles.icon}>
                                    {openIndex === index ? '−' : '+'}
                                </span>
                            </button>

                            <div className={styles.answerWrapper}>
                                <div className={styles.answer}>
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
