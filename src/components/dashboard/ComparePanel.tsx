"use client";

import React from "react";
import styles from "../Dashboard.module.css";
import compareStyles from "./ComparePanel.module.css";
import { useI18n } from "@/components/I18nProvider";
import {
  modelOptions,
  ratioOptions,
  resolutionOptions,
  type ModelValue,
  type MaybeModelValue,
  type RatioValue,
  type UploadedImage,
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

const SETTINGS_KEY = "nano_banana_compare_settings_v1";

type CompareModelResult = {
  id: string;
  url: string;
  model: ModelValue;
  modelLabel: string;
  index: number;
};

type ComparePanelProps = {
  localizedModelOptions: LocalizedModelOption[];
  resolution: string;
  ensureAuthenticatedWithCredits: (
    requiredCredits: number,
    onError: (message: string) => void
  ) => boolean;
  setShowTemplates: (show: boolean) => void;
  setTemplateTarget: (target: "generate" | "batch" | "batch-multi" | "compare") => void;
  setIsLoginModalOpen: (open: boolean) => void;
  openPreview: (images: { url: string; alt: string }[], index: number) => void;
  onImageHistoryAdd: (item: ImageHistoryItem) => void;
  persistHistorySource: (id: string, url: string) => Promise<void>;
  trySaveToLocalFolder: (url: string, fileName: string) => Promise<{
    fileName: string;
    savedDirName: string | null;
    savedVia: "fs";
  } | null>;
  activeModel: LocalizedModelOption;
};

export const ComparePanel = ({
  localizedModelOptions,
  ensureAuthenticatedWithCredits,
  setShowTemplates,
  setTemplateTarget,
  setIsLoginModalOpen,
  openPreview,
  onImageHistoryAdd,
  persistHistorySource,
  trySaveToLocalFolder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolution: _resolution,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activeModel: _activeModel,
}: ComparePanelProps) => {
  const { t } = useI18n();

  const [compareLeftModel, setCompareLeftModel] = React.useState<MaybeModelValue>(
    modelOptions[0].value
  );
  const [compareRightModel, setCompareRightModel] = React.useState<MaybeModelValue>(
    modelOptions[1].value
  );
  const [comparePrompt, setComparePrompt] = React.useState("");
  const [compareRatio, setCompareRatio] = React.useState<RatioValue>(ratioOptions[0].value);
  const [compareResolution, setCompareResolution] = React.useState("2K");
  const [compareCount, setCompareCount] = React.useState("1");
  const [compareReferenceImages, setCompareReferenceImages] = React.useState<
    UploadedImage[]
  >([]);

  // 分开存储两个模型的结果
  const [leftModelResults, setLeftModelResults] = React.useState<CompareModelResult[]>([]);
  const [rightModelResults, setRightModelResults] = React.useState<CompareModelResult[]>([]);

  const [isComparingLeft, setIsComparingLeft] = React.useState(false);
  const [isComparingRight, setIsComparingRight] = React.useState(false);
  const [compareError, setCompareError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [currentPrompt, setCurrentPrompt] = React.useState("");
  const [settingsLoaded, setSettingsLoaded] = React.useState(false);

  // 进度状态
  const [leftProgress, setLeftProgress] = React.useState(0);
  const [rightProgress, setRightProgress] = React.useState(0);
  const [leftProgressStage, setLeftProgressStage] = React.useState("");
  const [rightProgressStage, setRightProgressStage] = React.useState("");

  const compareReferenceInputRef = React.useRef<HTMLInputElement | null>(null);
  const leftProgressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const rightProgressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // 加载保存的设置
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.leftModel) setCompareLeftModel(parsed.leftModel);
        if (parsed.rightModel) setCompareRightModel(parsed.rightModel);
        if (parsed.ratio) setCompareRatio(parsed.ratio);
        if (parsed.resolution) setCompareResolution(parsed.resolution);
        if (parsed.count) setCompareCount(parsed.count);
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
        leftModel: compareLeftModel,
        rightModel: compareRightModel,
        ratio: compareRatio,
        resolution: compareResolution,
        count: compareCount,
      }));
    } catch {
      // ignore
    }
  }, [compareLeftModel, compareRightModel, compareRatio, compareResolution, compareCount, settingsLoaded]);

  // 清理进度定时器
  React.useEffect(() => {
    return () => {
      if (leftProgressIntervalRef.current) clearInterval(leftProgressIntervalRef.current);
      if (rightProgressIntervalRef.current) clearInterval(rightProgressIntervalRef.current);
    };
  }, []);

  // 获取两个模型共同支持的分辨率选项
  const getCommonResolutions = React.useCallback(() => {
    if (!compareLeftModel || !compareRightModel) return ["2K", "1K"];
    const leftRes = resolutionOptions[compareLeftModel] || ["2K", "1K"];
    const rightRes = resolutionOptions[compareRightModel] || ["2K", "1K"];
    return leftRes.filter((r) => rightRes.includes(r));
  }, [compareLeftModel, compareRightModel]);

  // 当模型变化时，更新分辨率选项
  React.useEffect(() => {
    const commonRes = getCommonResolutions();
    if (!commonRes.includes(compareResolution)) {
      setCompareResolution(commonRes[0] || "2K");
    }
  }, [compareLeftModel, compareRightModel, getCommonResolutions, compareResolution]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    handleDropUtil(event, setCompareReferenceImages, setIsDragging);
  };

  // 根据进度百分比获取阶段文字
  // 当没有参考图时（text-to-image），跳过上传和处理阶段
  const getProgressStage = (percent: number, hasReferenceImages: boolean = false): string => {
    if (percent < 10) return t("dashboard.generate.progressPreparing");
    if (hasReferenceImages) {
      if (percent < 25) return t("dashboard.generate.progressUploading");
      if (percent < 45) return t("dashboard.generate.progressProcessing");
    }
    if (percent < 70) return t("dashboard.generate.progressGenerating");
    if (percent < 90) return t("dashboard.generate.progressEnhancing");
    if (percent < 100) return t("dashboard.generate.progressFinalizing");
    return t("dashboard.generate.progressComplete");
  };

  // 启动模拟进度
  const startSimulatedProgress = (
    setProgress: React.Dispatch<React.SetStateAction<number>>,
    setStage: React.Dispatch<React.SetStateAction<string>>,
    intervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
    targetPercent: number
  ) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 2 + 0.5;
        const newValue = Math.min(prev + increment, targetPercent);
        setStage(getProgressStage(newValue, compareReferenceImages.length > 0));
        if (newValue >= targetPercent) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
        return newValue;
      });
    }, 300);
  };

  const handleCompare = () => {
    const isComparing = isComparingLeft || isComparingRight;
    if (isComparing || !compareLeftModel || !compareRightModel) return;

    const targetPrompt = comparePrompt || t("dashboard.templatePrompts.compare");
    const leftModel = compareLeftModel as ModelValue;
    const rightModel = compareRightModel as ModelValue;
    const count = Math.max(1, Math.min(4, parseInt(compareCount, 10) || 1));

    const leftCost =
      (modelOptions.find((m) => m.value === leftModel)?.creditsPerImage ?? 2) * count;
    const rightCost =
      (modelOptions.find((m) => m.value === rightModel)?.creditsPerImage ?? 2) * count;

    if (!ensureAuthenticatedWithCredits(leftCost + rightCost, (m) => setCompareError(m))) {
      return;
    }

    const imageSize = mapResolutionToImageSize(compareResolution);

    // 清空之前的结果和进度
    setLeftModelResults([]);
    setRightModelResults([]);
    setCompareError(null);
    setCurrentPrompt(targetPrompt);
    setLeftProgress(2);
    setRightProgress(2);
    setLeftProgressStage(getProgressStage(2, compareReferenceImages.length > 0));
    setRightProgressStage(getProgressStage(2, compareReferenceImages.length > 0));

    const generateForModel = async (
      modelValue: ModelValue,
      setResults: React.Dispatch<React.SetStateAction<CompareModelResult[]>>,
      setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
      setProgress: React.Dispatch<React.SetStateAction<number>>,
      setStage: React.Dispatch<React.SetStateAction<string>>,
      intervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
      modelLabel: string,
      cost: number
    ) => {
      setIsGenerating(true);

      // 启动模拟进度
      startSimulatedProgress(setProgress, setStage, intervalRef, 30);

      const encodedRefs = await encodeReferenceImages(compareReferenceImages);

      // 上传完参考图后，目标进度提升到 45%
      startSimulatedProgress(setProgress, setStage, intervalRef, 45);

      for (let i = 0; i < count; i++) {
        // 每张图的进度目标
        const targetProgress = 45 + ((i + 1) / count) * 45;
        startSimulatedProgress(setProgress, setStage, intervalRef, Math.min(targetProgress - 5, 90));

        try {
          const response = await fetch("/api/image/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: modelValue,
              prompt: targetPrompt,
              aspectRatio: compareRatio,
              imageSize,
              referenceImages: encodedRefs,
            }),
          });

          if (response.status === 401) {
            setIsLoginModalOpen(true);
            throw new Error(t("dashboard.generate.loginRequired"));
          }
          if (response.status === 402) {
            throw new Error(t("dashboard.generate.insufficientCreditsShort"));
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

          if (!url) throw new Error("No image returned from API");

          const newResult: CompareModelResult = {
            id: `compare-${modelValue}-${Date.now()}-${i}`,
            url,
            model: modelValue,
            modelLabel,
            index: i,
          };

          // 立即添加结果，实现渐进式显示
          setResults((prev) => [...prev, newResult]);

          // 更新进度
          if (intervalRef.current) clearInterval(intervalRef.current);
          setProgress(Math.min(targetProgress, 95));
          setStage(getProgressStage(Math.min(targetProgress, 95), compareReferenceImages.length > 0));

          // 保存到历史记录 - 使用 try-catch 确保不会因为缩略图失败而跳过保存
          try {
            const thumbnailDataUrl = await createThumbnailDataUrl(url);
            const uniqueSuffix = Math.random().toString(36).slice(2, 8);
            const historyId = `img-${Date.now()}-${modelValue}-${i}-${uniqueSuffix}`;
            const suggestedName = `nano-banana-${modelValue}-${Date.now()}-${i}.png`;
            const saved = await trySaveToLocalFolder(url, suggestedName);
            void persistHistorySource(historyId, url);
            const perImageCost = cost / count;

            // 即使没有缩略图也保存历史记录
            onImageHistoryAdd({
              id: historyId,
              createdAt: Date.now(),
              model: modelValue,
              prompt: targetPrompt,
              aspectRatio: compareRatio,
              imageSize,
              costCredits: perImageCost,
              thumbnailDataUrl: thumbnailDataUrl || url, // 如果没有缩略图，使用原图
              imageUrl: data.imageUrl,
              fileName: saved?.fileName,
              savedDirName: saved?.savedDirName ?? undefined,
              savedVia: saved?.savedVia,
            });
          } catch (historyError) {
            console.error("Failed to save to history:", historyError);
            // 继续执行，不影响图片生成
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : t("dashboard.compare.failed");
          setCompareError(message);
          break;
        }
      }

      // 清理进度定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // 平滑完成到 100%
      setProgress(100);
      setStage(getProgressStage(100, compareReferenceImages.length > 0));
      setTimeout(() => {
        setProgress(0);
        setStage("");
      }, 800);

      setIsGenerating(false);
    };

    // 并行生成两个模型的图片
    const leftLabel = localizedModelOptions.find((m) => m.value === leftModel)?.label || leftModel;
    const rightLabel = localizedModelOptions.find((m) => m.value === rightModel)?.label || rightModel;

    generateForModel(
      leftModel,
      setLeftModelResults,
      setIsComparingLeft,
      setLeftProgress,
      setLeftProgressStage,
      leftProgressIntervalRef,
      leftLabel,
      leftCost
    );
    generateForModel(
      rightModel,
      setRightModelResults,
      setIsComparingRight,
      setRightProgress,
      setRightProgressStage,
      rightProgressIntervalRef,
      rightLabel,
      rightCost
    );
  };

  const handleClear = () => {
    setComparePrompt("");
    setCompareReferenceImages([]);
    setLeftModelResults([]);
    setRightModelResults([]);
    setCompareError(null);
    setCurrentPrompt("");
    setLeftProgress(0);
    setRightProgress(0);
    setLeftProgressStage("");
    setRightProgressStage("");
  };

  // 准备预览图片列表 - 左右模型的所有图片
  const getAllPreviewImages = () => {
    const leftImages = leftModelResults.map((r) => ({
      url: r.url,
      alt: `${r.modelLabel} #${r.index + 1}`,
    }));
    const rightImages = rightModelResults.map((r) => ({
      url: r.url,
      alt: `${r.modelLabel} #${r.index + 1}`,
    }));
    return [...leftImages, ...rightImages];
  };

  const renderModelResults = (
    results: CompareModelResult[],
    isGenerating: boolean,
    modelLabel: string,
    progress: number,
    progressStage: string,
    startIndex: number = 0
  ) => {
    const allImages = getAllPreviewImages();

    return (
      <>
        {results.length === 0 && !isGenerating ? (
          <div className={compareStyles.emptyResult}>
            <div className={compareStyles.emptyIcon}>🖼️</div>
            <p className={compareStyles.emptyText}>{t("dashboard.compare.empty")}</p>
          </div>
        ) : (
          <div className={compareStyles.imageGrid}>
            {results.map((result) => {
              const previewIndex = startIndex + result.index;
              return (
                <div
                  key={result.id}
                  className={compareStyles.imageCard}
                  onClick={() => openPreview(allImages, previewIndex)}
                >
                  <div className={compareStyles.imageFrame}>
                    <img src={result.url} alt={`${modelLabel} #${result.index + 1}`} loading="lazy" />
                  </div>
                  <div className={compareStyles.imageInfo}>
                    <span className={compareStyles.imageIndex}>#{result.index + 1}</span>
                    <button
                      className={compareStyles.downloadIconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(result.url, `${result.id}.png`);
                      }}
                      title={t("dashboard.result.download")}
                    >
                      ⬇
                    </button>
                  </div>
                </div>
              );
            })}
            {isGenerating && results.length === 0 && (
              <div className={compareStyles.generatingState}>
                <div className={compareStyles.spinner} />
                <span className={compareStyles.generatingText}>{t("dashboard.compare.comparing")}</span>
              </div>
            )}
          </div>
        )}

        {/* 进度条 */}
        {(isGenerating || progress > 0) && (
          <div className={compareStyles.progressSection}>
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
      </>
    );
  };

  const isComparing = isComparingLeft || isComparingRight;
  const commonResolutions = getCommonResolutions();

  // 计算总积分消耗
  const count = Math.max(1, Math.min(4, parseInt(compareCount, 10) || 1));
  const leftCost = compareLeftModel
    ? (modelOptions.find((m) => m.value === compareLeftModel)?.creditsPerImage ?? 2) * count
    : 0;
  const rightCost = compareRightModel
    ? (modelOptions.find((m) => m.value === compareRightModel)?.creditsPerImage ?? 2) * count
    : 0;
  const totalCompareCost = leftCost + rightCost;

  const leftLabel = localizedModelOptions.find((m) => m.value === compareLeftModel)?.label || compareLeftModel || t("dashboard.compare.leftModel");
  const rightLabel = localizedModelOptions.find((m) => m.value === compareRightModel)?.label || compareRightModel || t("dashboard.compare.rightModel");

  return (
    <div className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>{t("dashboard.compare.title")}</div>
        <div className={styles.sectionCaption}>{t("dashboard.compare.caption")}</div>
      </div>

      <div className={compareStyles.comparePanel}>
        {/* 左侧控制区域 */}
        <div className={compareStyles.controlColumn}>
          {/* 模型选择 */}
          <div className={compareStyles.modelSelectors}>
            <div className={compareStyles.modelCard}>
              <div className={compareStyles.modelCardLabel}>{t("dashboard.compare.leftModel")}</div>
              <select
                className={compareStyles.modelCardSelect}
                value={compareLeftModel}
                onChange={(e) => setCompareLeftModel(e.target.value as MaybeModelValue)}
              >
                <option value="">{t("dashboard.compare.selectModel")}</option>
                {localizedModelOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={compareStyles.modelCard}>
              <div className={compareStyles.modelCardLabel}>{t("dashboard.compare.rightModel")}</div>
              <select
                className={compareStyles.modelCardSelect}
                value={compareRightModel}
                onChange={(e) => setCompareRightModel(e.target.value as MaybeModelValue)}
              >
                <option value="">{t("dashboard.compare.selectModel")}</option>
                {localizedModelOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 参考图区域 - 在提示词上面 */}
          <div className={compareStyles.referenceSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>{t("dashboard.compare.refsTitle")}</div>
              <div className={styles.sectionCaption}>
                {t("dashboard.compare.refsCaption", { max: REFERENCE_IMAGE_LIMIT })}
              </div>
            </div>
            <div
              className={`${styles.uploadArea} ${
                isDragging ? styles.uploadAreaActive : ""
              } ${compareReferenceImages.length ? styles.uploadAreaFilled : ""}`}
              onClick={() => openFileDialog(compareReferenceInputRef)}
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
                  <div className={styles.uploadTitle}>{t("dashboard.compare.uploadTitle")}</div>
                  <div className={styles.uploadHint}>{t("dashboard.compare.uploadHint")}</div>
                </div>
              </div>
              {compareReferenceImages.length > 0 && (
                <div className={styles.uploadPreviewRow}>
                  {compareReferenceImages.map((img) => (
                    <div key={img.id} className={styles.uploadThumbInline}>
                      <img src={img.url} alt={img.name} />
                      <button
                        className={styles.removeInlineBtn}
                        aria-label={t("dashboard.common.removeImage")}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id, setCompareReferenceImages);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {compareReferenceImages.length < REFERENCE_IMAGE_LIMIT && (
                    <button
                      className={styles.uploadAdd}
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileDialog(compareReferenceInputRef);
                      }}
                    >
                      +
                    </button>
                  )}
                </div>
              )}
              <input
                ref={compareReferenceInputRef}
                type="file"
                className={styles.hiddenInput}
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.currentTarget.files || []);
                  if (e.currentTarget) e.currentTarget.value = "";
                  handleImageUploadFiles(
                    files,
                    setCompareReferenceImages,
                    REFERENCE_IMAGE_LIMIT
                  );
                }}
              />
            </div>
          </div>

          {/* 提示词区域 */}
          <div className={styles.inputGroup}>
            <div className={styles.sectionHeader}>
              <label className={styles.label}>{t("dashboard.compare.prompt")}</label>
              <button
                className={styles.linkBtn}
                onClick={() => {
                  setTemplateTarget("compare");
                  setShowTemplates(true);
                }}
              >
                {t("dashboard.generate.promptTemplates")}
              </button>
            </div>
            <textarea
              className={styles.textarea}
              rows={3}
              value={comparePrompt}
              placeholder={t("dashboard.templatePrompts.compare")}
              onChange={(e) => setComparePrompt(e.target.value)}
            />
          </div>

          {/* 设置区域：比例、分辨率、生成数量 */}
          <div className={compareStyles.settingsRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.compare.size")}</label>
              <select
                className={styles.select}
                value={compareRatio}
                onChange={(e) => setCompareRatio(e.target.value as RatioValue)}
              >
                {ratioOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(`dashboard.ratios.${opt.value}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.generate.resolution")}</label>
              <select
                className={styles.select}
                value={compareResolution}
                onChange={(e) => setCompareResolution(e.target.value)}
              >
                {commonResolutions.map((res) => (
                  <option key={res} value={res}>
                    {res}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.generate.count")}</label>
              <select
                className={styles.select}
                value={compareCount}
                onChange={(e) => setCompareCount(e.target.value)}
              >
                <option value="1">{t("dashboard.generate.countItem", { n: 1 })}</option>
                <option value="2">{t("dashboard.generate.countItem", { n: 2 })}</option>
                <option value="3">{t("dashboard.generate.countItem", { n: 3 })}</option>
                <option value="4">{t("dashboard.generate.countItem", { n: 4 })}</option>
              </select>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className={styles.promptActions}>
            <button className={`${styles.ghostBtn} ${styles.clearBtn}`} onClick={handleClear}>
              {t("dashboard.compare.clear")}
            </button>
            <button
              className={styles.primaryBtn}
              onClick={handleCompare}
              disabled={isComparing || !compareLeftModel || !compareRightModel}
            >
              {isComparing
                ? t("dashboard.compare.comparing")
                : t("dashboard.compare.startWithCost", { credits: totalCompareCost })}
            </button>
          </div>

          {compareError && <div className={styles.errorNote}>⚠️ {compareError}</div>}
        </div>

        {/* 右侧结果区域 */}
        <div className={compareStyles.resultsColumn}>
          <div className={compareStyles.resultsContainer}>
            {/* 提示词信息 */}
            {currentPrompt && (
              <div className={compareStyles.resultMeta}>
                <div className={compareStyles.resultMetaText}>
                  📝 {currentPrompt}
                </div>
              </div>
            )}

            {/* 上方：左侧模型结果 */}
            <div className={compareStyles.modelResultSection}>
              <div className={compareStyles.modelResultHeader}>
                <div className={compareStyles.modelResultTitle}>
                  <span className={compareStyles.modelBadge}>A</span>
                  {leftLabel}
                </div>
                {leftModelResults.length > 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {leftModelResults.length} {t("dashboard.batchNew.images")}
                  </span>
                )}
              </div>
              {renderModelResults(leftModelResults, isComparingLeft, leftLabel, leftProgress, leftProgressStage, 0)}
            </div>

            {/* 下方：右侧模型结果 */}
            <div className={compareStyles.modelResultSection}>
              <div className={compareStyles.modelResultHeader}>
                <div className={compareStyles.modelResultTitle}>
                  <span className={`${compareStyles.modelBadge} ${compareStyles.modelBadgeAlt}`}>B</span>
                  {rightLabel}
                </div>
                {rightModelResults.length > 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {rightModelResults.length} {t("dashboard.batchNew.images")}
                  </span>
                )}
              </div>
              {renderModelResults(rightModelResults, isComparingRight, rightLabel, rightProgress, rightProgressStage, leftModelResults.length)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePanel;
