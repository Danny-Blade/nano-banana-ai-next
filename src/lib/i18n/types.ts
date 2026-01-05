/**
 * 极简多语言方案（不依赖第三方库）：
 * - 默认语言：英文（en）
 * - 自动语言：根据浏览器语言/Accept-Language 在 zh/ja/ko/en 中匹配
 * - 手动切换：写入 localStorage，并同步 document.documentElement.lang
 */

export type Locale = "en" | "zh" | "ja" | "ko";

export const SUPPORTED_LOCALES: Locale[] = ["en", "zh", "ja", "ko"];

export const LOCALE_STORAGE_KEY = "nb_locale";

export const isLocale = (value: unknown): value is Locale =>
  value === "en" || value === "zh" || value === "ja" || value === "ko";

export const detectLocaleFromNavigator = (): Locale => {
  if (typeof navigator === "undefined") return "en";

  const langs =
    Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language].filter(Boolean);

  return detectLocaleFromLanguageList(langs);
};

/**
 * 服务器端可用：从 `Accept-Language` 解析语言。
 * 注意：这里只做非常轻量的前缀匹配，不做权重解析（足够满足本站需求）。
 */
export const detectLocaleFromAcceptLanguage = (acceptLanguage: string | null): Locale => {
  if (!acceptLanguage) return "en";
  const langs = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0])
    .filter(Boolean);
  return detectLocaleFromLanguageList(langs);
};

const detectLocaleFromLanguageList = (langs: string[]): Locale => {
  for (const lang of langs) {
    const lower = lang.toLowerCase();
    if (lower.startsWith("zh")) return "zh";
    if (lower.startsWith("ja")) return "ja";
    if (lower.startsWith("ko")) return "ko";
    if (lower.startsWith("en")) return "en";
  }
  return "en";
};

export type Messages = Record<string, unknown>;

