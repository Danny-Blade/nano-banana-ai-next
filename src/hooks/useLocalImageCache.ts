"use client";

import React from "react";

const IMAGE_CACHE_DB_NAME = "nano-banana-image-cache";
const IMAGE_CACHE_STORE = "images";
const IMAGE_CACHE_VERSION = 1;

interface CachedImage {
  id: string;
  blob: Blob;
  mimeType: string;
  cachedAt: number;
}

/**
 * 本地图片缓存 Hook
 * 使用 IndexedDB 存储原图 blob，实现本地优先的图片显示策略
 */
export const useLocalImageCache = () => {
  const dbRef = React.useRef<IDBDatabase | null>(null);
  const blobUrlCache = React.useRef<Map<string, string>>(new Map());

  const openDb = React.useCallback(async (): Promise<IDBDatabase> => {
    if (dbRef.current) return dbRef.current;

    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IMAGE_CACHE_DB_NAME, IMAGE_CACHE_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IMAGE_CACHE_STORE)) {
          const store = db.createObjectStore(IMAGE_CACHE_STORE, { keyPath: "id" });
          store.createIndex("cachedAt", "cachedAt", { unique: false });
        }
      };

      req.onsuccess = () => {
        dbRef.current = req.result;
        resolve(req.result);
      };

      req.onerror = () => reject(req.error);
    });
  }, []);

  /**
   * 检查本地是否有缓存
   */
  const has = React.useCallback(async (imageId: string): Promise<boolean> => {
    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(IMAGE_CACHE_STORE, "readonly");
        const store = tx.objectStore(IMAGE_CACHE_STORE);
        const req = store.count(IDBKeyRange.only(imageId));
        req.onsuccess = () => resolve(req.result > 0);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return false;
    }
  }, [openDb]);

  /**
   * 获取本地缓存的图片 (返回 blob URL)
   */
  const get = React.useCallback(async (imageId: string): Promise<string | null> => {
    // 先检查内存中的 blob URL 缓存
    const cached = blobUrlCache.current.get(imageId);
    if (cached) return cached;

    try {
      const db = await openDb();
      const cachedImage = await new Promise<CachedImage | null>((resolve, reject) => {
        const tx = db.transaction(IMAGE_CACHE_STORE, "readonly");
        const store = tx.objectStore(IMAGE_CACHE_STORE);
        const req = store.get(imageId);
        req.onsuccess = () => resolve(req.result as CachedImage | null);
        req.onerror = () => reject(req.error);
      });

      if (!cachedImage) return null;

      // 创建 blob URL 并缓存
      const blobUrl = URL.createObjectURL(cachedImage.blob);
      blobUrlCache.current.set(imageId, blobUrl);
      return blobUrl;
    } catch {
      return null;
    }
  }, [openDb]);

  /**
   * 保存图片到本地缓存
   */
  const set = React.useCallback(async (imageId: string, blob: Blob): Promise<void> => {
    try {
      const db = await openDb();
      const cachedImage: CachedImage = {
        id: imageId,
        blob,
        mimeType: blob.type || "image/png",
        cachedAt: Date.now(),
      };

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IMAGE_CACHE_STORE, "readwrite");
        const store = tx.objectStore(IMAGE_CACHE_STORE);
        store.put(cachedImage);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      // 同时缓存 blob URL
      const blobUrl = URL.createObjectURL(blob);
      blobUrlCache.current.set(imageId, blobUrl);
    } catch {
      // ignore
    }
  }, [openDb]);

  /**
   * 从 URL 获取图片并保存到缓存
   */
  const cacheFromUrl = React.useCallback(async (imageId: string, url: string): Promise<string | null> => {
    // 检查是否已缓存
    const existing = await get(imageId);
    if (existing) return existing;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const blob = await response.blob();
      await set(imageId, blob);

      return blobUrlCache.current.get(imageId) || null;
    } catch {
      return null;
    }
  }, [get, set]);

  /**
   * 删除缓存
   */
  const remove = React.useCallback(async (imageId: string): Promise<void> => {
    // 释放 blob URL
    const blobUrl = blobUrlCache.current.get(imageId);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrlCache.current.delete(imageId);
    }

    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IMAGE_CACHE_STORE, "readwrite");
        const store = tx.objectStore(IMAGE_CACHE_STORE);
        store.delete(imageId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // ignore
    }
  }, [openDb]);

  /**
   * 批量预热缓存（用于新设备同步）
   */
  const warmup = React.useCallback(async (
    items: { id: string; url: string }[],
    onProgress?: (current: number, total: number) => void
  ): Promise<void> => {
    const total = items.length;
    let current = 0;

    // 并发限制
    const concurrency = 3;
    const queue = [...items];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;

        try {
          await cacheFromUrl(item.id, item.url);
        } catch {
          // 忽略单个失败
        }

        current++;
        onProgress?.(current, total);
      }
    };

    // 启动多个并发 worker
    const workers = Array(Math.min(concurrency, items.length))
      .fill(null)
      .map(() => worker());

    await Promise.all(workers);
  }, [cacheFromUrl]);

  /**
   * 获取缓存统计信息
   */
  const getStats = React.useCallback(async (): Promise<{
    count: number;
    totalSize: number;
  }> => {
    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(IMAGE_CACHE_STORE, "readonly");
        const store = tx.objectStore(IMAGE_CACHE_STORE);
        const req = store.openCursor();

        let count = 0;
        let totalSize = 0;

        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor) {
            count++;
            const value = cursor.value as CachedImage;
            totalSize += value.blob.size;
            cursor.continue();
          } else {
            resolve({ count, totalSize });
          }
        };

        req.onerror = () => reject(req.error);
      });
    } catch {
      return { count: 0, totalSize: 0 };
    }
  }, [openDb]);

  /**
   * 清空所有缓存
   */
  const clearAll = React.useCallback(async (): Promise<void> => {
    // 释放所有 blob URL
    for (const blobUrl of blobUrlCache.current.values()) {
      URL.revokeObjectURL(blobUrl);
    }
    blobUrlCache.current.clear();

    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IMAGE_CACHE_STORE, "readwrite");
        const store = tx.objectStore(IMAGE_CACHE_STORE);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // ignore
    }
  }, [openDb]);

  // 清理 blob URL（组件卸载时）
  React.useEffect(() => {
    return () => {
      for (const blobUrl of blobUrlCache.current.values()) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, []);

  return {
    has,
    get,
    set,
    cacheFromUrl,
    remove,
    warmup,
    getStats,
    clearAll,
  };
};
