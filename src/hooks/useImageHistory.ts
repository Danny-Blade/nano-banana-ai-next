"use client";

import React from "react";

export const modelOptions = [
  { value: "nano-banana", creditsPerImage: 2 },
  { value: "nano-banana-pro", creditsPerImage: 4 },
  { value: "seedream-4-0", creditsPerImage: 5 },
  { value: "sora-image", creditsPerImage: 6 },
  { value: "flux-kontext-pro", creditsPerImage: 3 },
  { value: "flux-kontext-max", creditsPerImage: 8 },
] as const;

export type ModelValue = (typeof modelOptions)[number]["value"];

export type ImageHistoryItem = {
  id: string;
  createdAt: number;
  model: ModelValue;
  prompt: string;
  aspectRatio: string;
  imageSize: string;
  costCredits: number;
  thumbnailDataUrl: string;
  imageUrl?: string;
  fileName?: string;
  savedDirName?: string;
  savedVia?: "download" | "fs";
  /** 参考图缩略图（用于 image-to-image 生成） */
  referenceImageThumbnail?: string;
  /** 参考图原始 URL */
  referenceImageUrl?: string;
};

const IMAGE_HISTORY_STORAGE_KEY = "nano_banana_image_history_v1"; // localStorage (legacy)
const IMAGE_HISTORY_IDB_KEY = "imageHistory"; // IndexedDB (new)
const IMAGE_HISTORY_SOURCES_KEY = "historySources";

export type HistoryTypeFilter = "all" | "text2img" | "img2img";

export const useImageHistory = () => {
  const [imageHistory, setImageHistory] = React.useState<ImageHistoryItem[]>([]);
  const [historyModelFilter, setHistoryModelFilter] = React.useState<ModelValue | "all">("all");
  const [historyTypeFilter, setHistoryTypeFilter] = React.useState<HistoryTypeFilter>("all");
  const [historyNotice, setHistoryNotice] = React.useState<string | null>(null);
  const [saveDirName, setSaveDirName] = React.useState<string | null>(null);
  const [hasSaveDir, setHasSaveDir] = React.useState(false);
  const [isFileSystemAccessSupported, setIsFileSystemAccessSupported] = React.useState(false);
  const historySourceMap = React.useRef<Map<string, string>>(new Map());
  const historyHydratedRef = React.useRef(false);

  // Check File System Access API support on client side only
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setIsFileSystemAccessSupported(typeof (globalThis as any).showDirectoryPicker === "function");
  }, []);

  const historyDb = React.useMemo(() => {
    const open = () =>
      new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open("nano-banana-local", 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

    const get = async <T,>(key: string): Promise<T | null> => {
      const db = await open();
      return await new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction("kv", "readonly");
        const store = tx.objectStore("kv");
        const req = store.get(key);
        req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
        req.onerror = () => reject(req.error);
      });
    };

    const put = async (key: string, value: unknown) => {
      const db = await open();
      return await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("kv", "readwrite");
        const store = tx.objectStore("kv");
        store.put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    };

    return { get, put };
  }, []);

  const showHistoryNotice = React.useCallback((message: string) => {
    setHistoryNotice(message);
    window.setTimeout(() => setHistoryNotice(null), 1800);
  }, []);

  const persistHistorySources = React.useCallback(async () => {
    try {
      await historyDb.put(
        IMAGE_HISTORY_SOURCES_KEY,
        Object.fromEntries(historySourceMap.current.entries()),
      );
    } catch {
      // ignore
    }
  }, [historyDb]);

  const persistHistorySource = React.useCallback(
    async (id: string, url: string) => {
      historySourceMap.current.set(id, url);
      await persistHistorySources();
    },
    [persistHistorySources],
  );

  // Load history sources from IndexedDB
  React.useEffect(() => {
    historyDb
      .get<Record<string, string>>(IMAGE_HISTORY_SOURCES_KEY)
      .then((stored) => {
        if (!stored) return;
        const merged = new Map<string, string>([
          ...Object.entries(stored),
          ...historySourceMap.current.entries(),
        ]);
        historySourceMap.current = merged;
      })
      .catch(() => null);
  }, [historyDb]);

  // Parse raw history data (from localStorage or IndexedDB)
  const parseHistoryData = React.useCallback((parsed: unknown): ImageHistoryItem[] => {
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v) => v && typeof v === "object")
      .map((rawItem) => {
        const v = rawItem as Record<string, unknown>;
        const id = typeof v.id === "string" ? v.id : null;
        const createdAt =
          typeof v.createdAt === "number"
            ? v.createdAt
            : typeof v.created_at === "number"
              ? v.created_at
              : null;
        const model =
          typeof v.model === "string"
            ? v.model
            : typeof v.modelKey === "string"
              ? v.modelKey
              : typeof v.model_key === "string"
                ? v.model_key
                : null;
        const prompt =
          typeof v.prompt === "string"
            ? v.prompt
            : typeof v.text === "string"
              ? v.text
              : "";
        const thumbnailDataUrl =
          typeof v.thumbnailDataUrl === "string"
            ? v.thumbnailDataUrl
            : typeof v.thumbnail === "string"
              ? v.thumbnail
              : typeof v.thumb === "string"
                ? v.thumb
                : typeof v.imageUrl === "string"
                  ? v.imageUrl
                  : null;
        if (!id || createdAt == null || !model || !thumbnailDataUrl) return null;
        return {
          id,
          createdAt,
          model: model as ModelValue,
          prompt,
          aspectRatio: typeof v.aspectRatio === "string" ? v.aspectRatio : "1:1",
          imageSize: typeof v.imageSize === "string" ? v.imageSize : "1K",
          costCredits: typeof v.costCredits === "number" ? v.costCredits : 0,
          thumbnailDataUrl,
          imageUrl: typeof v.imageUrl === "string" ? v.imageUrl : undefined,
          fileName: typeof v.fileName === "string" ? v.fileName : undefined,
          savedDirName: typeof v.savedDirName === "string" ? v.savedDirName : undefined,
          savedVia:
            v.savedVia === "download" || v.savedVia === "fs" ? v.savedVia : undefined,
          referenceImageThumbnail:
            typeof v.referenceImageThumbnail === "string" ? v.referenceImageThumbnail : undefined,
          referenceImageUrl:
            typeof v.referenceImageUrl === "string" ? v.referenceImageUrl : undefined,
        } satisfies ImageHistoryItem;
      })
      .filter(Boolean) as ImageHistoryItem[];
  }, []);

  // Load history from IndexedDB (with localStorage migration) - only once on mount
  React.useEffect(() => {
    if (historyHydratedRef.current) return;

    const loadHistory = async () => {
      try {
        // Try to load from IndexedDB first
        const idbData = await historyDb.get<ImageHistoryItem[]>(IMAGE_HISTORY_IDB_KEY);
        if (idbData && Array.isArray(idbData) && idbData.length > 0) {
          const items = parseHistoryData(idbData);
          setImageHistory(items);
          items.forEach((item) => {
            if (item.imageUrl && !historySourceMap.current.has(item.id)) {
              historySourceMap.current.set(item.id, item.imageUrl);
            }
          });
          historyHydratedRef.current = true;
          return;
        }

        // Fallback: migrate from localStorage
        const raw = localStorage.getItem(IMAGE_HISTORY_STORAGE_KEY);
        if (!raw) {
          historyHydratedRef.current = true;
          return;
        }
        const parsed: unknown = JSON.parse(raw);
        const items = parseHistoryData(parsed);
        if (items.length > 0) {
          setImageHistory(items);
          items.forEach((item) => {
            if (item.imageUrl && !historySourceMap.current.has(item.id)) {
              historySourceMap.current.set(item.id, item.imageUrl);
            }
          });
          // Migrate to IndexedDB and clear localStorage
          await historyDb.put(IMAGE_HISTORY_IDB_KEY, items);
          localStorage.removeItem(IMAGE_HISTORY_STORAGE_KEY);
        }
      } catch {
        // ignore errors
      } finally {
        historyHydratedRef.current = true;
      }
    };

    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyDb, parseHistoryData]);

  // Persist historySourceMap to IndexedDB after data is loaded
  React.useEffect(() => {
    if (!historyHydratedRef.current) return;
    if (historySourceMap.current.size > 0) {
      void persistHistorySources();
    }
  }, [persistHistorySources]);

  // Save history to IndexedDB
  React.useEffect(() => {
    if (!historyHydratedRef.current) return;
    void historyDb.put(IMAGE_HISTORY_IDB_KEY, imageHistory).catch(() => {
      // ignore
    });
  }, [imageHistory, historyDb]);

  // Clean up orphaned sources
  React.useEffect(() => {
    const keep = new Set(imageHistory.map((item) => item.id));
    let changed = false;
    for (const key of historySourceMap.current.keys()) {
      if (!keep.has(key)) {
        historySourceMap.current.delete(key);
        changed = true;
      }
    }
    if (changed) {
      void persistHistorySources();
    }
  }, [imageHistory, persistHistorySources]);

  // Load save dir info from IndexedDB
  React.useEffect(() => {
    if (!isFileSystemAccessSupported) return;
    historyDb
      .get<{ name?: string }>("saveDirMeta")
      .then((meta) => {
        if (meta?.name) setSaveDirName(meta.name);
      })
      .catch(() => null);
    historyDb
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .get<any>("saveDirHandle")
      .then((handle) => {
        if (handle) setHasSaveDir(true);
      })
      .catch(() => null);
  }, [historyDb, isFileSystemAccessSupported]);

  const downloadImage = React.useCallback(async (url: string, name?: string) => {
    const filename = name || `nano-banana-${Date.now()}.png`;

    const trigger = (href: string) => {
      const link = document.createElement("a");
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (url.startsWith("data:") || url.startsWith("blob:")) {
      trigger(url);
      return;
    }

    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      trigger(objectUrl);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5_000);
    } catch {
      trigger(url);
    }
  }, []);

  const pickSaveFolder = React.useCallback(async () => {
    if (!isFileSystemAccessSupported) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const picker = (globalThis as any).showDirectoryPicker as (() => Promise<any>) | undefined;
    if (!picker) return;
    try {
      const handle = await picker();
      const name = typeof handle?.name === "string" ? handle.name : null;
      await historyDb.put("saveDirHandle", handle);
      await historyDb.put("saveDirMeta", { name });
      setSaveDirName(name);
      setHasSaveDir(true);
    } catch {
      // user cancelled
    }
  }, [isFileSystemAccessSupported, historyDb]);

  const openSavedFile = React.useCallback(
    async (item: ImageHistoryItem) => {
      if (!isFileSystemAccessSupported) return;
      if (!item.fileName) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = await historyDb.get<any>("saveDirHandle").catch(() => null);
      if (!handle) return;
      try {
        const permission =
          typeof handle.queryPermission === "function"
            ? await handle.queryPermission({ mode: "read" })
            : "granted";
        // 如果权限不足，静默跳过，不弹窗请求权限
        if (permission !== "granted") {
          return;
        }
        const fileHandle = await handle.getFileHandle(item.fileName);
        const file = await fileHandle.getFile();
        const objectUrl = URL.createObjectURL(file);
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      } catch {
        // ignore
      }
    },
    [isFileSystemAccessSupported, historyDb]
  );

  const downloadSavedFile = React.useCallback(
    async (item: ImageHistoryItem) => {
      if (!isFileSystemAccessSupported) return false;
      if (!item.fileName) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = await historyDb.get<any>("saveDirHandle").catch(() => null);
      if (!handle) return false;
      try {
        const permission =
          typeof handle.queryPermission === "function"
            ? await handle.queryPermission({ mode: "read" })
            : "granted";
        // 如果权限不足，静默跳过，不弹窗请求权限
        if (permission !== "granted") {
          return false;
        }

        const fileHandle = await handle.getFileHandle(item.fileName);
        const file = await fileHandle.getFile();
        const objectUrl = URL.createObjectURL(file);
        await downloadImage(objectUrl, item.fileName);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 5_000);
        return true;
      } catch {
        return false;
      }
    },
    [isFileSystemAccessSupported, historyDb, downloadImage]
  );

  const trySaveToLocalFolder = React.useCallback(
    async (url: string, fileName: string) => {
      if (!isFileSystemAccessSupported) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = await historyDb.get<any>("saveDirHandle").catch(() => null);
      if (!handle) return null;

      try {
        const permission =
          typeof handle.queryPermission === "function"
            ? await handle.queryPermission({ mode: "readwrite" })
            : "granted";
        // 如果权限不足，静默跳过，不弹窗请求权限
        // 用户需要手动点击"选择保存文件夹"按钮来重新授权
        if (permission !== "granted") {
          return null;
        }

        const res = await fetch(url);
        const blob = await res.blob();
        const fileHandle = await handle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        const dirName = typeof handle?.name === "string" ? handle.name : null;
        return {
          fileName,
          savedDirName: dirName,
          savedVia: "fs" as const,
        };
      } catch {
        return null;
      }
    },
    [isFileSystemAccessSupported, historyDb]
  );

  const createThumbnailDataUrl = React.useCallback(async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const bitmap =
        typeof createImageBitmap === "function" ? await createImageBitmap(blob) : null;
      const maxSize = 320;
      const srcW = bitmap ? bitmap.width : 0;
      const srcH = bitmap ? bitmap.height : 0;
      if (!bitmap || !srcW || !srcH) return null;

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
  }, []);

  const addHistoryItem = React.useCallback(
    (item: ImageHistoryItem) => {
      setImageHistory((prev) => [item, ...prev]);
      if (item.imageUrl) {
        void persistHistorySource(item.id, item.imageUrl);
      }
    },
    [persistHistorySource]
  );

  const updateHistoryItem = React.useCallback(
    (id: string, updates: Partial<ImageHistoryItem>) => {
      setImageHistory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const getSourceUrl = React.useCallback(
    (item: ImageHistoryItem) => {
      return item.imageUrl || historySourceMap.current.get(item.id) || "";
    },
    []
  );

  return {
    imageHistory,
    setImageHistory,
    historyModelFilter,
    setHistoryModelFilter,
    historyTypeFilter,
    setHistoryTypeFilter,
    historyNotice,
    showHistoryNotice,
    saveDirName,
    hasSaveDir,
    isFileSystemAccessSupported,
    historySourceMap,
    downloadImage,
    pickSaveFolder,
    openSavedFile,
    downloadSavedFile,
    trySaveToLocalFolder,
    createThumbnailDataUrl,
    addHistoryItem,
    updateHistoryItem,
    getSourceUrl,
    persistHistorySource,
  };
};
