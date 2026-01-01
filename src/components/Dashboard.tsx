"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
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
  type LocalizedModelOption,
} from "./dashboard/types";
import { useImageHistory, type ImageHistoryItem } from "@/hooks/useImageHistory";

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
              externalGetSourceUrl={getSourceUrl}
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
