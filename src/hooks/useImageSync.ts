"use client";

import React from "react";
import { useLocalImageCache } from "./useLocalImageCache";
import type { ImageHistoryItem, ModelValue } from "./useImageHistory";

export type SyncStatus = "idle" | "checking" | "syncing" | "done" | "error";

export interface CloudHistoryItem {
  id: string;
  createdAt: number;
  model: string;
  prompt: string;
  aspectRatio: string;
  imageSize: string;
  costCredits: number;
  r2Key: string | null;
  r2Url: string | null;
}

export interface SyncProgress {
  current: number;
  total: number;
  phase: "metadata" | "images";
}

interface SyncState {
  status: SyncStatus;
  progress: SyncProgress;
  error: string | null;
  lastSyncAt: number | null;
}

const SYNC_STATE_KEY = "nano_banana_sync_state";
const SYNC_MARKER_KEY = "nano_banana_device_synced";

/**
 * 图片同步 Hook
 * 用于新设备登录时从云端同步历史记录和图片
 */
export const useImageSync = (params: {
  localHistory: ImageHistoryItem[];
  onHistorySync: (items: ImageHistoryItem[]) => void;
  isLoggedIn: boolean;
}) => {
  const { localHistory, onHistorySync, isLoggedIn } = params;
  const imageCache = useLocalImageCache();

  const [syncState, setSyncState] = React.useState<SyncState>({
    status: "idle",
    progress: { current: 0, total: 0, phase: "metadata" },
    error: null,
    lastSyncAt: null,
  });

  // 加载上次同步状态
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(SYNC_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lastSyncAt) {
          setSyncState((prev) => ({ ...prev, lastSyncAt: parsed.lastSyncAt }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  /**
   * 检查是否需要同步（新设备检测）
   */
  const checkNeedSync = React.useCallback(async (): Promise<boolean> => {
    if (!isLoggedIn) return false;

    // 检查是否已经同步过
    const synced = localStorage.getItem(SYNC_MARKER_KEY);
    if (synced) return false;

    // 本地没有历史记录，可能是新设备
    if (localHistory.length === 0) return true;

    // 调用 API 检查差异
    try {
      const localIds = localHistory.map((item) => item.id);
      const response = await fetch("/api/history/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localIds }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      // 如果云端有本地缺失的记录，需要同步
      return data.missingInLocal && data.missingInLocal.length > 0;
    } catch {
      return false;
    }
  }, [isLoggedIn, localHistory]);

  /**
   * 从云端获取历史记录元数据
   */
  const fetchCloudHistory = React.useCallback(async (): Promise<CloudHistoryItem[]> => {
    const allItems: CloudHistoryItem[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await fetch(`/api/history/sync?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error("Failed to fetch cloud history");

      const data = await response.json();
      allItems.push(...data.items);

      if (data.items.length < limit || allItems.length >= data.total) {
        break;
      }

      offset += limit;
    }

    return allItems;
  }, []);

  /**
   * 将云端历史项转换为本地格式
   */
  const convertToLocalItem = React.useCallback((cloudItem: CloudHistoryItem): ImageHistoryItem => {
    return {
      id: cloudItem.id,
      createdAt: cloudItem.createdAt * 1000, // 转换为毫秒
      model: cloudItem.model as ModelValue,
      prompt: cloudItem.prompt,
      aspectRatio: cloudItem.aspectRatio,
      imageSize: cloudItem.imageSize,
      costCredits: cloudItem.costCredits,
      thumbnailDataUrl: "", // 稍后从图片生成
      imageUrl: cloudItem.r2Url || undefined,
    };
  }, []);

  /**
   * 执行完整同步
   */
  const sync = React.useCallback(async () => {
    if (!isLoggedIn) {
      setSyncState((prev) => ({
        ...prev,
        status: "error",
        error: "请先登录",
      }));
      return;
    }

    setSyncState({
      status: "checking",
      progress: { current: 0, total: 0, phase: "metadata" },
      error: null,
      lastSyncAt: null,
    });

    try {
      // 1. 获取云端历史记录
      setSyncState((prev) => ({
        ...prev,
        status: "syncing",
        progress: { ...prev.progress, phase: "metadata" },
      }));

      const cloudHistory = await fetchCloudHistory();

      if (cloudHistory.length === 0) {
        setSyncState({
          status: "done",
          progress: { current: 0, total: 0, phase: "metadata" },
          error: null,
          lastSyncAt: Date.now(),
        });
        localStorage.setItem(SYNC_MARKER_KEY, "true");
        localStorage.setItem(SYNC_STATE_KEY, JSON.stringify({ lastSyncAt: Date.now() }));
        return;
      }

      // 2. 找出本地缺失的记录
      const localIds = new Set(localHistory.map((item) => item.id));
      const missingItems = cloudHistory.filter((item) => !localIds.has(item.id));

      if (missingItems.length === 0) {
        setSyncState({
          status: "done",
          progress: { current: 0, total: 0, phase: "metadata" },
          error: null,
          lastSyncAt: Date.now(),
        });
        localStorage.setItem(SYNC_MARKER_KEY, "true");
        localStorage.setItem(SYNC_STATE_KEY, JSON.stringify({ lastSyncAt: Date.now() }));
        return;
      }

      // 3. 转换为本地格式并合并
      const newLocalItems = missingItems.map(convertToLocalItem);

      // 4. 下载图片并生成缩略图
      setSyncState((prev) => ({
        ...prev,
        progress: { current: 0, total: missingItems.length, phase: "images" },
      }));

      const itemsWithImages: ImageHistoryItem[] = [];

      for (let i = 0; i < missingItems.length; i++) {
        const cloudItem = missingItems[i];
        const localItem = newLocalItems[i];

        if (cloudItem.r2Url) {
          try {
            // 下载图片到本地缓存
            const blobUrl = await imageCache.cacheFromUrl(cloudItem.id, cloudItem.r2Url);

            if (blobUrl) {
              // 生成缩略图
              const thumbnail = await createThumbnailFromUrl(blobUrl);
              if (thumbnail) {
                localItem.thumbnailDataUrl = thumbnail;
              }
            }
          } catch {
            // 图片下载失败，跳过
          }
        }

        // 即使没有图片也添加到历史记录
        if (localItem.thumbnailDataUrl || cloudItem.r2Url) {
          itemsWithImages.push(localItem);
        }

        setSyncState((prev) => ({
          ...prev,
          progress: { ...prev.progress, current: i + 1 },
        }));
      }

      // 5. 合并到本地历史
      if (itemsWithImages.length > 0) {
        const mergedHistory = [...itemsWithImages, ...localHistory].sort(
          (a, b) => b.createdAt - a.createdAt
        );
        onHistorySync(mergedHistory);
      }

      // 6. 标记同步完成
      setSyncState({
        status: "done",
        progress: { current: missingItems.length, total: missingItems.length, phase: "images" },
        error: null,
        lastSyncAt: Date.now(),
      });
      localStorage.setItem(SYNC_MARKER_KEY, "true");
      localStorage.setItem(SYNC_STATE_KEY, JSON.stringify({ lastSyncAt: Date.now() }));
    } catch (error) {
      setSyncState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "同步失败",
      }));
    }
  }, [isLoggedIn, fetchCloudHistory, localHistory, convertToLocalItem, imageCache, onHistorySync]);

  /**
   * 自动检测并提示同步
   */
  const autoCheckSync = React.useCallback(async () => {
    const needSync = await checkNeedSync();
    return needSync;
  }, [checkNeedSync]);

  /**
   * 重置同步状态（用于调试或重新同步）
   */
  const resetSync = React.useCallback(() => {
    localStorage.removeItem(SYNC_MARKER_KEY);
    localStorage.removeItem(SYNC_STATE_KEY);
    setSyncState({
      status: "idle",
      progress: { current: 0, total: 0, phase: "metadata" },
      error: null,
      lastSyncAt: null,
    });
  }, []);

  return {
    syncStatus: syncState.status,
    syncProgress: syncState.progress,
    syncError: syncState.error,
    lastSyncAt: syncState.lastSyncAt,
    checkNeedSync,
    autoCheckSync,
    sync,
    resetSync,
  };
};

/**
 * 从 URL 创建缩略图
 */
async function createThumbnailFromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const bitmap =
      typeof createImageBitmap === "function" ? await createImageBitmap(blob) : null;

    if (!bitmap) return null;

    const maxSize = 320;
    const srcW = bitmap.width;
    const srcH = bitmap.height;

    const scale = Math.min(1, maxSize / Math.max(srcW, srcH));
    const width = Math.max(1, Math.round(srcW * scale));
    const height = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(bitmap, 0, 0, width, height);

    try {
      bitmap.close();
    } catch {
      // ignore
    }

    return canvas.toDataURL("image/jpeg", 0.78);
  } catch {
    return null;
  }
}
