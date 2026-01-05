import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nano Banana Pro AI - Google Gemini 3.0 Flash Image Generation & Editing Studio",
  description: "Experience Google's revolutionary Nano Banana Pro AI (Gemini 3.0 Flash Image) for advanced image generation and editing. Create, blend, and enhance images with state-of-the-art AI technology in Nano Banana Pro AI （alternative Google AI Studio and Imarena). Professional image editing made simple.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
