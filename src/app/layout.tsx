import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nano Banana AI - Google Gemini 2.5 Flash Image Generation & Editing Studio",
  description: "Experience Google's revolutionary Nano Banana AI (Gemini 2.5 Flash Image) for advanced image generation and editing. Create, blend, and enhance images with state-of-the-art AI technology in Nano Banana AI （alternative Google AI Studio and Imarena). Professional image editing made simple.",
  icons: {
    icon: 'https://ainanobanana.io/favicon.ico',
  },
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
