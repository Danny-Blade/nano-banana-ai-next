import { Providers } from "@/components/Providers";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/types";
import { notFound } from "next/navigation";
import { LocaleUpdater } from "@/components/LocaleUpdater";

// 为非默认语言生成静态参数（zh, ja, ko）
// 默认语言 (en) 由 (default) 路由组处理，不需要 /en 前缀
export function generateStaticParams() {
  return SUPPORTED_LOCALES.filter(locale => locale !== 'en').map((locale) => ({ locale }));
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
    <Providers initialLocale={locale as Locale}>
      <LocaleUpdater locale={locale} />
      {children}
    </Providers>
  );
}
