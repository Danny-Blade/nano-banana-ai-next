import { Providers } from "@/components/Providers";
import { LocaleUpdater } from "@/components/LocaleUpdater";

// 默认语言 (English) 的布局 - 不需要 URL 中的语言前缀
export default function DefaultLocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers initialLocale="en">
      <LocaleUpdater locale="en" />
      {children}
    </Providers>
  );
}
