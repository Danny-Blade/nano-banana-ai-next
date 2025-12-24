"use client";

import React from "react";
import styles from "../Dashboard.module.css";
import { useI18n } from "@/components/I18nProvider";
import {
  modelOptions,
  ratioOptions,
  resolutionOptions,
  type ModelValue,
  type RatioValue,
  type UploadedImage,
  type GeneratedResult,
  type LocalizedModelOption,
  type ImageHistoryItem,
} from "./types";
import {
  REFERENCE_IMAGE_LIMIT,
  openFileDialog,
  handleImageUploadFiles,
  removeImage,
  handleDrop as handleDropUtil,
  downloadImage,
  encodeReferenceImages,
  createThumbnailDataUrl,
  mapResolutionToImageSize,
} from "./utils";

const SETTINGS_KEY = "nano_banana_editor_settings_v1";

type ImageEditorPanelProps = {
  localizedModelOptions: LocalizedModelOption[];
  selectedModel: ModelValue;
  setSelectedModel: (model: ModelValue) => void;
  setShowModelPicker: (show: boolean) => void;
  setShowTemplates: (show: boolean) => void;
  setTemplateTarget: (target: "generate" | "batch" | "batch-multi" | "compare") => void;
  onImageHistoryAdd: (item: ImageHistoryItem) => void;
  persistHistorySource: (id: string, url: string) => Promise<void>;
  trySaveToLocalFolder: (url: string, fileName: string) => Promise<{
    fileName: string;
    savedDirName: string | null;
    savedVia: "fs";
  } | null>;
  ensureAuthenticatedWithCredits: (
    requiredCredits: number,
    onError: (message: string) => void
  ) => boolean;
  refreshSession: () => Promise<void>;
  openPreview: (url: string, alt: string) => void;
};

type ResultTab = "result" | "original" | "compare";

export const ImageEditorPanel = ({
  localizedModelOptions,
  selectedModel,
  setSelectedModel,
  setShowModelPicker,
  setShowTemplates,
  setTemplateTarget,
  onImageHistoryAdd,
  persistHistorySource,
  trySaveToLocalFolder,
  ensureAuthenticatedWithCredits,
  refreshSession,
  openPreview,
}: ImageEditorPanelProps) => {
  const { t } = useI18n();

  const [resultTab, setResultTab] = React.useState<ResultTab>("result");
  const [resolution, setResolution] = React.useState(
    resolutionOptions[selectedModel][0]
  );
  const [ratio, setRatio] = React.useState<RatioValue>(ratioOptions[0].value);
  const [generatePrompt, setGeneratePrompt] = React.useState("");
  const [generateCount, setGenerateCount] = React.useState("1");
  const [referenceImages, setReferenceImages] = React.useState<UploadedImage[]>([]);
  const [results, setResults] = React.useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [progressStage, setProgressStage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [activeResultIndex, setActiveResultIndex] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [settingsLoaded, setSettingsLoaded] = React.useState(false);

  const referenceInputRef = React.useRef<HTMLInputElement | null>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // 加载保存的设置
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ratio) setRatio(parsed.ratio);
        if (parsed.generateCount) setGenerateCount(parsed.generateCount);
        if (parsed.resolution) setResolution(parsed.resolution);
        if (parsed.selectedModel && parsed.selectedModel !== selectedModel) {
          setSelectedModel(parsed.selectedModel);
        }
      }
    } catch {
      // ignore
    }
    setSettingsLoaded(true);
  }, []);

  // 保存设置
  React.useEffect(() => {
    if (!settingsLoaded) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        ratio,
        generateCount,
        resolution,
        selectedModel,
      }));
    } catch {
      // ignore
    }
  }, [ratio, generateCount, resolution, selectedModel, settingsLoaded]);

  React.useEffect(() => {
    const defaults = resolutionOptions[selectedModel] || ["Auto"];
    if (!settingsLoaded) return;
    setResolution(defaults[0]);
  }, [selectedModel, settingsLoaded]);

  // 清理进度定时器
  React.useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    setActiveResultIndex(0);
  }, [results.length]);

  const currentModel = localizedModelOptions.find((m) => m.value === selectedModel);
  const activeModel = currentModel || localizedModelOptions[0];
  const estimatedGenerateCost =
    Math.max(1, Math.min(4, parseInt(generateCount, 10) || 1)) *
    activeModel.creditsPerImage;

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    handleDropUtil(event, setReferenceImages, setIsDragging);
  };

  // 根据进度百分比获取阶段文字
  const getProgressStage = (percent: number): string => {
    if (percent < 10) return t("dashboard.generate.progressPreparing");
    if (percent < 25) return t("dashboard.generate.progressUploading");
    if (percent < 45) return t("dashboard.generate.progressProcessing");
    if (percent < 70) return t("dashboard.generate.progressGenerating");
    if (percent < 90) return t("dashboard.generate.progressEnhancing");
    if (percent < 100) return t("dashboard.generate.progressFinalizing");
    return t("dashboard.generate.progressComplete");
  };

  // 启动模拟进度
  const startSimulatedProgress = (targetPercent: number) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 2 + 0.5; // 0.5-2.5% 随机增量
        const newValue = Math.min(prev + increment, targetPercent);
        setProgressStage(getProgressStage(newValue));
        if (newValue >= targetPercent) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }
        return newValue;
      });
    }, 300);
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    const targetPrompt = generatePrompt || t("dashboard.templatePrompts.generate");
    if (!targetPrompt.trim()) {
      setError(t("dashboard.generate.promptRequired"));
      return;
    }

    const imageSize = mapResolutionToImageSize(resolution);
    const count = Math.max(1, Math.min(4, parseInt(generateCount, 10) || 1));
    const requiredCredits = count * activeModel.creditsPerImage;
    if (!ensureAuthenticatedWithCredits(requiredCredits, (m) => setError(m))) return;

    const run = async () => {
      setIsGenerating(true);
      setError(null);
      setResultTab("result");
      setProgress(2);
      setProgressStage(getProgressStage(2));

      // 启动模拟进度，初始目标 30%
      startSimulatedProgress(30);

      const generated: GeneratedResult[] = [];
      const encodedRefs = await encodeReferenceImages(referenceImages);

      // 上传完参考图后，目标进度提升到 45%
      startSimulatedProgress(45);

      for (let i = 0; i < count; i += 1) {
        // 每张图的进度目标：45% + ((i+1)/count)*45%
        const targetProgress = 45 + ((i + 1) / count) * 45;

        // 开始生成前，更新进度目标
        startSimulatedProgress(Math.min(targetProgress - 5, 90));

        try {
          const response = await fetch("/api/image/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: selectedModel,
              prompt: targetPrompt,
              aspectRatio: ratio,
              imageSize,
              referenceImages: encodedRefs,
            }),
          });

          if (response.status === 401) {
            setError(t("dashboard.generate.loginRequired"));
            break;
          }
          if (response.status === 402) {
            setError(t("dashboard.generate.insufficientCreditsShort"));
            break;
          }
          if (!response.ok) {
            const info: unknown = await response.json().catch(() => ({}));
            let err: string | undefined;
            if (info && typeof info === "object") {
              const infoRecord = info as Record<string, unknown>;
              const e = infoRecord.error;
              if (typeof e === "string") err = e;
              else if (e && typeof e === "object") {
                const eRecord = e as Record<string, unknown>;
                if (typeof eRecord.message === "string") err = eRecord.message;
                else err = JSON.stringify(eRecord);
              }
            }
            throw new Error(err || response.statusText);
          }

          const data = (await response.json()) as {
            imageData?: string;
            mimeType?: string;
            imageUrl?: string;
          };

          const url =
            data.imageUrl ||
            (data.imageData
              ? `data:${data.mimeType || "image/png"};base64,${data.imageData}`
              : null);

          if (!url) {
            throw new Error("No image returned from API");
          }

          const thumbnailDataUrl = await createThumbnailDataUrl(url);
          if (thumbnailDataUrl) {
            const historyId = `img-${Date.now()}-${i}`;
            const suggestedName = `nano-banana-${selectedModel}-${Date.now()}-${i}.png`;
            const saved = await trySaveToLocalFolder(url, suggestedName);
            void persistHistorySource(historyId, url);
            onImageHistoryAdd({
              id: historyId,
              createdAt: Date.now(),
              model: selectedModel,
              prompt: targetPrompt,
              aspectRatio: ratio,
              imageSize,
              costCredits: activeModel.creditsPerImage,
              thumbnailDataUrl,
              imageUrl: data.imageUrl,
              fileName: saved?.fileName,
              savedDirName: saved?.savedDirName ?? undefined,
              savedVia: saved?.savedVia,
            });
          }

          generated.push({
            id: `gen-${Date.now()}-${i}`,
            url,
            prompt: targetPrompt,
            model: activeModel.label,
            ratio,
            resolution: imageSize,
          });

          // 完成这张图后，立即更新进度
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setProgress(Math.min(targetProgress, 95));
          setProgressStage(getProgressStage(Math.min(targetProgress, 95)));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : t("dashboard.generate.generationFailed");
          setError(message);
          break;
        }
      }

      // 清理进度定时器
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (generated.length) {
        setResults(generated);
      }

      if (generated.length) {
        try {
          await refreshSession();
        } catch {
          // ignore
        }
      }

      // 平滑完成到 100%
      setProgress(100);
      setProgressStage(getProgressStage(100));
      setTimeout(() => {
        setProgress(0);
        setProgressStage("");
      }, 800);
      setIsGenerating(false);
    };

    run();
  };

  const handleClearGenerate = () => {
    setGeneratePrompt("");
    setReferenceImages([]);
    setResults([]);
    setProgress(0);
    setError(null);
  };

  const renderGeneratedResultCard = (item: GeneratedResult, large = false) => (
    <div
      key={item.id}
      className={`${styles.resultCard} ${large ? styles.resultCardLarge : ""}`}
    >
      <div
        className={`${styles.resultImageFrame} ${
          large ? styles.resultImageFrameLarge : ""
        }`}
      >
        <img
          src={item.url}
          alt={item.prompt}
          loading="lazy"
          onClick={() => openPreview(item.url, item.prompt)}
        />
      </div>
      <div className={styles.resultMeta}>
        <div className={styles.resultTitle}>{item.prompt}</div>
        <div className={styles.resultInfo}>
          {item.model} · {item.ratio} · {item.resolution}
        </div>
      </div>
      <div className={styles.resultActions}>
        <button
          className={styles.ghostBtn}
          onClick={() => downloadImage(item.url, `${item.id}.png`)}
        >
          {t("dashboard.result.download")}
        </button>
      </div>
    </div>
  );

  const renderUploadedResultCard = (img: UploadedImage) => (
    <div key={img.id} className={styles.resultCard}>
      <div className={styles.resultImageFrame}>
        <img
          src={img.url}
          alt={img.name}
          loading="lazy"
          onClick={() => openPreview(img.url, img.name)}
        />
      </div>
      <div className={styles.resultMeta}>
        <div className={styles.resultTitle}>{img.name}</div>
        <div className={styles.resultInfo}>{img.size}</div>
      </div>
    </div>
  );

  const renderSimpleImageCard = (url: string, alt: string, key?: string) => (
    <div key={key || url} className={styles.resultCard}>
      <div className={styles.resultImageFrame}>
        <img src={url} alt={alt} loading="lazy" onClick={() => openPreview(url, alt)} />
      </div>
    </div>
  );

  return (
    <div className={styles.panel}>
      <div className={`${styles.panelGrid} ${styles.generateGrid}`}>
        <div className={styles.column}>
          <div className={styles.modelBar}>
            <div>
              <div className={styles.modelLabel}>{t("dashboard.model.selected")}</div>
              <div className={styles.modelCurrent}>
                <span className={styles.modelName}>{activeModel.label}</span>
                <span className={styles.modelPoints}>{activeModel.points}</span>
              </div>
              <div className={styles.modelDesc}>{activeModel.description}</div>
            </div>
            <button
              className={styles.changeModelBtn}
              type="button"
              onClick={() => setShowModelPicker(true)}
            >
              {t("dashboard.model.change")}
            </button>
          </div>

          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>{t("dashboard.generate.title")}</div>
              <div className={styles.sectionCaption}>
                {t("dashboard.generate.caption", { max: REFERENCE_IMAGE_LIMIT })}
              </div>
            </div>
          </div>
          <div
            className={`${styles.uploadArea} ${
              isDragging ? styles.uploadAreaActive : ""
            } ${referenceImages.length ? styles.uploadAreaFilled : ""}`}
            onClick={() => openFileDialog(referenceInputRef)}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className={styles.uploadHeader}>
              <div className={styles.uploadIcon}>📁</div>
              <div>
                <div className={styles.uploadTitle}>
                  {t("dashboard.generate.uploadTitle")}
                </div>
                <div className={styles.uploadHint}>
                  {t("dashboard.generate.uploadHint", { max: REFERENCE_IMAGE_LIMIT })}
                </div>
              </div>
            </div>
            {referenceImages.length > 0 && (
              <div className={styles.uploadPreviewRow}>
                {referenceImages.map((img) => (
                  <div key={img.id} className={styles.uploadThumbInline}>
                    <img src={img.url} alt={img.name} />
                    <button
                      className={styles.removeInlineBtn}
                      aria-label={t("dashboard.common.removeImage")}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(img.id, setReferenceImages);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {referenceImages.length < REFERENCE_IMAGE_LIMIT && (
                  <button
                    className={styles.uploadAdd}
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileDialog(referenceInputRef);
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            )}
            <input
              ref={referenceInputRef}
              type="file"
              className={styles.hiddenInput}
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.currentTarget.files || []);
                if (e.currentTarget) e.currentTarget.value = "";
                handleImageUploadFiles(
                  files,
                  setReferenceImages,
                  REFERENCE_IMAGE_LIMIT
                );
              }}
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.sectionHeader}>
              <label className={styles.label}>{t("dashboard.generate.prompt")}</label>
              <button
                className={styles.linkBtn}
                onClick={() => {
                  setTemplateTarget("generate");
                  setShowTemplates(true);
                }}
              >
                {t("dashboard.generate.promptTemplates")}
              </button>
            </div>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder={t("dashboard.templatePrompts.generate")}
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
            />
            <div className={styles.promptActions}>
              <button
                className={`${styles.ghostBtn} ${styles.clearBtn}`}
                onClick={handleClearGenerate}
              >
                {t("dashboard.generate.clear")}
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating
                  ? t("dashboard.generate.generating")
                  : t("dashboard.generate.startWithCost", {
                      points: estimatedGenerateCost,
                    })}
              </button>
            </div>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.generate.ratio")}</label>
              <select
                className={styles.select}
                value={ratio}
                onChange={(e) => setRatio(e.target.value as RatioValue)}
              >
                {ratioOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(`dashboard.ratios.${opt.value}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.generate.count")}</label>
              <select
                className={styles.select}
                value={generateCount}
                onChange={(e) => setGenerateCount(e.target.value)}
              >
                <option value="1">{t("dashboard.generate.countItem", { n: 1 })}</option>
                <option value="2">{t("dashboard.generate.countItem", { n: 2 })}</option>
                <option value="3">{t("dashboard.generate.countItem", { n: 3 })}</option>
                <option value="4">{t("dashboard.generate.countItem", { n: 4 })}</option>
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t("dashboard.generate.resolution")}</label>
            <select
              className={styles.select}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            >
              {(resolutionOptions[selectedModel] || []).map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
            <div className={styles.inputNote}>{activeModel.description}</div>
          </div>
        </div>

        <div className={`${styles.column} ${styles.resultColumn}`}>
          <div className={styles.resultBox}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>{t("dashboard.result.title")}</div>
              <div className={styles.headerActions}>
                <div className={styles.tabRow}>
                  {["result", "original", "compare"].map((key) => (
                    <button
                      key={key}
                      className={`${styles.subTab} ${
                        resultTab === key ? styles.active : ""
                      }`}
                      onClick={() => setResultTab(key as ResultTab)}
                    >
                      {key === "result" && t("dashboard.result.tabResult")}
                      {key === "original" && t("dashboard.result.tabOriginal")}
                      {key === "compare" && t("dashboard.result.tabCompare")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.resultArea}>
              {resultTab === "result" &&
                (results.length ? (
                  <>
                    <div className={styles.singleResult}>
                      {renderGeneratedResultCard(results[activeResultIndex]!, true)}
                    </div>
                    {results.length > 1 && (
                      <div className={styles.singleNav}>
                        <button
                          type="button"
                          className={styles.singleNavBtn}
                          disabled={activeResultIndex === 0}
                          onClick={() =>
                            setActiveResultIndex((prev) => Math.max(prev - 1, 0))
                          }
                        >
                          ‹
                        </button>
                        <div className={styles.singleNavText}>
                          {activeResultIndex + 1} / {results.length}
                        </div>
                        <button
                          type="button"
                          className={styles.singleNavBtn}
                          disabled={activeResultIndex >= results.length - 1}
                          onClick={() =>
                            setActiveResultIndex((prev) =>
                              Math.min(prev + 1, results.length - 1)
                            )
                          }
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.placeholder}>
                    <div className={styles.placeholderIcon}>🎨</div>
                    <p>{t("dashboard.result.emptyResult")}</p>
                  </div>
                ))}

              {resultTab === "original" &&
                (referenceImages.length ? (
                  <div className={styles.resultGrid}>
                    {referenceImages.map((img) => renderUploadedResultCard(img))}
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <div className={styles.placeholderIcon}>🖼️</div>
                    <p>{t("dashboard.result.emptyOriginal")}</p>
                  </div>
                ))}

              {resultTab === "compare" && (
                <div className={styles.compareGrid}>
                  <div>
                    <div className={styles.sectionCaption}>
                      {t("dashboard.result.tabOriginal")}
                    </div>
                    {referenceImages.length ? (
                      <div className={styles.resultGrid}>
                        {referenceImages.map((img) =>
                          renderSimpleImageCard(img.url, img.name, img.id)
                        )}
                      </div>
                    ) : (
                      <div className={styles.placeholderSmall}>
                        {t("dashboard.result.emptyCompareLeft")}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={styles.sectionCaption}>
                      {t("dashboard.result.tabResult")}
                    </div>
                    {results.length ? (
                      <div className={styles.resultGrid}>
                        {results.map((item) =>
                          renderSimpleImageCard(item.url, item.prompt, item.id)
                        )}
                      </div>
                    ) : (
                      <div className={styles.placeholderSmall}>
                        {t("dashboard.result.emptyCompareRight")}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {error && <div className={styles.errorNote}>⚠️ {error}</div>}
            </div>
          </div>
          {(isGenerating || progress > 0) && (
            <div className={styles.progressBlock}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={styles.progressText}>
                {progressStage && <span className={styles.progressStage}>{progressStage}</span>}
                <span>{progress.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditorPanel;
