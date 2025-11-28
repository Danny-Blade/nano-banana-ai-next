import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nano Banana AI - Advanced AI Image Generation & Editing Platform",
  description: "Transform your ideas into stunning images with Nano Banana AI. Create, edit, and enhance visuals using cutting-edge AI technology. Fast, professional, and intuitive image generation.",
  keywords: "AI image generation, photo editing, visual content creation, artificial intelligence, image enhancement",
  authors: [{ name: "Nano Banana AI" }],
  creator: "Nano Banana AI",
  publisher: "Nano Banana AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ainanobanana.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Nano Banana AI - Advanced AI Image Generation & Editing Platform",
    description: "Transform your ideas into stunning images with Nano Banana AI. Create, edit, and enhance visuals using cutting-edge AI technology.",
    url: 'https://ainanobanana.io',
    siteName: 'Nano Banana AI',
    images: [
      {
        url: 'https://cdn.ainanobanana.io/ai-poster.png',
        width: 1200,
        height: 630,
        alt: 'Nano Banana AI - AI Image Generation Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nano Banana AI - Advanced AI Image Generation & Editing Platform',
    description: 'Transform your ideas into stunning images with Nano Banana AI. Create, edit, and enhance visuals using cutting-edge AI technology.',
    images: ['https://cdn.ainanobanana.io/ai-poster.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: 'https://ainanobanana.io/favicon.ico', sizes: 'any' },
      { url: 'https://cdn.ainanobanana.io/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: 'https://cdn.ainanobanana.io/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: 'https://ainanobanana.io/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
