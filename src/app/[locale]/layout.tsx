import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "@/components/Providers";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/types";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Nano Banana AI - Google Gemini 3.0 Flash Image Generation & Editing Studio",
  description: "Experience Google's revolutionary Nano Banana AI (Gemini 3.0 Flash Image) for advanced image generation and editing. Create, blend, and enhance images with state-of-the-art AI technology in Nano Banana AI （alternative Google AI Studio and Imarena). Professional image editing made simple.",
  icons: {
    icon: "https://cdn.ainanobanana.io/icon.png",
  },
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children, params } = props;
  const { locale } = await params;

  // 验证 locale 是否有效
  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <Providers initialLocale={locale as Locale}>{children}</Providers>
      </body>
    </html>
  );
}
