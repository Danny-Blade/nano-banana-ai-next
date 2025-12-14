import { messagesEn } from "@/lib/i18n/en";
import { messagesJa } from "@/lib/i18n/ja";
import { messagesKo } from "@/lib/i18n/ko";
import { messagesZh } from "@/lib/i18n/zh";
import type { Locale, Messages } from "@/lib/i18n/types";

export * from "@/lib/i18n/types";

/**
 * 多语言字典集合（按语言拆分文件，便于后续加新语言）。
 */
export const messages: Record<Locale, Messages> = {
  en: messagesEn,
  zh: messagesZh,
  ja: messagesJa,
  ko: messagesKo,
};

const getPath = (obj: unknown, path: string): unknown => {
  const keys = path.split(".");
  let cur: unknown = obj;
  for (const key of keys) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
};

export const translate = (
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string => {
  const raw =
    getPath(messages[locale], key) ?? getPath(messages.en, key) ?? key;
  const text = typeof raw === "string" ? raw : key;

  if (!params) return text;
  return Object.entries(params).reduce((acc, [k, v]) => {
    return acc.replaceAll(`{${k}}`, String(v));
  }, text);
};

/**
 * 获取原始多语言内容（可能是 string / array / object）。
 * 模板列表等需要读取数组时使用该方法。
 */
export const getMessage = (locale: Locale, key: string): unknown => {
  return getPath(messages[locale], key) ?? getPath(messages.en, key) ?? null;
};

