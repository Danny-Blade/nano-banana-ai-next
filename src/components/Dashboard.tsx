"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import styles from "./Dashboard.module.css";
import { useI18n, LocaleLink } from "@/components/I18nProvider";
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
  type LocalizedModelOption,
} from "./dashboard/types";
import { useImageHistory, type ImageHistoryItem } from "@/hooks/useImageHistory";
import { useImageSync } from "@/hooks/useImageSync";
import { SyncIndicator, SyncPrompt } from "@/components/SyncIndicator";

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

const Dashboard = ({ variant = "full" }: DashboardProps) => {
  const { locale, t } = useI18n();
  const siteContent = useSiteContent();
  const { data: session, status: sessionStatus, update: refreshSession } = useSession();
  const searchParams = useSearchParams();

  // Read initial values from URL query parameters
  const initialPrompt = searchParams.get("prompt") || "";
  const initialRefImage = searchParams.get("refImage") || "";
  const initialTab = searchParams.get("tab") as Tab | null;

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

  const [activeTab, setActiveTab] = React.useState<Tab>(
    initialTab && ["generate", "batch", "compare", "history"].includes(initialTab)
      ? initialTab
      : "generate"
  );
  const [selectedModel, setSelectedModel] = React.useState<ModelValue>(DEFAULT_MODEL);
  const [resolution, setResolution] = React.useState(
    resolutionOptions[DEFAULT_MODEL][0]
  );
  const [previewImages, setPreviewImages] = React.useState<{ url: string; alt: string }[]>([]);
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const [selfCallbackUrl, setSelfCallbackUrl] = React.useState<string | undefined>(undefined);

  // Use shared history hook
  const {
    imageHistory,
    setImageHistory,
    persistHistorySource,
    trySaveToLocalFolder,
    addHistoryItem,
    getSourceUrl,
  } = useImageHistory();

  // Image sync hook for cloud synchronization
  const {
    syncStatus,
    syncProgress,
    syncError,
    autoCheckSync,
    sync: startSync,
  } = useImageSync({
    localHistory: imageHistory,
    onHistorySync: setImageHistory,
    isLoggedIn: !!session?.user?.id,
  });

  const [showSyncPrompt, setShowSyncPrompt] = React.useState(false);
  const [showSyncIndicator, setShowSyncIndicator] = React.useState(false);

  // Check for sync when logged in
  React.useEffect(() => {
    if (!session?.user?.id) return;

    const checkSync = async () => {
      const needSync = await autoCheckSync();
      if (needSync) {
        setShowSyncPrompt(true);
      }
    };

    // Delay check to avoid blocking initial render
    const timer = setTimeout(checkSync, 2000);
    return () => clearTimeout(timer);
  }, [session?.user?.id, autoCheckSync]);

  // Show sync indicator when syncing
  React.useEffect(() => {
    if (syncStatus === "syncing" || syncStatus === "checking") {
      setShowSyncIndicator(true);
    } else if (syncStatus === "done" || syncStatus === "error") {
      // Keep indicator visible briefly after completion
      const timer = setTimeout(() => {
        if (syncStatus === "done") {
          setShowSyncIndicator(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const handleStartSync = React.useCallback(() => {
    setShowSyncPrompt(false);
    setShowSyncIndicator(true);
    startSync();
  }, [startSync]);

  const handleSkipSync = React.useCallback(() => {
    setShowSyncPrompt(false);
    // Mark as synced to avoid prompting again
    localStorage.setItem("nano_banana_device_synced", "true");
  }, []);

  const handleDismissSync = React.useCallback(() => {
    setShowSyncIndicator(false);
  }, []);

  const [showTemplates, setShowTemplates] = React.useState(false);
  const [templateCategory, setTemplateCategory] = React.useState(templateCategories[0].key);
  const [templateTarget, setTemplateTarget] = React.useState<TemplateTarget>("generate");
  const [showModelPicker, setShowModelPicker] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);
  const [showActivity, setShowActivity] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = React.useState(false);
  const [insufficientCreditsInfo, setInsufficientCreditsInfo] = React.useState<{
    credits: number;
    required: number;
  } | null>(null);

  // Sync activeTab with URL tab parameter
  React.useEffect(() => {
    const tabParam = searchParams.get("tab") as Tab | null;
    if (tabParam && ["generate", "batch", "compare", "history"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  React.useEffect(() => {
    const defaults = resolutionOptions[selectedModel] || ["Auto"];
    setResolution(defaults[0]);
  }, [selectedModel]);

  React.useEffect(() => {
    if (previewImages.length === 0) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImages([]);
        setPreviewIndex(0);
      } else if (event.key === "ArrowLeft") {
        setPreviewIndex((prev) => (prev > 0 ? prev - 1 : previewImages.length - 1));
      } else if (event.key === "ArrowRight") {
        setPreviewIndex((prev) => (prev < previewImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewImages]);

  const imagePool = React.useMemo(() => siteContent.explore.images || [], [siteContent]);

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
        // 打开积分不足弹窗
        setInsufficientCreditsInfo({ credits, required: requiredCredits });
        setShowInsufficientCreditsModal(true);
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

  const currentModel = localizedModelOptions.find((m) => m.value === selectedModel);
  const activeModel = currentModel || localizedModelOptions[0];

  const handleModelSelect = (modelValue: ModelValue) => {
    setSelectedModel(modelValue);
    setShowModelPicker(false);
  };

  const openPreview = React.useCallback((
    images: { url: string; alt: string }[],
    index: number = 0
  ) => {
    setPreviewImages(images);
    setPreviewIndex(index);
  }, []);

  const handleApplyTemplate = (prompt: string) => {
    // Templates are applied directly in the child components via setTemplateTarget
    setShowTemplates(false);
    // Note: The actual prompt setting is handled by the parent via callback
  };

  const onImageHistoryAdd = React.useCallback((item: ImageHistoryItem) => {
    addHistoryItem(item);
  }, [addHistoryItem]);

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
        <div className={`${styles.modalCard} ${styles.modelPickerCard}`}>
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
            {localizedModelOptions.map((model) => {
              const isFeatured = model.value === "nano-banana-pro";
              return (
              <button
                key={model.value}
                className={`${styles.modelOption} ${
                  selectedModel === model.value ? styles.active : ""
                } ${isFeatured ? styles.modelOptionFeatured : ""}`}
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
                  {isFeatured && (
                    <span className={styles.featuredTag}>
                      {t("dashboard.model.featured")}
                    </span>
                  )}
                  <span className={styles.modelOptionHint}>{t("dashboard.model.hint")}</span>
                </div>
              </button>
            )})}
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

  const renderInsufficientCreditsModal = () => {
    if (!showInsufficientCreditsModal || !insufficientCreditsInfo) return null;
    return (
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalCard}>
          <div className={styles.modalHeader}>
            <div>
              <div className={styles.modalTitle}>
                {t("dashboard.insufficientCreditsModal.title")}
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setShowInsufficientCreditsModal(false)}
            >
              ×
            </button>
          </div>
          <div className={styles.activityBlock}>
            <p className={styles.activityText}>
              {t("dashboard.insufficientCreditsModal.message", {
                credits: insufficientCreditsInfo.credits,
                required: insufficientCreditsInfo.required,
              })}
            </p>
            <div className={styles.promptActions}>
              <button
                className={styles.ghostBtn}
                onClick={() => setShowInsufficientCreditsModal(false)}
              >
                {t("dashboard.insufficientCreditsModal.close")}
              </button>
              <LocaleLink href="/pricing" className={styles.primaryBtn}>
                {t("dashboard.insufficientCreditsModal.buyCredits")}
              </LocaleLink>
            </div>
          </div>
        </div>
      </div>
    );
  };

  type ModelShowcaseItem = {
    key: string;
    title: string;
    subtitle: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  };

  const modelShowcaseItems = React.useMemo<ModelShowcaseItem[]>(() => {
    const items = getMessage(locale, "dashboard.modelShowcase.items");
    return Array.isArray(items) ? (items as ModelShowcaseItem[]) : [];
  }, [locale]);

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

        {/* ImageEditorPanel 保持挂载以便生成进度在切换标签时继续 */}
        <div style={{ display: (variant === "generateOnly" || activeTab === "generate") ? "block" : "none" }}>
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
            initialPrompt={initialPrompt}
            initialRefImage={initialRefImage}
          />
        </div>

        {variant !== "generateOnly" &&
          activeTab === "generate" &&
          modelShowcaseItems.length > 0 && (
            <div className={styles.modelShowcase}>
              <div className={styles.sectionHeader}>
                <div>
                  <div className={styles.sectionTitle}>
                    {t("dashboard.modelShowcase.title")}
                  </div>
                  <div className={styles.sectionCaption}>
                    {t("dashboard.modelShowcase.caption")}
                  </div>
                </div>
              </div>
              <div className={styles.modelShowcaseListStack}>
                {modelShowcaseItems.map((item) => {
                  const isFeatured = item.key === "nano-banana-pro";
                  return (
                    <div
                      key={item.key}
                      className={`${styles.modelShowcaseItem} ${
                        isFeatured ? styles.modelShowcaseFeatured : ""
                      }`}
                    >
                      <div className={styles.modelShowcaseHeader}>
                        <div>
                          <div className={styles.modelShowcaseName}>{item.title}</div>
                          <div className={styles.modelShowcaseSubtitle}>
                            {item.subtitle}
                          </div>
                        </div>
                        {isFeatured && (
                          <span className={styles.featuredTagLarge}>
                            {t("dashboard.model.featured")}
                          </span>
                        )}
                      </div>
                      <p className={styles.modelShowcaseDesc}>{item.description}</p>
                      <div className={styles.modelShowcaseLists}>
                        <div>
                          <div className={styles.modelShowcaseLabel}>
                            {t("dashboard.modelShowcase.strengths")}
                          </div>
                          <ul className={styles.modelShowcaseList}>
                            {item.strengths.map((point, index) => (
                              <li key={`${item.key}-s-${index}`}>{point}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className={styles.modelShowcaseLabel}>
                            {t("dashboard.modelShowcase.weaknesses")}
                          </div>
                          <ul className={styles.modelShowcaseListMuted}>
                            {item.weaknesses.map((point, index) => (
                              <li key={`${item.key}-w-${index}`}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* BatchPanel 保持挂载以便生成进度在切换标签时继续 */}
        <div style={{ display: (variant !== "generateOnly" && activeTab === "batch") ? "block" : "none" }}>
          <BatchPanel
            localizedModelOptions={localizedModelOptions}
            selectedModel={selectedModel}
            setShowModelPicker={setShowModelPicker}
            ensureAuthenticatedWithCredits={ensureAuthenticatedWithCredits}
            setShowTemplates={setShowTemplates}
            setTemplateTarget={setTemplateTarget}
            openPreview={openPreview}
            onImageHistoryAdd={onImageHistoryAdd}
            persistHistorySource={persistHistorySource}
            refreshSession={handleRefreshSession}
          />
        </div>

        {/* ComparePanel 保持挂载以便生成进度在切换标签时继续 */}
        <div style={{ display: (variant !== "generateOnly" && activeTab === "compare") ? "block" : "none" }}>
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
        </div>

        {variant !== "generateOnly" && activeTab === "history" && (
          <div className={styles.panel}>
            <ImageHistory
              externalHistory={imageHistory}
              onHistoryChange={setImageHistory}
              externalGetSourceUrl={getSourceUrl}
            />
          </div>
        )}
      </div>

      {renderTemplateModal()}
      {renderModelModal()}
      {renderGuideModal()}
      {renderActivityModal()}
      {renderInsufficientCreditsModal()}

      <LoginModal
        isOpen={isLoginModalOpen}
        callbackUrl={selfCallbackUrl}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Sync Prompt Modal */}
      {showSyncPrompt && (
        <SyncPrompt
          onSync={handleStartSync}
          onSkip={handleSkipSync}
          labels={{
            title: t("dashboard.sync.promptTitle"),
            description: t("dashboard.sync.promptDescription"),
            syncButton: t("dashboard.sync.syncButton"),
            skipButton: t("dashboard.sync.skipButton"),
          }}
        />
      )}

      {/* Sync Progress Indicator */}
      {showSyncIndicator && (
        <SyncIndicator
          status={syncStatus}
          progress={syncProgress}
          error={syncError}
          onSync={handleStartSync}
          onDismiss={handleDismissSync}
          labels={{
            title: t("dashboard.sync.title"),
            description: t("dashboard.sync.description"),
            syncButton: t("dashboard.sync.syncButton"),
            syncing: t("dashboard.sync.syncing"),
            done: t("dashboard.sync.done"),
            error: t("dashboard.sync.error"),
            dismiss: t("dashboard.sync.dismiss"),
            downloading: t("dashboard.sync.downloading"),
          }}
        />
      )}

      {previewImages.length > 0 && (
        <div
          className={styles.previewOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setPreviewImages([]);
            setPreviewIndex(0);
          }}
        >
          <div
            className={styles.previewContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.previewClose}
              aria-label={t("dashboard.result.closePreview")}
              onClick={() => {
                setPreviewImages([]);
                setPreviewIndex(0);
              }}
            >
              ×
            </button>

            {/* 上一张按钮 */}
            {previewImages.length > 1 && (
              <button
                type="button"
                className={styles.previewPrev}
                aria-label={t("dashboard.result.prevImage")}
                onClick={() => setPreviewIndex((prev) => (prev > 0 ? prev - 1 : previewImages.length - 1))}
              >
                ‹
              </button>
            )}

            <img
              src={previewImages[previewIndex]?.url}
              alt={previewImages[previewIndex]?.alt}
              className={styles.previewImage}
            />

            {/* 下一张按钮 */}
            {previewImages.length > 1 && (
              <button
                type="button"
                className={styles.previewNext}
                aria-label={t("dashboard.result.nextImage")}
                onClick={() => setPreviewIndex((prev) => (prev < previewImages.length - 1 ? prev + 1 : 0))}
              >
                ›
              </button>
            )}

            {/* 图片计数器 */}
            {previewImages.length > 1 && (
              <div className={styles.previewCounter}>
                {previewIndex + 1} / {previewImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default Dashboard;
