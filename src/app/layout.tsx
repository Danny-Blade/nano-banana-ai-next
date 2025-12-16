import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Script from "next/script";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "5783249126-pofhal0pprh4dfguso8u5luhov883jdm.apps.googleusercontent.com";

export const metadata: Metadata = {
  title: "Nano Banana AI - Google Gemini 3.0 Flash Image Generation & Editing Studio",
  description: "Experience Google's revolutionary Nano Banana AI (Gemini 3.0 Flash Image) for advanced image generation and editing. Create, blend, and enhance images with state-of-the-art AI technology in Nano Banana AI （alternative Google AI Studio and Imarena). Professional image editing made simple.",
  icons: {
    icon: "https://cdn.ainanobanana.io/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Sign-In（platform.js）需要的 meta（按 Google 文档要求） */}
        <meta name="google-signin-client_id" content={GOOGLE_CLIENT_ID} />
        <meta name="google-signin-scope" content="profile email" />
      </head>
      <body>
        {/* 按 Google 文档引入 platform.js（用于客户端 Google 登录按钮） */}
        <Script
          src="https://apis.google.com/js/platform.js"
          strategy="afterInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
