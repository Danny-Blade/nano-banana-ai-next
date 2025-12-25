"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type Locale,
  translate,
} from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

// 从路径中提取 locale
// 如果路径没有 locale 前缀，说明是英语（默认语言）
function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];
  if (SUPPORTED_LOCALES.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }
  // 没有 locale 前缀表示是英语（默认语言）
  return "en";
}

// 检查路径是否包含 locale 前缀
function hasLocalePrefix(pathname: string): boolean {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];
  return SUPPORTED_LOCALES.includes(potentialLocale as Locale);
}

// 获取不带 locale 前缀的路径
function getPathWithoutLocale(pathname: string): string {
  if (hasLocalePrefix(pathname)) {
    const segments = pathname.split("/");
    segments.splice(1, 1); // 移除 locale 段
    return segments.join("/") || "/";
  }
  return pathname;
}

export const I18nProvider = ({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // 从 URL 或 initialLocale 获取当前语言
  const pathLocale = getLocaleFromPath(pathname);
  const [locale, setLocaleState] = React.useState<Locale>(
    initialLocale ?? pathLocale
  );

  // 同步 URL 中的 locale 到状态
  React.useEffect(() => {
    const urlLocale = getLocaleFromPath(pathname);
    if (urlLocale !== locale) {
      setLocaleState(urlLocale);
    }
  }, [pathname, locale]);

  // 更新 localStorage 和 document.lang
  React.useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      // 设置 cookie 以便 middleware 读取
      document.cookie = `${LOCALE_STORAGE_KEY}=${locale};path=/;max-age=31536000`;
    } catch {
      // 忽略 localStorage 不可用的情况
    }
    document.documentElement.lang = locale;
  }, [locale]);

  // 语言切换：通过 URL 路由实现
  const setLocale = React.useCallback((next: Locale) => {
    if (next === locale) return;

    const pathWithoutLocale = getPathWithoutLocale(pathname);
    const newPath = `/${next}${pathWithoutLocale}`;

    // 先更新 cookie，确保 middleware 能读取到新的语言偏好
    try {
      document.cookie = `${LOCALE_STORAGE_KEY}=${next};path=/;max-age=31536000`;
    } catch {
      // ignore
    }

    // 使用 router.push 进行导航
    // 对于英语，middleware 会将 /en/xxx 重定向到 /xxx
    router.push(newPath);

    setLocaleState(next);
  }, [locale, pathname, router]);

  const t = React.useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(locale, key, params);
    },
    [locale]
  );

  const value = React.useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n 必须在 I18nProvider 内使用");
  }
  return ctx;
};
