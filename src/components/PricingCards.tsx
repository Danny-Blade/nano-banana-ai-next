"use client";

import React, { useState, useEffect } from 'react';
import styles from './PricingCards.module.css';
import { useSiteContent } from "@/components/useSiteContent";

type BillingMode = 'monthly' | 'yearly' | 'onetime';

interface PricingPlan {
    name: string;
    description: string;
    price: string;
    period?: string;
    originalPrice?: string;
    monthlyEquiv?: string;
    saveBadge?: string;
    badge?: string;
    credits?: string;
    features: string[];
    highlighted: boolean;
}

const PricingCards = () => {
    const siteContent = useSiteContent();
    const { title, subtitle, monthlyPlans, yearlyPlans, onetimePlans, toggleLabels, trustBadges } = siteContent.pricing;
    const [billingMode, setBillingMode] = useState<BillingMode>('monthly');
    // 初始值必须与服务端一致，避免hydration mismatch
    const [isMobile, setIsMobile] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // 标记已hydrated
        setIsHydrated(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 480);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleModeChange = (mode: BillingMode) => {
        setBillingMode(mode);
    };

    const getCurrentPlans = (): PricingPlan[] => {
        switch (billingMode) {
            case 'monthly':
                return monthlyPlans as PricingPlan[];
            case 'yearly':
                return yearlyPlans as PricingPlan[];
            case 'onetime':
                return onetimePlans as PricingPlan[];
            default:
                return monthlyPlans as PricingPlan[];
        }
    };

    const currentPlans = getCurrentPlans();

    // Calculate indicator position
    const getIndicatorStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {};

        // 在hydration完成前禁用transition，避免闪烁
        if (!isHydrated) {
            baseStyle.transition = 'none';
        }

        if (isMobile) {
            // Vertical layout for mobile
            const index = billingMode === 'monthly' ? 0 : billingMode === 'yearly' ? 1 : 2;
            return { ...baseStyle, transform: `translateY(${index * 100}%)` };
        } else {
            // Horizontal layout for desktop
            const percentage = billingMode === 'monthly' ? 0 : billingMode === 'yearly' ? 100 : 200;
            return { ...baseStyle, transform: `translateX(${percentage}%)` };
        }
    };

    return (
        <section className={styles.pricingSection}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.subtitle}>{subtitle}</p>

                    {/* Toggle Buttons */}
                    <div className={styles.toggleContainer}>
                        <div
                            className={`${styles.toggleIndicator} ${isMobile ? styles.mobile : ''}`}
                            style={getIndicatorStyle()}
                        />
                        <button
                            className={`${styles.toggleBtn} ${billingMode === 'monthly' ? styles.active : ''}`}
                            onClick={() => handleModeChange('monthly')}
                        >
                            {toggleLabels.monthly}
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${billingMode === 'yearly' ? styles.active : ''}`}
                            onClick={() => handleModeChange('yearly')}
                        >
                            {toggleLabels.yearly}
                            <span className={styles.discountBadge}>{toggleLabels.yearlyDiscount}</span>
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${billingMode === 'onetime' ? styles.active : ''}`}
                            onClick={() => handleModeChange('onetime')}
                        >
                            {toggleLabels.onetime}
                        </button>
                    </div>
                </div>

                {/* One-time Header */}
                {billingMode === 'onetime' && (
                    <div className={styles.onetimeHeader}>
                        <h3>{siteContent.pricing.onetimeTitle}</h3>
                        <p>{siteContent.pricing.onetimeSubtitle}</p>
                    </div>
                )}

                {/* Plans Grid */}
                <div className={styles.plansGrid} key={billingMode}>
                    {currentPlans.map((plan, index) => (
                        <div
                            key={index}
                            className={`${styles.planCard} ${plan.highlighted ? styles.highlighted : ''}`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {plan.badge && (
                                <div className={styles.badge}>{plan.badge}</div>
                            )}

                            {plan.saveBadge && (
                                <div className={styles.saveBadge}>{plan.saveBadge}</div>
                            )}

                            <h3 className={styles.planName}>{plan.name}</h3>
                            <p className={styles.planDescription}>{plan.description}</p>

                            {/* Credits Display for One-time */}
                            {billingMode === 'onetime' && plan.credits && (
                                <div className={styles.creditsDisplay}>
                                    <div className={styles.creditsAmount}>{plan.credits}</div>
                                    <div className={styles.creditsLabel}>{siteContent.pricing.creditsLabel}</div>
                                </div>
                            )}

                            <div className={styles.priceWrapper}>
                                {plan.originalPrice && (
                                    <span className={styles.priceOriginal}>{plan.originalPrice}</span>
                                )}
                                <span className={styles.price}>{plan.price}</span>
                                {plan.period && (
                                    <span className={styles.period}>{plan.period}</span>
                                )}
                                {plan.monthlyEquiv && (
                                    <p className={styles.monthlyEquiv}>{plan.monthlyEquiv}</p>
                                )}
                            </div>

                            <button className={plan.highlighted ? styles.btnPrimary : styles.btnSecondary}>
                                {billingMode === 'onetime'
                                    ? siteContent.pricing.buyNowButton
                                    : siteContent.pricing.getStartedButton}
                            </button>

                            <ul className={styles.featuresList}>
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className={styles.feature}>
                                        <span className={styles.checkmark}>
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Trust Badges */}
                <div className={styles.trustSection}>
                    {trustBadges.map((badge, index) => (
                        <div key={index} className={styles.trustItem}>
                            <span className={styles.trustIcon}>{badge.icon}</span>
                            <span>{badge.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingCards;
