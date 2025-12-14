"use client";

import React from "react";
import {
  detectLocaleFromNavigator,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
  translate,
} from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export const I18nProvider = ({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) => {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale ?? "en");

  React.useEffect(() => {
    const saved = (() => {
      try {
        return localStorage.getItem(LOCALE_STORAGE_KEY);
      } catch {
        return null;
      }
    })();

    if (isLocale(saved)) {
      setLocaleState(saved);
      return;
    }
    // 如果服务端已根据 Accept-Language 给了初始语言，就不再强制覆盖。
    if (initialLocale) return;
    setLocaleState(detectLocaleFromNavigator());
  }, [initialLocale]);

  React.useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // 忽略 localStorage 不可用的情况（例如某些隐私模式）
    }
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

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
