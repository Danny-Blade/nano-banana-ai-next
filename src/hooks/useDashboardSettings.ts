"use client";

import React from "react";
import type { ModelValue, RatioValue } from "@/components/dashboard/types";

const SETTINGS_KEY = "nano_banana_dashboard_settings_v1";
const GENERATION_STATE_KEY = "nano_banana_generation_state_v1";

export type DashboardSettings = {
  selectedModel: ModelValue;
  ratio: RatioValue;
  resolution: string;
  generateCount: string;
  activeTab: "generate" | "batch" | "compare" | "history";
};

export type GenerationState = {
  isGenerating: boolean;
  progress: number;
  progressStage: string;
  startTime: number;
  prompt: string;
  model: ModelValue;
  ratio: RatioValue;
  resolution: string;
  count: number;
  taskId: string | null;
};

const DEFAULT_SETTINGS: DashboardSettings = {
  selectedModel: "nano-banana-pro",
  ratio: "1:1",
  resolution: "Auto",
  generateCount: "1",
  activeTab: "generate",
};

const DEFAULT_GENERATION_STATE: GenerationState = {
  isGenerating: false,
  progress: 0,
  progressStage: "",
  startTime: 0,
  prompt: "",
  model: "nano-banana-pro",
  ratio: "1:1",
  resolution: "Auto",
  count: 1,
  taskId: null,
};

export const useDashboardSettings = () => {
  const [settings, setSettingsState] = React.useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [generationState, setGenerationStateInternal] = React.useState<GenerationState>(DEFAULT_GENERATION_STATE);
  const [hydrated, setHydrated] = React.useState(false);

  // 从 localStorage 加载设置
  React.useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as Partial<DashboardSettings>;
        setSettingsState((prev) => ({ ...prev, ...parsed }));
      }

      const savedGenState = localStorage.getItem(GENERATION_STATE_KEY);
      if (savedGenState) {
        const parsed = JSON.parse(savedGenState) as GenerationState;
        // 如果之前正在生成，恢复状态
        if (parsed.isGenerating && parsed.taskId) {
          setGenerationStateInternal(parsed);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // 保存设置到 localStorage
  const saveSettings = React.useCallback((newSettings: Partial<DashboardSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // 保存生成状态
  const setGenerationState = React.useCallback((newState: Partial<GenerationState>) => {
    setGenerationStateInternal((prev) => {
      const updated = { ...prev, ...newState };
      try {
        localStorage.setItem(GENERATION_STATE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // 清除生成状态
  const clearGenerationState = React.useCallback(() => {
    setGenerationStateInternal(DEFAULT_GENERATION_STATE);
    try {
      localStorage.removeItem(GENERATION_STATE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    settings,
    saveSettings,
    generationState,
    setGenerationState,
    clearGenerationState,
    hydrated,
  };
};

// 进度阶段文本 key
export const PROGRESS_STAGES = {
  PREPARING: "dashboard.progress.preparing",
  UPLOADING: "dashboard.progress.uploading",
  PROCESSING: "dashboard.progress.processing",
  GENERATING: "dashboard.progress.generating",
  ENHANCING: "dashboard.progress.enhancing",
  FINALIZING: "dashboard.progress.finalizing",
  COMPLETE: "dashboard.progress.complete",
} as const;

// 根据进度获取阶段
export const getProgressStage = (progress: number): string => {
  if (progress < 10) return PROGRESS_STAGES.PREPARING;
  if (progress < 25) return PROGRESS_STAGES.UPLOADING;
  if (progress < 50) return PROGRESS_STAGES.PROCESSING;
  if (progress < 75) return PROGRESS_STAGES.GENERATING;
  if (progress < 90) return PROGRESS_STAGES.ENHANCING;
  if (progress < 100) return PROGRESS_STAGES.FINALIZING;
  return PROGRESS_STAGES.COMPLETE;
};
