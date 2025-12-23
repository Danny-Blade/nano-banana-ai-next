"use client";

import React from "react";
import styles from "../Dashboard.module.css";
import { useI18n } from "@/components/I18nProvider";
import {
  ratioOptions,
  type RatioValue,
  type BatchRatioValue,
  type UploadedImage,
  type BatchResult,
  type LocalizedModelOption,
  type ModelValue,
} from "./types";
import {
  REFERENCE_IMAGE_LIMIT,
  openFileDialog,
  handleImageUploadFiles,
  removeImage,
  downloadImage,
} from "./utils";

type BatchPanelProps = {
  localizedModelOptions: LocalizedModelOption[];
  selectedModel: ModelValue;
  resolution: string;
  ensureAuthenticatedWithCredits: (
    requiredCredits: number,
    onError: (message: string) => void
  ) => boolean;
  setShowTemplates: (show: boolean) => void;
  setTemplateTarget: (target: "generate" | "batch" | "batch-multi" | "compare") => void;
  openPreview: (url: string, alt: string) => void;
  pickImages: (count: number) => string[];
  activeModel: LocalizedModelOption;
};

export const BatchPanel = ({
  localizedModelOptions,
  selectedModel,
  resolution,
  ensureAuthenticatedWithCredits,
  setShowTemplates,
  setTemplateTarget,
  openPreview,
  pickImages,
  activeModel,
}: BatchPanelProps) => {
  const { t } = useI18n();

  const [batchMode, setBatchMode] = React.useState<"card" | "multi">("card");
  const [cardPrompt, setCardPrompt] = React.useState("");
  const [cardCount, setCardCount] = React.useState(5);
  const [batchPrompts, setBatchPrompts] = React.useState("");
  const [batchRatio, setBatchRatio] = React.useState<BatchRatioValue>("auto");
  const [batchCount, setBatchCount] = React.useState("1");
  const [batchConcurrency, setBatchConcurrency] = React.useState("3");
  const [batchReferenceImages, setBatchReferenceImages] = React.useState<UploadedImage[]>([]);
  const [batchResults, setBatchResults] = React.useState<BatchResult[]>([]);
  const [isBatching, setIsBatching] = React.useState(false);
  const [batchProgress, setBatchProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const batchReferenceInputRef = React.useRef<HTMLInputElement | null>(null);

  const runFakeProgress = (
    setter: (value: number) => void,
    durationMs: number,
    onComplete: () => void
  ) => {
    let value = 5;
    setter(value);
    const tick = window.setInterval(() => {
      value = Math.min(95, value + 8 + Math.random() * 6);
      setter(value);
    }, 240);
    window.setTimeout(() => {
      window.clearInterval(tick);
      setter(100);
      window.setTimeout(onComplete, 200);
    }, durationMs);
  };

  const handleBatchGenerate = () => {
    if (isBatching) return;
    const prompts =
      batchMode === "card"
        ? [cardPrompt || t("dashboard.templatePrompts.batch")]
        : batchPrompts
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean);
    const count = Math.max(1, Math.min(6, prompts.length * parseInt(batchCount, 10)));
    const requiredCredits = count * activeModel.creditsPerImage;
    if (!ensureAuthenticatedWithCredits(requiredCredits, (m) => setError(m))) return;

    setIsBatching(true);
    runFakeProgress(setBatchProgress, 1600, () => {
      const picked = pickImages(count);
      const modelLabel =
        localizedModelOptions.find((m) => m.value === selectedModel)?.label || selectedModel;
      const newBatchResults: BatchResult[] = picked.map((url, idx) => ({
        id: `batch-${Date.now()}-${idx}`,
        url,
        prompt: prompts[idx % prompts.length],
        promptLabel:
          prompts[idx % prompts.length]?.slice(0, 26) || t("dashboard.tabs.batch"),
        model: modelLabel,
        ratio: batchRatio === "auto" ? t("dashboard.batch.sizeAuto") : batchRatio,
        resolution,
      }));
      setBatchResults(newBatchResults);
      setIsBatching(false);
      setBatchProgress(0);
    });
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
        <div className={styles.sectionTitle}>{t("dashboard.batch.title")}</div>
        <div className={styles.sectionCaption}>{t("dashboard.batch.caption")}</div>
      </div>

      <div className={styles.panelGrid}>
        <div className={styles.column}>
          <div className={styles.toggleRow}>
            <button
              className={`${styles.toggleBtn} ${
                batchMode === "card" ? styles.active : ""
              }`}
              onClick={() => setBatchMode("card")}
            >
              {t("dashboard.batch.modeCard")}
            </button>
            <button
              className={`${styles.toggleBtn} ${
                batchMode === "multi" ? styles.active : ""
              }`}
              onClick={() => setBatchMode("multi")}
            >
              {t("dashboard.batch.modeMulti")}
            </button>
          </div>

          {batchMode === "card" && (
            <>
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
                  className={styles.textarea}
                  rows={5}
                  value={cardPrompt}
                  placeholder={t("dashboard.templatePrompts.batch")}
                  onChange={(e) => setCardPrompt(e.target.value)}
                />
                <div className={styles.inputNote}>
                  {t("dashboard.batch.noteSinglePrompt")}
                </div>
              </div>

              <div className={styles.sliderRow}>
                <label className={styles.label}>{t("dashboard.batch.countLabel")}</label>
                <div className={styles.sliderValue}>
                  {t("dashboard.batch.countSuffix", { n: cardCount })}
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={cardCount}
                  onChange={(e) => setCardCount(parseInt(e.target.value, 10))}
                />
              </div>
            </>
          )}

          {batchMode === "multi" && (
            <div className={styles.inputGroup}>
              <div className={styles.sectionHeader}>
                <label className={styles.label}>{t("dashboard.batch.multiPrompt")}</label>
                <button
                  className={styles.linkBtn}
                  onClick={() => {
                    setTemplateTarget("batch-multi");
                    setShowTemplates(true);
                  }}
                >
                  {t("dashboard.generate.promptTemplates")}
                </button>
              </div>
              <textarea
                className={styles.textarea}
                rows={7}
                value={batchPrompts}
                placeholder={t("dashboard.templatePrompts.batchMulti")}
                onChange={(e) => setBatchPrompts(e.target.value)}
              />
              <div className={styles.inputNote}>
                {t("dashboard.batch.noteMultiPrompt")}
              </div>
            </div>
          )}

          <div className={styles.gridThree}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.batch.size")}</label>
              <select
                className={styles.select}
                value={batchRatio}
                onChange={(e) => setBatchRatio(e.target.value as BatchRatioValue)}
              >
                <option value="auto">{t("dashboard.batch.sizeAuto")}</option>
                {ratioOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(`dashboard.ratios.${opt.value}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.batch.perPrompt")}</label>
              <select
                className={styles.select}
                value={batchCount}
                onChange={(e) => setBatchCount(e.target.value)}
              >
                <option value="1">{t("dashboard.generate.countItem", { n: 1 })}</option>
                <option value="2">{t("dashboard.generate.countItem", { n: 2 })}</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t("dashboard.batch.concurrency")}</label>
              <select
                className={styles.select}
                value={batchConcurrency}
                onChange={(e) => setBatchConcurrency(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.ghostBtn} onClick={() => setBatchResults([])}>
              {t("dashboard.batch.clear")}
            </button>
            <button className={styles.primaryBtn} onClick={handleBatchGenerate}>
              {t("dashboard.batch.start")}
            </button>
          </div>
          {error && <div className={styles.errorNote}>⚠️ {error}</div>}
        </div>

        <div className={styles.column}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>{t("dashboard.batch.refsTitle")}</div>
              <div className={styles.sectionCaption}>
                {t("dashboard.batch.refsCaption", { max: REFERENCE_IMAGE_LIMIT })}
              </div>
            </div>
            <button
              className={styles.linkBtn}
              onClick={() => openFileDialog(batchReferenceInputRef)}
            >
              {t("dashboard.batch.upload")}
            </button>
          </div>
          <div
            className={styles.uploadArea}
            onClick={() => openFileDialog(batchReferenceInputRef)}
          >
            <div className={styles.uploadIcon}>🖇️</div>
            <div className={styles.uploadTitle}>{t("dashboard.batch.paste")}</div>
            <div className={styles.uploadHint}>
              {t("dashboard.batch.pasteHint", { max: REFERENCE_IMAGE_LIMIT })}
            </div>
            <input
              ref={batchReferenceInputRef}
              type="file"
              className={styles.hiddenInput}
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.currentTarget.files || []);
                if (e.currentTarget) e.currentTarget.value = "";
                handleImageUploadFiles(
                  files,
                  setBatchReferenceImages,
                  REFERENCE_IMAGE_LIMIT
                );
              }}
            />
          </div>
          {renderUploadList(batchReferenceImages, (id) =>
            removeImage(id, setBatchReferenceImages)
          )}

          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>{t("dashboard.batch.resultsTitle")}</div>
            <div className={styles.sectionCaption}>{t("dashboard.batch.resultsCaption")}</div>
          </div>
          <div className={styles.resultGrid}>
            {batchResults.length ? (
              batchResults.map((item) => (
                <div key={item.id} className={styles.resultCard}>
                  <div className={styles.resultImageFrame}>
                    <img
                      src={item.url}
                      alt={item.prompt}
                      loading="lazy"
                      onClick={() => openPreview(item.url, item.promptLabel)}
                    />
                  </div>
                  <div className={styles.resultMeta}>
                    <div className={styles.resultTitle}>{item.promptLabel}</div>
                    <div className={styles.resultInfo}>
                      {item.ratio} · {item.model}
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
              ))
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>🧩</div>
                <p>{t("dashboard.batch.empty")}</p>
              </div>
            )}
          </div>

          {(isBatching || batchProgress > 0) && (
            <div className={styles.progressBlock}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
              <div className={styles.progressText}>
                {t("dashboard.batch.progress", {
                  percent: batchProgress.toFixed(0),
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchPanel;
