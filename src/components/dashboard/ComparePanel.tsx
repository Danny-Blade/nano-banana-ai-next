"use client";

import React from "react";
import styles from "../Dashboard.module.css";
import { useI18n } from "@/components/I18nProvider";
import {
  modelOptions,
  ratioOptions,
  type ModelValue,
  type MaybeModelValue,
  type RatioValue,
  type UploadedImage,
  type CompareResult,
  type LocalizedModelOption,
  type ImageHistoryItem,
} from "./types";
import {
  REFERENCE_IMAGE_LIMIT,
  openFileDialog,
  handleImageUploadFiles,
  removeImage,
  downloadImage,
  encodeReferenceImages,
  createThumbnailDataUrl,
  mapResolutionToImageSize,
} from "./utils";

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
  openPreview: (url: string, alt: string) => void;
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
  resolution,
  ensureAuthenticatedWithCredits,
  setShowTemplates,
  setTemplateTarget,
  setIsLoginModalOpen,
  openPreview,
  onImageHistoryAdd,
  persistHistorySource,
  trySaveToLocalFolder,
  activeModel,
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
  const [compareReferenceImages, setCompareReferenceImages] = React.useState<
    UploadedImage[]
  >([]);
  const [compareResults, setCompareResults] = React.useState<CompareResult[]>([]);
  const [showEvaluation, setShowEvaluation] = React.useState(false);
  const [isComparing, setIsComparing] = React.useState(false);
  const [compareError, setCompareError] = React.useState<string | null>(null);

  const compareReferenceInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCompare = () => {
    if (isComparing || !compareLeftModel || !compareRightModel) return;
    const targetPrompt = comparePrompt || t("dashboard.templatePrompts.compare");
    const leftModel = compareLeftModel as ModelValue;
    const rightModel = compareRightModel as ModelValue;
    const leftCost =
      modelOptions.find((m) => m.value === leftModel)?.creditsPerImage ??
      activeModel.creditsPerImage;
    const rightCost =
      modelOptions.find((m) => m.value === rightModel)?.creditsPerImage ??
      activeModel.creditsPerImage;
    if (!ensureAuthenticatedWithCredits(leftCost + rightCost, (m) => setCompareError(m))) {
      return;
    }

    const imageSize = mapResolutionToImageSize(resolution);

    const generateOne = async (modelValue: string, refs: string[]) => {
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelValue,
          prompt: targetPrompt,
          aspectRatio: compareRatio,
          imageSize,
          referenceImages: refs,
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
      return url;
    };

    const run = async () => {
      setIsComparing(true);
      setCompareError(null);
      setCompareResults([]);
      setShowEvaluation(false);

      try {
        const encodedRefs = await encodeReferenceImages(compareReferenceImages);
        const [leftUrl, rightUrl] = await Promise.all([
          generateOne(leftModel, encodedRefs),
          generateOne(rightModel, encodedRefs),
        ]);

        const newResult: CompareResult = {
          id: `compare-${Date.now()}`,
          left: leftUrl,
          right: rightUrl,
          prompt: targetPrompt,
          ratio: compareRatio,
          leftModel,
          rightModel,
        };

        setCompareResults([newResult]);
        setShowEvaluation(true);

        const makeHistoryItem = async (modelValue: ModelValue, url: string, cost: number) => {
          const thumb = await createThumbnailDataUrl(url);
          if (!thumb) return null;
          const suggestedName = `nano-banana-${modelValue}-${Date.now()}.png`;
          const saved = await trySaveToLocalFolder(url, suggestedName);
          const id = `img-${Date.now()}-${Math.random()}`;
          void persistHistorySource(id, url);
          const item: ImageHistoryItem = {
            id,
            createdAt: Date.now(),
            model: modelValue,
            prompt: targetPrompt,
            aspectRatio: compareRatio,
            imageSize,
            costCredits: cost,
            thumbnailDataUrl: thumb,
            imageUrl: url.startsWith("http") ? url : undefined,
            fileName: saved?.fileName,
            savedDirName: saved?.savedDirName ?? undefined,
            savedVia: saved?.savedVia,
          };
          return item;
        };

        const [leftHist, rightHist] = await Promise.all([
          makeHistoryItem(leftModel, leftUrl, leftCost),
          makeHistoryItem(rightModel, rightUrl, rightCost),
        ]);
        if (leftHist) onImageHistoryAdd(leftHist);
        if (rightHist) onImageHistoryAdd(rightHist);
      } catch (err) {
        const message = err instanceof Error ? err.message : t("dashboard.compare.failed");
        setCompareError(message);
      } finally {
        setIsComparing(false);
      }
    };

    run();
  };

  const renderUploadList = (
    items: UploadedImage[],
    removeHandler: (id: string) => void
  ) => {
    if (!items.length) return null;
    return (
      <div className={styles.uploadGrid}>
        {items.map((img) => (
          <div key={img.id} className={styles.uploadThumb}>
            <img src={img.url} alt={img.name} />
            <div className={styles.uploadMeta}>
              <div className={styles.metaTitle}>{img.name}</div>
              <span className={styles.metaCaption}>{img.size}</span>
            </div>
            <button
              className={styles.removeBtn}
              aria-label={t("dashboard.common.removeImage")}
              onClick={() => removeHandler(img.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>{t("dashboard.compare.title")}</div>
        <div className={styles.sectionCaption}>{t("dashboard.compare.caption")}</div>
      </div>
      <div className={styles.panelGrid}>
        <div className={styles.column}>
          <div className={styles.gridTwo}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.compare.leftModel")}</label>
              <select
                className={styles.select}
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
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.compare.rightModel")}</label>
              <select
                className={styles.select}
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
              rows={4}
              value={comparePrompt}
              placeholder={t("dashboard.templatePrompts.compare")}
              onChange={(e) => setComparePrompt(e.target.value)}
            />
          </div>

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

          <div className={styles.buttonRow}>
            <button
              className={styles.ghostBtn}
              onClick={() => {
                setComparePrompt("");
                setCompareReferenceImages([]);
                setCompareResults([]);
                setShowEvaluation(false);
                setCompareError(null);
              }}
            >
              {t("dashboard.compare.clear")}
            </button>
            <button
              className={styles.primaryBtn}
              onClick={handleCompare}
              disabled={isComparing}
            >
              {isComparing ? t("dashboard.compare.comparing") : t("dashboard.compare.start")}
            </button>
          </div>
          {compareError && (
            <div className={styles.errorNote}>⚠️ {compareError}</div>
          )}
        </div>

        <div className={styles.column}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>{t("dashboard.compare.refsTitle")}</div>
            <div className={styles.sectionCaption}>
              {t("dashboard.compare.refsCaption", { max: REFERENCE_IMAGE_LIMIT })}
            </div>
          </div>
          <div
            className={styles.uploadArea}
            onClick={() => openFileDialog(compareReferenceInputRef)}
          >
            <div className={styles.uploadIcon}>☁️</div>
            <div className={styles.uploadTitle}>{t("dashboard.compare.uploadTitle")}</div>
            <div className={styles.uploadHint}>{t("dashboard.compare.uploadHint")}</div>
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
          {renderUploadList(compareReferenceImages, (id) =>
            removeImage(id, setCompareReferenceImages)
          )}

          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>{t("dashboard.compare.resultsTitle")}</div>
            <div className={styles.sectionCaption}>{t("dashboard.compare.resultsCaption")}</div>
          </div>
          {compareResults.length ? (
            compareResults.map((item) => (
              <div key={item.id} className={styles.compareResult}>
                <div className={styles.compareItem}>
                  <div className={styles.compareLabel}>
                    {localizedModelOptions.find((m) => m.value === item.leftModel)
                      ?.label || item.leftModel}
                  </div>
                  <img
                    src={item.left}
                    alt={item.leftModel}
                    loading="lazy"
                    onClick={() => openPreview(item.left, item.leftModel)}
                  />
                </div>
                <div className={styles.compareItem}>
                  <div className={styles.compareLabel}>
                    {localizedModelOptions.find((m) => m.value === item.rightModel)
                      ?.label || item.rightModel}
                  </div>
                  <img
                    src={item.right}
                    alt={item.rightModel}
                    loading="lazy"
                    onClick={() => openPreview(item.right, item.rightModel)}
                  />
                </div>
                <div className={styles.resultMeta}>
                  <div className={styles.resultTitle}>{item.prompt}</div>
                  <div className={styles.resultInfo}>
                    {t("dashboard.compare.ratio", { ratio: item.ratio })}
                  </div>
                </div>
                <div className={styles.resultActions}>
                  <button
                    className={styles.ghostBtn}
                    onClick={() => downloadImage(item.left, `${item.id}-left.png`)}
                  >
                    {t("dashboard.compare.downloadLeft")}
                  </button>
                  <button
                    className={styles.ghostBtn}
                    onClick={() => downloadImage(item.right, `${item.id}-right.png`)}
                  >
                    {t("dashboard.compare.downloadRight")}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>⚖️</div>
              <p>{t("dashboard.compare.empty")}</p>
            </div>
          )}

          {showEvaluation && (
            <div className={styles.evaluationBar}>
              <span>{t("dashboard.compare.vote")}</span>
              <div className={styles.buttonRow}>
                <button className={styles.ghostBtn}>{t("dashboard.compare.voteLeft")}</button>
                <button className={styles.ghostBtn}>{t("dashboard.compare.voteSame")}</button>
                <button className={styles.primaryBtn}>{t("dashboard.compare.voteRight")}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparePanel;
