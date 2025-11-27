import React from 'react';
import styles from './PricingCards.module.css';
import { siteContent } from '@/config/content';

const PricingCards = () => {
    const { title, subtitle, plans, addons } = siteContent.pricing;

    return (
        <section className={styles.pricingSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                {/* Main Plans */}
                <div className={styles.plansGrid}>
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`${styles.planCard} ${plan.highlighted ? styles.highlighted : ''}`}
                        >
                            {plan.badge && (
                                <div className={styles.badge}>{plan.badge}</div>
                            )}

                            <h3 className={styles.planName}>{plan.name}</h3>
                            <p className={styles.planDescription}>{plan.description}</p>

                            <div className={styles.priceWrapper}>
                                <span className={styles.price}>{plan.price}</span>
                                <span className={styles.period}>{plan.period}</span>
                            </div>

                            <button className={styles.selectBtn}>
                                Select Payment Method
                            </button>

                            <ul className={styles.featuresList}>
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className={styles.feature}>
                                        <span className={styles.checkmark}>✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Add-on Packages */}
                {addons && addons.length > 0 && (
                    <div className={styles.addonsSection}>
                        <h3 className={styles.addonsTitle}>Add-on Packages</h3>
                        <div className={styles.addonsGrid}>
                            {addons.map((addon, index) => (
                                <div key={index} className={styles.addonCard}>
                                    <h4 className={styles.addonName}>{addon.name}</h4>
                                    <p className={styles.addonDescription}>{addon.description}</p>

                                    <div className={styles.addonPrice}>
                                        <span className={styles.price}>{addon.price}</span>
                                        <span className={styles.credits}>{addon.credits}</span>
                                    </div>

                                    <ul className={styles.addonFeatures}>
                                        {addon.features.map((feature, idx) => (
                                            <li key={idx}>
                                                <span className={styles.checkmark}>✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button className={styles.addonBtn}>
                                        Select Payment Method
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PricingCards;
