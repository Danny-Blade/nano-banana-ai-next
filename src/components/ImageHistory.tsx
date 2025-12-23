"use client";

import React from "react";
import styles from "./ImageHistory.module.css";
import { useI18n } from "@/components/I18nProvider";
import { getMessage } from "@/lib/i18n";
import { useImageHistory, modelOptions, type ImageHistoryItem, type ModelValue } from "@/hooks/useImageHistory";

const formatTime = (timestamp: Date, locale: string) => {
  return timestamp.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type ImageHistoryProps = {
  /** Optional: external history data (for Dashboard integration) */
  externalHistory?: ImageHistoryItem[];
  /** Optional: callback when history items change */
  onHistoryChange?: (items: ImageHistoryItem[]) => void;
  /** Optional: hide toolbar (filter and save folder) */
  hideToolbar?: boolean;
};

export const ImageHistory = ({
  externalHistory,
  onHistoryChange,
  hideToolbar = false,
}: ImageHistoryProps) => {
  const { locale, t } = useI18n();
  const {
    imageHistory: internalHistory,
    setImageHistory: setInternalHistory,
    historyModelFilter,
    setHistoryModelFilter,
    saveDirName,
    hasSaveDir,
    isFileSystemAccessSupported,
    historySourceMap,
    downloadImage,
    pickSaveFolder,
    openSavedFile,
    downloadSavedFile,
  } = useImageHistory();

  // Use external history if provided, otherwise use internal
  const imageHistory = externalHistory ?? internalHistory;
  const setImageHistory = onHistoryChange ?? setInternalHistory;

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewAlt, setPreviewAlt] = React.useState("");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const intlLocale = React.useMemo(() => {
    if (locale === "zh") return "zh-CN";
    if (locale === "ja") return "ja-JP";
    if (locale === "ko") return "ko-KR";
    return "en-US";
  }, [locale]);

  const localizedModelOptions = React.useMemo(() => {
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

  const showToast = React.useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  const copyPrompt = React.useCallback(
    async (text: string) => {
      if (!text) return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          showToast(t("dashboard.history.promptCopied"));
          return;
        }
      } catch {
        // fall through to legacy copy
      }

      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "0";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        showToast(
          ok ? t("dashboard.history.promptCopied") : t("dashboard.history.copyFailed")
        );
      } catch {
        showToast(t("dashboard.history.copyFailed"));
      }
    },
    [showToast, t]
  );

  const openPreview = React.useCallback((url: string, alt: string) => {
    setPreviewUrl(url);
    setPreviewAlt(alt);
  }, []);

  // Close preview on Escape
  React.useEffect(() => {
    if (!previewUrl) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewUrl(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewUrl]);

  const filtered =
    historyModelFilter === "all"
      ? imageHistory
      : imageHistory.filter((item) => item.model === historyModelFilter);

  const modelsToShow: ModelValue[] =
    historyModelFilter === "all"
      ? (() => {
          const known = modelOptions
            .map((m) => m.value)
            .filter((value) => filtered.some((item) => item.model === value));
          const extras = Array.from(
            new Set(
              filtered
                .map((item) => item.model)
                .filter((value) => !known.includes(value))
            )
          );
          return [...known, ...extras];
        })()
      : [historyModelFilter];

  return (
    <div className={styles.container}>
      {!hideToolbar && (
        <>
          <div className={styles.historyToolbar}>
            <label className={styles.historyFilter}>
              <span className={styles.historyFilterLabel}>
                {t("dashboard.history.filterModel")}
              </span>
              <select
                className={styles.historySelect}
                value={historyModelFilter}
                onChange={(e) =>
                  setHistoryModelFilter(e.target.value as ModelValue | "all")
                }
              >
                <option value="all">{t("dashboard.history.filterAll")}</option>
                {localizedModelOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.historySaveBox}>
              <div className={styles.historySaveMeta}>
                <div className={styles.historySaveTitle}>
                  {t("dashboard.history.saveFolder")}
                </div>
                <div className={styles.historySaveValue}>
                  {isFileSystemAccessSupported
                    ? hasSaveDir
                      ? t("dashboard.history.saveFolderSelected", {
                          name: saveDirName || t("dashboard.history.saveFolderUnknown"),
                        })
                      : t("dashboard.history.saveFolderNotSet")
                    : t("dashboard.history.saveFolderUnsupported")}
                </div>
              </div>
              {isFileSystemAccessSupported && (
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={pickSaveFolder}
                >
                  {t("dashboard.history.chooseFolder")}
                </button>
              )}
            </div>
          </div>

          <div className={styles.historyHint}>{t("dashboard.history.metaOnlyHint")}</div>
        </>
      )}


      {!filtered.length ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🕒</div>
          <p>{t("dashboard.history.empty")}</p>
        </div>
      ) : null}

      {modelsToShow.map((modelValue) => {
        const group = filtered.filter((item) => item.model === modelValue);
        if (!group.length) return null;
        const modelLabel =
          localizedModelOptions.find((m) => m.value === modelValue)?.label || modelValue;
        return (
          <div key={modelValue} className={styles.historyGroup}>
            <div className={styles.historyGroupTitle}>{modelLabel}</div>
            <div className={styles.historyGrid}>
              {group.map((item) => (
                <div key={item.id} className={styles.historyCard}>
                  <div className={styles.historyHead}>
                    <span className={styles.historyTime}>
                      {formatTime(new Date(item.createdAt), intlLocale)}
                    </span>
                  </div>
                  <div className={styles.historyDetail}>
                    {t("dashboard.model.points", { credits: item.costCredits })} ·{" "}
                    {item.aspectRatio} · {item.imageSize}
                  </div>
                  <div
                    className={styles.historyPrompt}
                    title={item.prompt}
                  >
                    {item.prompt}
                  </div>
                  <div
                    className={styles.historyPreview}
                    onClick={() => {
                      const sourceUrl =
                        item.imageUrl ||
                        historySourceMap.current.get(item.id) ||
                        item.thumbnailDataUrl;
                      openPreview(sourceUrl, item.prompt);
                    }}
                  >
                    <img src={item.thumbnailDataUrl} alt={item.prompt} />
                  </div>
                  <div className={styles.historyActions}>
                    {(() => {
                      const sourceUrl =
                        item.imageUrl || historySourceMap.current.get(item.id) || item.thumbnailDataUrl || "";
                      const canDownload =
                        !!sourceUrl ||
                        (isFileSystemAccessSupported &&
                          item.savedVia === "fs" &&
                          item.fileName);
                      const filename =
                        item.fileName ||
                        `nano-banana-${item.model}-${item.id}.png`;
                      return (
                        <button
                          className={styles.secondaryBtn}
                          type="button"
                          disabled={!canDownload}
                          onClick={async () => {
                            if (sourceUrl) {
                              await downloadImage(sourceUrl, filename);
                            } else {
                              const ok = await downloadSavedFile(item);
                              if (!ok) return;
                            }
                            setImageHistory(
                              imageHistory.map((p) =>
                                p.id === item.id
                                  ? { ...p, fileName: filename, savedVia: "download" }
                                  : p
                              )
                            );
                          }}
                        >
                          {t("dashboard.result.download")}
                        </button>
                      );
                    })()}

                    <button
                      className={styles.secondaryBtn}
                      type="button"
                      onClick={() => copyPrompt(item.prompt)}
                    >
                      {t("dashboard.history.copyPrompt")}
                    </button>

                    {item.savedVia === "fs" ? (
                      <button
                        className={styles.secondaryBtn}
                        type="button"
                        onClick={() => openSavedFile(item)}
                      >
                        {t("dashboard.history.openLocalFile")}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Preview Modal */}
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
              className={styles.previewClose}
              aria-label="Close preview"
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toastOverlay}>
          <div className={styles.toastContent}>{toastMessage}</div>
        </div>
      )}
    </div>
  );
};

export default ImageHistory;
