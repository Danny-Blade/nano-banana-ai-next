"use client";

import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSiteContent } from "@/components/useSiteContent";

type LegalPageKind = "support" | "tos" | "privacy" | "refund";

interface LegalPageProps {
    kind: LegalPageKind;
}

const LegalPage: React.FC<LegalPageProps> = ({ kind }) => {
    const siteContent = useSiteContent();
    const title = siteContent.legal.titles[kind];
    return (
        <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div style={{
                padding: '120px 20px 60px',
                maxWidth: '800px',
                margin: '0 auto',
                color: '#fff',
                flex: 1,
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '30px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #333',
                    paddingBottom: '20px'
                }}>
                    {title}
                </h1>
                <div style={{ lineHeight: '1.8', color: '#ccc' }}>
                    <p>{siteContent.legal.contentComingSoon}</p>
                </div>
            </div>
            <Footer />
        </main>
    );
};

export default LegalPage;
