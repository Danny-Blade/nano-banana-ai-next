"use client";

import React from "react";
import { useI18n } from "@/components/I18nProvider";
import { getSiteContent } from "@/config/content";

export const useSiteContent = () => {
  const { locale } = useI18n();
  return React.useMemo(() => getSiteContent(locale), [locale]);
};

