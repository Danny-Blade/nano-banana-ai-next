import type { Locale } from "@/lib/i18n";
import { siteContentEn } from "@/config/content/en";
import { siteContentJa } from "@/config/content/ja";
import { siteContentKo } from "@/config/content/ko";
import { siteContentZh } from "@/config/content/zh";
import type { SiteContent } from "@/config/content/types";

export type { SiteContent } from "@/config/content/types";

export const getSiteContent = (locale: Locale): SiteContent => {
  if (locale === "zh") return siteContentZh;
  if (locale === "ja") return siteContentJa;
  if (locale === "ko") return siteContentKo;
  return siteContentEn;
};

/**
 * 兼容：某些非交互场景仍可能直接使用默认英文内容。
 */
export const siteContent: SiteContent = siteContentEn;
