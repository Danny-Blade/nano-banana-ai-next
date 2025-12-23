"use client";

import React from "react";
import styles from "./Dashboard.module.css";
import { useI18n } from "@/components/I18nProvider";
import { getMessage } from "@/lib/i18n";
import { useSiteContent } from "@/components/useSiteContent";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import ImageHistory from "@/components/ImageHistory";
import { ImageEditorPanel } from "./dashboard/ImageEditorPanel";
import { BatchPanel } from "./dashboard/BatchPanel";
import { ComparePanel } from "./dashboard/ComparePanel";
import {
  modelOptions,
  resolutionOptions,
  type ModelValue,
  type ImageHistoryItem,
  type LocalizedModelOption,
} from "./dashboard/types";

type Tab = "generate" | "batch" | "compare" | "history";
type TemplateTarget = "generate" | "batch" | "batch-multi" | "compare";
type DashboardVariant = "full" | "generateOnly";

type DashboardProps = {
  variant?: DashboardVariant;
};

const templateCategories = [
  { key: "hot" as const },
  { key: "ecommerce" as const },
  { key: "cover" as const },
];

const IMAGE_HISTORY_STORAGE_KEY = "nano_banana_image_history_v1";
const IMAGE_HISTORY_LIMIT = 60;
const IMAGE_HISTORY_SOURCES_KEY = "historySources";

const Dashboard = ({ variant = "full" }: DashboardProps) => {
  const { locale, t } = useI18n();
  const siteContent = useSiteContent();
  const { data: session, status: sessionStatus, update: refreshSession } = useSession();

  const DEFAULT_MODEL: ModelValue = "nano-banana-pro";

  const localizedModelOptions: LocalizedModelOption[] = React.useMemo(() => {
    return modelOptions.map((model) => {
      const badgeValue = getMessage(locale, `dashboard.models.${model.value}.badge`);
      const badge = typeof badgeValue === "string" ? badgeValue : undefined;
      return {
        ...model,
        label: t(`dashboard.models.${model.value}.label`),
        description: t(`dashboard.models.${model.value}.description`),
        badge,
        points: t("dashboard.model.points", { credits: model.creditsPerImage }),
      };
    });
  }, [locale, t]);

  const [activeTab, setActiveTab] = React.useState<Tab>("generate");
  const [selectedModel, setSelectedModel] = React.useState<ModelValue>(DEFAULT_MODEL);
  const [resolution, setResolution] = React.useState(
    resolutionOptions[DEFAULT_MODEL][0]
  );
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewAlt, setPreviewAlt] = React.useState("");
  const [imageHistory, setImageHistory] = React.useState<ImageHistoryItem[]>([]);
  const [selfCallbackUrl, setSelfCallbackUrl] = React.useState<string | undefined>(undefined);
  const historySourceMap = React.useRef<Map<string, string>>(new Map());
  const historyHydratedRef = React.useRef(false);

  const [showTemplates, setShowTemplates] = React.useState(false);
  const [templateCategory, setTemplateCategory] = React.useState(templateCategories[0].key);
  const [templateTarget, setTemplateTarget] = React.useState<TemplateTarget>("generate");
  const [showModelPicker, setShowModelPicker] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);
  const [showActivity, setShowActivity] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  React.useEffect(() => {
    const defaults = resolutionOptions[selectedModel] || ["Auto"];
    setResolution(defaults[0]);
  }, [selectedModel]);

  React.useEffect(() => {
    if (!previewUrl) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewUrl(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewUrl]);

  const imagePool = React.useMemo(() => siteContent.explore.images || [], [siteContent]);

  const isFileSystemAccessSupported = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof (globalThis as any).showDirectoryPicker === "function";
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

  React.useEffect(() => {
    if (historyHydratedRef.current) return;

    const loadHistory = () => {
      try {
        const raw = localStorage.getItem(IMAGE_HISTORY_STORAGE_KEY);
        if (!raw) {
          historyHydratedRef.current = true;
          return;
        }
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          historyHydratedRef.current = true;
          return;
        }
        const items = parsed
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
            } satisfies ImageHistoryItem;
          })
          .filter(Boolean) as ImageHistoryItem[];
        setImageHistory(items.slice(0, IMAGE_HISTORY_LIMIT));
        items.forEach((item) => {
          if (item.imageUrl && !historySourceMap.current.has(item.id)) {
            historySourceMap.current.set(item.id, item.imageUrl);
          }
        });
      } catch {
        // ignore parsing errors
      } finally {
        historyHydratedRef.current = true;
      }
    };

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!historyHydratedRef.current) return;
    if (historySourceMap.current.size > 0) {
      void persistHistorySources();
    }
  }, [persistHistorySources]);

  React.useEffect(() => {
    if (!historyHydratedRef.current) return;
    try {
      localStorage.setItem(
        IMAGE_HISTORY_STORAGE_KEY,
        JSON.stringify(imageHistory.slice(0, IMAGE_HISTORY_LIMIT))
      );
    } catch {
      // ignore
    }
  }, [imageHistory]);

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

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setSelfCallbackUrl(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );
  }, []);

  const ensureAuthenticatedWithCredits = React.useCallback(
    (requiredCredits: number, onError: (message: string) => void): boolean => {
      if (sessionStatus === "loading") {
        onError(t("dashboard.generate.loginChecking"));
        return false;
      }
      if (!session?.user?.id) {
        onError(t("dashboard.generate.loginRequired"));
        setIsLoginModalOpen(true);
        return false;
      }
      const credits = Number(session?.user?.credits ?? 0);
      if (credits < requiredCredits) {
        onError(
          t("dashboard.generate.insufficientCredits", {
            credits,
            required: requiredCredits,
          }),
        );
        return false;
      }
      return true;
    },
    [session, sessionStatus, t],
  );

  const pickImages = React.useCallback(
    (count: number) => {
      const pool = imagePool;
      if (!pool || pool.length === 0) return [];
      const results: string[] = [];
      for (let i = 0; i < count; i++) {
        const index = (Math.floor(Math.random() * pool.length) + i) % pool.length;
        results.push(pool[index]);
      }
      return results;
    },
    [imagePool]
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
        if (permission !== "granted" && typeof handle.requestPermission === "function") {
          const requested = await handle.requestPermission({ mode: "readwrite" });
          if (requested !== "granted") return null;
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

  const currentModel = localizedModelOptions.find((m) => m.value === selectedModel);
  const activeModel = currentModel || localizedModelOptions[0];

  const handleModelSelect = (modelValue: ModelValue) => {
    setSelectedModel(modelValue);
    setShowModelPicker(false);
  };

  const openPreview = React.useCallback((url: string, alt: string) => {
    setPreviewUrl(url);
    setPreviewAlt(alt);
  }, []);

  const handleApplyTemplate = (prompt: string) => {
    // Templates are applied directly in the child components via setTemplateTarget
    setShowTemplates(false);
    // Note: The actual prompt setting is handled by the parent via callback
  };

  const onImageHistoryAdd = React.useCallback((item: ImageHistoryItem) => {
    setImageHistory((prev) => [item, ...prev].slice(0, IMAGE_HISTORY_LIMIT));
  }, []);

  const handleRefreshSession = React.useCallback(async () => {
    try {
      await refreshSession();
    } catch {
      // ignore
    }
  }, [refreshSession]);

  const renderTemplateModal = () => {
    if (!showTemplates) return null;
    const currentPrompts =
      (getMessage(locale, `dashboard.templateItems.${templateCategory}`) as string[]) ||
      [];
    return (
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalCard}>
          <div className={styles.modalHeader}>
            <div>
              <div className={styles.modalTitle}>{t("dashboard.templates.title")}</div>
              <div className={styles.modalCaption}>{t("dashboard.templates.caption")}</div>
            </div>
            <button className={styles.closeBtn} onClick={() => setShowTemplates(false)}>
              ×
            </button>
          </div>
          <div className={styles.modalTabs}>
            {templateCategories.map((cat) => (
              <button
                key={cat.key}
                className={`${styles.modalTab} ${
                  templateCategory === cat.key ? styles.active : ""
                }`}
                onClick={() => setTemplateCategory(cat.key)}
              >
                {t(`dashboard.templates.${cat.key}`)}
              </button>
            ))}
          </div>
          <div className={styles.templateGrid}>
            {currentPrompts.map((prompt, idx) => (
              <button
                key={idx}
                className={styles.templateCard}
                onClick={() => handleApplyTemplate(prompt)}
              >
                <div className={styles.templateTitle}>
                  {t("dashboard.templates.template", { n: idx + 1 })}
                </div>
                <p className={styles.templateText}>{prompt}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderModelModal = () => {
    if (!showModelPicker) return null;
    return (
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalCard}>
          <div className={styles.modalHeader}>
            <div>
              <div className={styles.modalTitle}>{t("dashboard.model.pickerTitle")}</div>
              <div className={styles.modalCaption}>
                {t("dashboard.model.pickerCaption")}
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setShowModelPicker(false)}>
              ×
            </button>
          </div>
          <div className={styles.modelGrid}>
            {localizedModelOptions.map((model) => (
              <button
                key={model.value}
                className={`${styles.modelOption} ${
                  selectedModel === model.value ? styles.active : ""
                }`}
                type="button"
                onClick={() => handleModelSelect(model.value)}
              >
                <div className={styles.modelOptionHead}>
                  <div className={styles.modelOptionName}>{model.label}</div>
                  <div className={styles.modelOptionPoints}>{model.points}</div>
                </div>
                <div className={styles.modelOptionDesc}>{model.description}</div>
                <div className={styles.modelOptionMeta}>
                  {model.badge && <span className={styles.badge}>{model.badge}</span>}
                  <span className={styles.modelOptionHint}>{t("dashboard.model.hint")}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGuideModal = () => {
    if (!showGuide) return null;
    return (
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalCard}>
          <div className={styles.modalHeader}>
            <div>
              <div className={styles.modalTitle}>{t("dashboard.guide.title")}</div>
              <div className={styles.modalCaption}>{t("dashboard.guide.caption")}</div>
            </div>
            <button className={styles.closeBtn} onClick={() => setShowGuide(false)}>
              ×
            </button>
          </div>
          <ul className={styles.list}>
            <li>{t("dashboard.guide.items.generate")}</li>
            <li>{t("dashboard.guide.items.batch")}</li>
            <li>{t("dashboard.guide.items.compare")}</li>
            <li>{t("dashboard.guide.items.history")}</li>
          </ul>
          <div className={styles.noticeAlt}>
            <span className={styles.badge}>{t("dashboard.guide.tipBadge")}</span>
            {t("dashboard.guide.tipText")}
          </div>
        </div>
      </div>
    );
  };

  const renderActivityModal = () => {
    if (!showActivity) return null;
    return (
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalCard}>
          <div className={styles.modalHeader}>
            <div>
              <div className={styles.modalTitle}>{t("dashboard.activity.title")}</div>
              <div className={styles.modalCaption}>{t("dashboard.activity.caption")}</div>
            </div>
            <button className={styles.closeBtn} onClick={() => setShowActivity(false)}>
              ×
            </button>
          </div>
          <div className={styles.activityBlock}>
            <div className={styles.activityTitle}>{t("dashboard.activity.headline")}</div>
            <p className={styles.activityText}>
              {t("dashboard.activity.text")}
            </p>
            <div className={styles.activityGrid}>
              <div className={styles.activityItem}>{t("dashboard.activity.item1")}</div>
              <div className={styles.activityItem}>{t("dashboard.activity.item2")}</div>
              <div className={styles.activityItem}>{t("dashboard.activity.item3")}</div>
            </div>
            <button className={styles.primaryBtn} onClick={() => setShowActivity(false)}>
              {t("dashboard.activity.ok")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Wrapper = variant === "generateOnly" ? "div" : "section";

  return (
    <Wrapper
      className={`${styles.dashboard} ${
        variant === "generateOnly" ? styles.embedded : ""
      }`}
    >
      {variant !== "generateOnly" && <div className={styles.gradient} />}
      <div className={styles.inner}>
        {variant !== "generateOnly" && (
          <div className={styles.tabBar}>
            {[
              { key: "generate", label: t("dashboard.tabs.generate"), icon: "✨" },
              { key: "batch", label: t("dashboard.tabs.batch"), icon: "🧩" },
              { key: "compare", label: t("dashboard.tabs.compare"), icon: "⚖️" },
              { key: "history", label: t("dashboard.tabs.history"), icon: "📜" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tabButton} ${
                  activeTab === tab.key ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab.key as Tab)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {(variant === "generateOnly" || activeTab === "generate") && (
          <ImageEditorPanel
            localizedModelOptions={localizedModelOptions}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            setShowModelPicker={setShowModelPicker}
            setShowTemplates={setShowTemplates}
            setTemplateTarget={setTemplateTarget}
            onImageHistoryAdd={onImageHistoryAdd}
            persistHistorySource={persistHistorySource}
            trySaveToLocalFolder={trySaveToLocalFolder}
            ensureAuthenticatedWithCredits={ensureAuthenticatedWithCredits}
            refreshSession={handleRefreshSession}
            openPreview={openPreview}
          />
        )}

        {variant !== "generateOnly" && activeTab === "batch" && (
          <BatchPanel
            localizedModelOptions={localizedModelOptions}
            selectedModel={selectedModel}
            resolution={resolution}
            ensureAuthenticatedWithCredits={ensureAuthenticatedWithCredits}
            setShowTemplates={setShowTemplates}
            setTemplateTarget={setTemplateTarget}
            openPreview={openPreview}
            pickImages={pickImages}
            activeModel={activeModel}
          />
        )}

        {variant !== "generateOnly" && activeTab === "compare" && (
          <ComparePanel
            localizedModelOptions={localizedModelOptions}
            resolution={resolution}
            ensureAuthenticatedWithCredits={ensureAuthenticatedWithCredits}
            setShowTemplates={setShowTemplates}
            setTemplateTarget={setTemplateTarget}
            setIsLoginModalOpen={setIsLoginModalOpen}
            openPreview={openPreview}
            onImageHistoryAdd={onImageHistoryAdd}
            persistHistorySource={persistHistorySource}
            trySaveToLocalFolder={trySaveToLocalFolder}
            activeModel={activeModel}
          />
        )}

        {variant !== "generateOnly" && activeTab === "history" && (
          <div className={styles.panel}>
            <ImageHistory
              externalHistory={imageHistory}
              onHistoryChange={setImageHistory}
            />
          </div>
        )}
      </div>

      {renderTemplateModal()}
      {renderModelModal()}
      {renderGuideModal()}
      {renderActivityModal()}

      <LoginModal
        isOpen={isLoginModalOpen}
        callbackUrl={selfCallbackUrl}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {previewUrl && (
        <div
          className={styles.previewOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className={styles.previewContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.previewClose}
              aria-label={t("dashboard.result.closePreview")}
              onClick={() => setPreviewUrl(null)}
            >
              ×
            </button>
            <img
              src={previewUrl}
              alt={previewAlt}
              className={styles.previewImage}
            />
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default Dashboard;
