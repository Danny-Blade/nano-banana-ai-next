"use client";

import React from "react";
import styles from "../Dashboard.module.css";
import batchStyles from "./BatchPanel.module.css";
import { useI18n } from "@/components/I18nProvider";
import {
  ratioOptions,
  resolutionOptions,
  type RatioValue,
  type UploadedImage,
  type LocalizedModelOption,
  type ModelValue,
  type ImageHistoryItem,
} from "./types";
import {
  downloadImage,
  encodeReferenceImages,
  createThumbnailDataUrl,
  mapResolutionToImageSize,
} from "./utils";

const MAX_PROMPTS = 5;

type PromptCard = {
  id: string;
  prompt: string;
  ratio: RatioValue;
  count: number;
  resolution: string; // 空字符串表示使用全局分辨率
  referenceImage: UploadedImage | null;
};

type BatchResultGroup = {
  promptId: string;
  prompt: string;
  ratio: string;
  resolution: string;
  results: {
    id: string;
    url: string;
    model: string;
  }[];
};

type BatchPanelProps = {
  localizedModelOptions: LocalizedModelOption[];
  selectedModel: ModelValue;
  setShowModelPicker: (show: boolean) => void;
  ensureAuthenticatedWithCredits: (
    requiredCredits: number,
    onError: (message: string) => void
  ) => boolean;
  setShowTemplates: (show: boolean) => void;
  setTemplateTarget: (target: "generate" | "batch" | "batch-multi" | "compare") => void;
  openPreview: (images: { url: string; alt: string }[], index: number) => void;
  onImageHistoryAdd: (item: ImageHistoryItem) => void;
  persistHistorySource: (id: string, url: string) => Promise<void>;
  refreshSession: () => Promise<void>;
};

const createEmptyCard = (): PromptCard => ({
  id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  prompt: "",
  ratio: "1:1",
  count: 1,
  resolution: "", // 空字符串表示使用全局分辨率
  referenceImage: null,
});

export const BatchPanel = ({
  localizedModelOptions,
  selectedModel,
  setShowModelPicker,
  ensureAuthenticatedWithCredits,
  setShowTemplates,
  setTemplateTarget,
  openPreview,
  onImageHistoryAdd,
  persistHistorySource,
  refreshSession,
}: BatchPanelProps) => {
  const { t } = useI18n();

  const [promptCards, setPromptCards] = React.useState<PromptCard[]>([createEmptyCard()]);
  const [resolution, setResolution] = React.useState(resolutionOptions[selectedModel][0]);
  const [resultGroups, setResultGroups] = React.useState<BatchResultGroup[]>([]);
  const [isBatching, setIsBatching] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [progressText, setProgressText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRefs = React.useRef<Map<string, HTMLInputElement>>(new Map());

  const currentModel = localizedModelOptions.find((m) => m.value === selectedModel);
  const activeModel = currentModel || localizedModelOptions[0];

  // 计算总图片数和积分
  const totalImages = promptCards.reduce((sum, card) => sum + card.count, 0);
  const totalCredits = totalImages * activeModel.creditsPerImage;

  // 更新 resolution 当模型改变时
  React.useEffect(() => {
    const defaults = resolutionOptions[selectedModel] || ["Auto"];
    setResolution(defaults[0]);
  }, [selectedModel]);

  const updateCard = (id: string, updates: Partial<PromptCard>) => {
    setPromptCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  const removeCard = (id: string) => {
    if (promptCards.length <= 1) return;
    setPromptCards((prev) => prev.filter((card) => card.id !== id));
  };

  const addCard = () => {
    if (promptCards.length >= MAX_PROMPTS) return;
    setPromptCards((prev) => [...prev, createEmptyCard()]);
  };

  const handleFileUpload = (cardId: string, files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    const sizeKB = (file.size / 1024).toFixed(1);
    const uploaded: UploadedImage = {
      id: `img-${Date.now()}`,
      name: file.name,
      url,
      size: `${sizeKB} KB`,
    };
    updateCard(cardId, { referenceImage: uploaded });
  };

  const clearAll = () => {
    setPromptCards([createEmptyCard()]);
    setResultGroups([]);
    setError(null);
    setProgress(0);
  };

  const handleBatchGenerate = async () => {
    if (isBatching) return;

    // 过滤有效的提示词
    const validCards = promptCards.filter((card) => card.prompt.trim());
    if (validCards.length === 0) {
      setError(t("dashboard.batchNew.noPrompts"));
      return;
    }

    const requiredCredits = validCards.reduce((sum, card) => sum + card.count, 0) * activeModel.creditsPerImage;
    if (!ensureAuthenticatedWithCredits(requiredCredits, (m) => setError(m))) return;

    setIsBatching(true);
    setError(null);
    setResultGroups([]);
    setProgress(0);

    const totalTasks = validCards.reduce((sum, card) => sum + card.count, 0);
    let completedTasks = 0;

    // 初始化所有分组（空结果），这样可以立即显示分组结构
    const initialGroups: BatchResultGroup[] = validCards.map((card) => ({
      promptId: card.id,
      prompt: card.prompt,
      ratio: card.ratio,
      resolution: card.resolution || resolution,
      results: [],
    }));
    setResultGroups(initialGroups);

    // 按提示词分组生成
    for (let cardIndex = 0; cardIndex < validCards.length; cardIndex++) {
      const card = validCards[cardIndex];

      // 编码参考图
      const encodedRefs = card.referenceImage
        ? await encodeReferenceImages([card.referenceImage])
        : [];

      // 使用卡片分辨率，如果没有设置则使用全局分辨率
      const cardResolution = card.resolution || resolution;
      const imageSize = mapResolutionToImageSize(cardResolution);

      // 生成该提示词的所有图片
      for (let i = 0; i < card.count; i++) {
        const MAX_RETRIES = 3;
        let retryCount = 0;
        let success = false;

        while (!success && retryCount < MAX_RETRIES) {
          setProgressText(
            retryCount > 0
              ? t("dashboard.batchNew.progressRetrying", {
                  current: completedTasks + 1,
                  total: totalTasks,
                  retry: retryCount,
                })
              : t("dashboard.batchNew.progressGenerating", {
                  current: completedTasks + 1,
                  total: totalTasks,
                })
          );

          try {
            const response = await fetch("/api/image/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: selectedModel,
                prompt: card.prompt,
                aspectRatio: card.ratio,
                imageSize,
                referenceImages: encodedRefs,
              }),
            });

            if (response.status === 401) {
              setError(t("dashboard.generate.loginRequired"));
              setIsBatching(false);
              return;
            }
            if (response.status === 402) {
              setError(t("dashboard.generate.insufficientCreditsShort"));
              setIsBatching(false);
              return;
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

            const resultId = `batch-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`;
            const newResult = {
              id: resultId,
              url,
              model: activeModel.label,
            };

            // 立即更新 UI，显示新生成的图片
            setResultGroups((prev) =>
              prev.map((group, idx) =>
                idx === cardIndex
                  ? { ...group, results: [...group.results, newResult] }
                  : group
              )
            );

            // 保存到历史记录（异步，不阻塞 UI 更新）
            // 注意：批量生成时不自动保存到本地文件夹，避免权限弹窗打断生成流程
            createThumbnailDataUrl(url).then((thumbnailDataUrl) => {
              if (thumbnailDataUrl) {
                void persistHistorySource(resultId, url);

                onImageHistoryAdd({
                  id: resultId,
                  createdAt: Date.now(),
                  model: selectedModel,
                  prompt: card.prompt,
                  aspectRatio: card.ratio,
                  imageSize,
                  costCredits: activeModel.creditsPerImage,
                  thumbnailDataUrl,
                  imageUrl: data.imageUrl,
                  referenceImageThumbnail: card.referenceImage?.url,
                  referenceImageUrl: card.referenceImage?.url,
                });
              }
            });

            completedTasks++;
            setProgress(Math.round((completedTasks / totalTasks) * 100));
            success = true;

            // 每生成一张图片后立即刷新用户积分
            refreshSession().catch(() => {
              // 忽略刷新失败，不影响生成流程
            });
          } catch (err) {
            retryCount++;
            if (retryCount >= MAX_RETRIES) {
              const message =
                err instanceof Error ? err.message : t("dashboard.generate.generationFailed");
              setError(t("dashboard.batchNew.retryFailed", { error: message }));
              setIsBatching(false);
              return;
            }
            // 等待一段时间后重试（指数退避：1s, 2s, 4s）
            await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
          }
        }
      }
    }

    setProgress(100);
    setProgressText(t("dashboard.batchNew.progressComplete"));
    setIsBatching(false);

    try {
      await refreshSession();
    } catch {
      // ignore
    }

    setTimeout(() => {
      setProgress(0);
      setProgressText("");
    }, 1500);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>{t("dashboard.batchNew.title")}</div>
          <div className={styles.sectionCaption}>{t("dashboard.batchNew.caption")}</div>
        </div>
      </div>

      {/* 模型选择栏 */}
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

      {/* 提示词卡片列表 */}
      <div className={batchStyles.cardList}>
        {promptCards.map((card, index) => (
          <div key={card.id} className={batchStyles.promptCard}>
            <div className={batchStyles.cardHeader}>
              <div className={batchStyles.cardTitle}>
                {t("dashboard.batchNew.promptN", { n: index + 1 })}
              </div>
              {promptCards.length > 1 && (
                <button
                  className={batchStyles.removeCardBtn}
                  onClick={() => removeCard(card.id)}
                  aria-label={t("dashboard.common.removeImage")}
                >
                  ×
                </button>
              )}
            </div>

            <div className={batchStyles.cardContent}>
              {/* 左侧：参考图上传 */}
              <div className={batchStyles.refSection}>
                <div className={batchStyles.refLabel}>{t("dashboard.batchNew.refImage")}</div>
                {card.referenceImage ? (
                  <div className={batchStyles.refPreview}>
                    <img src={card.referenceImage.url} alt={card.referenceImage.name} />
                    <button
                      className={batchStyles.refRemoveBtn}
                      onClick={() => updateCard(card.id, { referenceImage: null })}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    className={batchStyles.refUpload}
                    onClick={() => {
                      const input = fileInputRefs.current.get(card.id);
                      if (input) input.click();
                    }}
                  >
                    <div className={batchStyles.refUploadIcon}>🖼️</div>
                    <div className={batchStyles.refUploadText}>
                      {t("dashboard.batchNew.uploadRef")}
                    </div>
                  </div>
                )}
                <input
                  ref={(el) => {
                    if (el) fileInputRefs.current.set(card.id, el);
                  }}
                  type="file"
                  className={styles.hiddenInput}
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.currentTarget.files || []);
                    if (e.currentTarget) e.currentTarget.value = "";
                    handleFileUpload(card.id, files);
                  }}
                />
              </div>

              {/* 右侧：提示词和设置 */}
              <div className={batchStyles.promptSection}>
                <div className={styles.inputGroup}>
                  <div className={styles.sectionHeader}>
                    <label className={styles.label}>{t("dashboard.batch.prompt")}</label>
                    <button
                      className={styles.linkBtn}
                      onClick={() => {
                        setTemplateTarget("batch");
                        setShowTemplates(true);
                      }}
                    >
                      {t("dashboard.generate.promptTemplates")}
                    </button>
                  </div>
                  <textarea
                    className={`${styles.textarea} ${batchStyles.promptTextarea}`}
                    rows={3}
                    value={card.prompt}
                    placeholder={t("dashboard.templatePrompts.batch")}
                    onChange={(e) => updateCard(card.id, { prompt: e.target.value })}
                  />
                </div>

                <div className={batchStyles.cardSettings}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>{t("dashboard.generate.ratio")}</label>
                    <select
                      className={styles.select}
                      value={card.ratio}
                      onChange={(e) => updateCard(card.id, { ratio: e.target.value as RatioValue })}
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
                      value={card.resolution}
                      onChange={(e) => updateCard(card.id, { resolution: e.target.value })}
                    >
                      <option value="">{t("dashboard.batchNew.useGlobalResolution")}</option>
                      {(resolutionOptions[selectedModel] || []).map((res) => (
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
                      value={card.count}
                      onChange={(e) => updateCard(card.id, { count: parseInt(e.target.value, 10) })}
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {t("dashboard.generate.countItem", { n })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 添加提示词按钮 */}
        {promptCards.length < MAX_PROMPTS && (
          <button className={batchStyles.addCardBtn} onClick={addCard}>
            <span className={batchStyles.addCardIcon}>+</span>
            <span>
              {t("dashboard.batchNew.addPrompt")} ({promptCards.length}/{MAX_PROMPTS})
            </span>
          </button>
        )}
      </div>

      {/* 全局设置和统计 */}
      <div className={batchStyles.globalSection}>
        <div className={batchStyles.globalSettings}>
          <div className={batchStyles.globalTitle}>{t("dashboard.batchNew.globalSettings")}</div>
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
          </div>
        </div>

        <div className={batchStyles.statsBox}>
          <div className={batchStyles.globalTitle}>{t("dashboard.batchNew.stats")}</div>
          <div className={batchStyles.statsRow}>
            <div className={batchStyles.statItem}>
              <div className={batchStyles.statLabel}>{t("dashboard.batchNew.totalImages")}</div>
              <div className={batchStyles.statValue}>{totalImages}</div>
            </div>
            <div className={batchStyles.statItem}>
              <div className={batchStyles.statLabel}>{t("dashboard.batchNew.totalCredits")}</div>
              <div className={batchStyles.statValue}>{totalCredits}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className={batchStyles.actionRow}>
        <button className={styles.ghostBtn} onClick={clearAll}>
          {t("dashboard.batch.clear")}
        </button>
        <button
          className={styles.primaryBtn}
          onClick={handleBatchGenerate}
          disabled={isBatching}
        >
          {isBatching
            ? t("dashboard.generate.generating")
            : t("dashboard.batchNew.startBatch", { credits: totalCredits })}
        </button>
      </div>

      {error && <div className={styles.errorNote}>⚠️ {error}</div>}

      {/* 进度条 */}
      {(isBatching || progress > 0) && (
        <div className={styles.progressBlock}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressText}>
            {progressText && <span className={styles.progressStage}>{progressText}</span>}
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {/* 生成结果 */}
      {resultGroups.length > 0 && (
        <div className={batchStyles.resultsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>{t("dashboard.batch.resultsTitle")}</div>
            <div className={styles.sectionCaption}>{t("dashboard.batchNew.resultsGrouped")}</div>
          </div>

          {resultGroups.map((group, groupIndex) => {
            // 计算当前分组之前的所有图片数量（用于计算全局索引）
            const prevImagesCount = resultGroups
              .slice(0, groupIndex)
              .reduce((sum, g) => sum + g.results.length, 0);

            // 收集所有图片用于预览导航
            const allImages = resultGroups.flatMap((g) =>
              g.results.map((r) => ({ url: r.url, alt: g.prompt }))
            );

            return (
              <div key={group.promptId} className={batchStyles.resultGroup}>
                <div className={batchStyles.resultGroupHeader}>
                  <div className={batchStyles.resultGroupTitle}>
                    {group.prompt.slice(0, 80)}
                    {group.prompt.length > 80 ? "..." : ""}
                  </div>
                  <div className={batchStyles.resultGroupMeta}>
                    <span className={`${batchStyles.resultGroupBadge} ${batchStyles.ratio}`}>
                      {t(`dashboard.ratios.${group.ratio}`)}
                    </span>
                    <span className={`${batchStyles.resultGroupBadge} ${batchStyles.resolution}`}>
                      {group.resolution}
                    </span>
                    <span className={`${batchStyles.resultGroupBadge} ${batchStyles.count}`}>
                      {group.results.length} {t("dashboard.batchNew.images")}
                    </span>
                  </div>
                </div>
                <div className={batchStyles.resultGroupGrid}>
                  {group.results.map((result, resultIndex) => (
                    <div key={result.id} className={batchStyles.resultItem}>
                      <div className={batchStyles.resultImageFrame}>
                        <img
                          src={result.url}
                          alt={group.prompt}
                          loading="lazy"
                          onClick={() => openPreview(allImages, prevImagesCount + resultIndex)}
                        />
                      </div>
                      <div className={batchStyles.resultActions}>
                        <button
                          className={styles.ghostBtn}
                          onClick={() => downloadImage(result.url, `${result.id}.png`)}
                        >
                          {t("dashboard.result.download")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 空状态 */}
      {resultGroups.length === 0 && !isBatching && (
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>🧩</div>
          <p>{t("dashboard.batch.empty")}</p>
        </div>
      )}
    </div>
  );
};

export default BatchPanel;
