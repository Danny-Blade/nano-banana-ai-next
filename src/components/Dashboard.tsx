"use client";

import React from "react";
import styles from "./Dashboard.module.css";
import { useI18n } from "@/components/I18nProvider";
import { getMessage } from "@/lib/i18n";
import { useSiteContent } from "@/components/useSiteContent";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";

type Tab = "generate" | "batch" | "compare" | "history";
type ResultTab = "result" | "original" | "compare";

type UploadedImage = {
  id: string;
  name: string;
  url: string;
  size: string;
};

type GeneratedResult = {
  id: string;
  url: string;
  prompt: string;
  model: string;
  ratio: string;
  resolution: string;
};

type BatchResult = GeneratedResult & {
  promptLabel: string;
};

type CompareResult = {
  id: string;
  left: string;
  right: string;
  prompt: string;
  ratio: string;
  leftModel: string;
  rightModel: string;
};

type TemplateTarget = "generate" | "batch" | "batch-multi" | "compare";

type DashboardVariant = "full" | "generateOnly";

type DashboardProps = {
  /**
   * `full`：Dashboard 完整形态（含 Tab/批量/对比/历史）。
   * `generateOnly`：仅渲染“图片编辑/生图”模块，用于首页嵌入。
   */
  variant?: DashboardVariant;
};

const modelOptions = [
  { value: "nano-banana", creditsPerImage: 2 },
  { value: "nano-banana-pro", creditsPerImage: 4 },
  { value: "seedream-4-0", creditsPerImage: 5 },
  { value: "sora-image", creditsPerImage: 6 },
  { value: "flux-kontext-pro", creditsPerImage: 3 },
  { value: "flux-kontext-max", creditsPerImage: 8 },
] as const;

const ratioOptions = [
  { value: "1:1" },
  { value: "16:9" },
  { value: "9:16" },
  { value: "4:3" },
  { value: "3:4" },
  { value: "3:2" },
  { value: "2:3" },
  { value: "21:9" },
  { value: "5:4" },
  { value: "4:5" },
] as const;

type ModelValue = (typeof modelOptions)[number]["value"];
type MaybeModelValue = ModelValue | "";
type RatioValue = (typeof ratioOptions)[number]["value"];
type BatchRatioValue = "auto" | RatioValue;

type HistoryEntry =
  | {
      id: string;
      type: "generate";
      timestamp: Date;
      preview?: string;
      payload: {
        model: ModelValue;
        count: number;
        ratio: RatioValue;
        imageSize: string;
      };
    }
  | {
      id: string;
      type: "batch";
      timestamp: Date;
      preview?: string;
      payload: {
        mode: "card" | "multi";
        count: number;
        ratio: BatchRatioValue;
      };
    }
  | {
      id: string;
      type: "compare";
      timestamp: Date;
      preview?: string;
      payload: {
        leftModel: ModelValue;
        rightModel: ModelValue;
      };
    };

const resolutionOptions: Record<string, string[]> = {
  "nano-banana": ["2K", "1K"],
  "nano-banana-pro": ["4K", "2K", "1K"],
  "seedream-4-0": ["2K", "1K"],
  "sora-image": ["2K", "1K"],
  "flux-kontext-pro": ["2K", "1K"],
  "flux-kontext-max": ["4K", "2K"],
};

const templateCategories = [
  { key: "hot" as const },
  { key: "ecommerce" as const },
  { key: "cover" as const },
];

const formatTime = (timestamp: Date, locale: string) => {
  return timestamp.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Dashboard = ({ variant = "full" }: DashboardProps) => {
  const { locale, t } = useI18n();
  const siteContent = useSiteContent();
  const { data: session, status: sessionStatus } = useSession();

  const DEFAULT_MODEL: ModelValue = "nano-banana-pro";

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

  const [activeTab, setActiveTab] = React.useState<Tab>("generate");
  const [resultTab, setResultTab] = React.useState<ResultTab>("result");
  const [selectedModel, setSelectedModel] = React.useState<ModelValue>(DEFAULT_MODEL);
  const [resolution, setResolution] = React.useState(
    resolutionOptions[DEFAULT_MODEL][0]
  );
  const [ratio, setRatio] = React.useState<RatioValue>(ratioOptions[0].value);
  const [generatePrompt, setGeneratePrompt] = React.useState("");
  const [generateCount, setGenerateCount] = React.useState("1");
  const [referenceImages, setReferenceImages] = React.useState<UploadedImage[]>([]);
  const [results, setResults] = React.useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [activeResultIndex, setActiveResultIndex] = React.useState(0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewAlt, setPreviewAlt] = React.useState("");

  const [batchMode, setBatchMode] = React.useState<"card" | "multi">("card");
  const [cardPrompt, setCardPrompt] = React.useState("");
  const [cardCount, setCardCount] = React.useState(5);
  const [batchPrompts, setBatchPrompts] = React.useState("");
  const [batchRatio, setBatchRatio] = React.useState<BatchRatioValue>("auto");
  const [batchCount, setBatchCount] = React.useState("1");
  const [batchConcurrency, setBatchConcurrency] = React.useState("3");
  const [batchReferenceImages, setBatchReferenceImages] = React.useState<UploadedImage[]>(
    []
  );
  const [batchResults, setBatchResults] = React.useState<BatchResult[]>([]);
  const [isBatching, setIsBatching] = React.useState(false);
  const [batchProgress, setBatchProgress] = React.useState(0);

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

  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  const [showTemplates, setShowTemplates] = React.useState(false);
  const [templateCategory, setTemplateCategory] = React.useState(
    templateCategories[0].key
  );
  const [templateTarget, setTemplateTarget] = React.useState<TemplateTarget>("generate");
  const [showModelPicker, setShowModelPicker] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);
  const [showActivity, setShowActivity] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  const referenceInputRef = React.useRef<HTMLInputElement | null>(null);
  const batchReferenceInputRef = React.useRef<HTMLInputElement | null>(null);
  const compareReferenceInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const defaults = resolutionOptions[selectedModel] || ["Auto"];
    setResolution(defaults[0]);
  }, [selectedModel]);

  React.useEffect(() => {
    setActiveResultIndex(0);
  }, [results.length]);

  React.useEffect(() => {
    if (!previewUrl) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewUrl(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewUrl]);

  const [isDragging, setIsDragging] = React.useState(false);

  const imagePool = React.useMemo(() => siteContent.explore.images || [], [siteContent]);

  const getSelfCallbackUrl = React.useCallback(() => {
    if (typeof window === "undefined") return "/";
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
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
      const credits = typeof session.user.credits === "number" ? session.user.credits : 0;
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

  const addHistoryEntry = React.useCallback((entry: Omit<HistoryEntry, "id">) => {
    setHistory((prev) => {
      const item = {
        ...(entry as Omit<HistoryEntry, "id">),
        id: `history-${Date.now()}-${prev.length}`,
      } as HistoryEntry;
      const next = [item, ...prev];
      return next.slice(0, 12);
    });
  }, []);

  const REFERENCE_IMAGE_LIMIT = 5;

  const openFileDialog = (ref: React.RefObject<HTMLInputElement | null>) => {
    const input = ref.current;
    if (!input) return;
    // Clear any previous selection so choosing the same files again still fires onChange.
    input.value = "";
    input.click();
  };

  const handleImageUploadFiles = (
    files: File[] | null,
    setter: React.Dispatch<React.SetStateAction<UploadedImage[]>>,
    limit = REFERENCE_IMAGE_LIMIT
  ) => {
    if (!files || files.length === 0) return;
    setter((prev) => {
      const remaining = Math.max(limit - prev.length, 0);
      const selected = files.slice(0, remaining);
      const mapped = selected.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      }));
      return [...prev, ...mapped];
    });
  };

  const removeImage = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<UploadedImage[]>>
  ) => {
    setter((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        try {
          URL.revokeObjectURL(target.url);
        } catch {
          // ignore
        }
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    setter: React.Dispatch<React.SetStateAction<UploadedImage[]>>
  ) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(event.dataTransfer.files || []);
    handleImageUploadFiles(dropped, setter, REFERENCE_IMAGE_LIMIT);
  };

  const downloadImage = async (url: string, name?: string) => {
    const filename = name || `nano-banana-${Date.now()}.png`;

    const trigger = (href: string) => {
      const link = document.createElement("a");
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Data URLs and blob URLs can be downloaded directly.
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      trigger(url);
      return;
    }

    // For remote URLs, fetch as blob to force download without opening a tab.
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      trigger(objectUrl);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5_000);
    } catch {
      // Fallback: best-effort direct download.
      trigger(url);
    }
  };

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

  const toDataUrl = async (objectUrl: string) => {
    const res = await fetch(objectUrl);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(reader.error || new Error("Failed to read image"));
      reader.readAsDataURL(blob);
    });
  };

  const encodeReferenceImages = async (images: UploadedImage[]) => {
    if (!images.length) return [];
    const encoded = await Promise.all(
      images.map((img) => toDataUrl(img.url).catch(() => null))
    );
    return encoded.filter(Boolean) as string[];
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    const targetPrompt = generatePrompt || t("dashboard.templatePrompts.generate");
    if (!targetPrompt.trim()) {
      setError(t("dashboard.generate.promptRequired"));
      return;
    }

    const mapResolutionToImageSize = (value: string) => {
      if (value === "4K") return "4K";
      if (value === "2K") return "2K";
      return "1K";
    };

    const imageSize = mapResolutionToImageSize(resolution);
    const count = Math.max(1, Math.min(4, parseInt(generateCount, 10) || 1));
    const requiredCredits = count * activeModel.creditsPerImage;
    if (!ensureAuthenticatedWithCredits(requiredCredits, (m) => setError(m))) return;

    const run = async () => {
      setIsGenerating(true);
      setError(null);
      setResultTab("result");
      setProgress(6);
      const generated: GeneratedResult[] = [];
      const encodedRefs = await encodeReferenceImages(referenceImages);

      for (let i = 0; i < count; i += 1) {
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
            setIsLoginModalOpen(true);
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

          generated.push({
            id: `gen-${Date.now()}-${i}`,
            url,
            prompt: targetPrompt,
            model: activeModel.label,
            ratio,
            resolution: imageSize,
          });
          setProgress(Math.min(98, Math.round(((i + 1) / count) * 90 + 8)));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : t("dashboard.generate.generationFailed");
          setError(message);
          break;
        }
      }

      if (generated.length) {
        setResults(generated);
        addHistoryEntry({
          type: "generate",
          timestamp: new Date(),
          preview: generated[0]?.url,
          payload: {
            model: selectedModel,
            count: generated.length,
            ratio,
            imageSize,
          },
        });
      }

      setProgress(100);
      setTimeout(() => setProgress(0), 400);
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
      addHistoryEntry({
        type: "batch",
        timestamp: new Date(),
        preview: newBatchResults[0]?.url,
        payload: {
          mode: batchMode,
          count: newBatchResults.length,
          ratio: batchRatio,
        },
      });
    });
  };

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

    const mapResolutionToImageSize = (value: string) => {
      if (value === "4K") return "4K";
      if (value === "2K") return "2K";
      return "1K";
    };

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
        addHistoryEntry({
          type: "compare",
          timestamp: new Date(),
          preview: leftUrl,
          payload: { leftModel, rightModel },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : t("dashboard.compare.failed");
        setCompareError(message);
      } finally {
        setIsComparing(false);
      }
    };

    run();
  };

  const handleApplyTemplate = (prompt: string) => {
    if (templateTarget === "generate") {
      setGeneratePrompt(prompt);
    } else if (templateTarget === "batch") {
      setCardPrompt(prompt);
    } else if (templateTarget === "batch-multi") {
      setBatchPrompts(prompt);
    } else {
      setComparePrompt(prompt);
    }
    setShowTemplates(false);
  };

  const currentModel = localizedModelOptions.find((m) => m.value === selectedModel);
  const activeModel = currentModel || localizedModelOptions[0];
  const estimatedGenerateCost =
    Math.max(1, Math.min(4, parseInt(generateCount, 10) || 1)) *
    activeModel.creditsPerImage;

  const handleModelSelect = (modelValue: ModelValue) => {
    setSelectedModel(modelValue);
    setShowModelPicker(false);
  };

  const openPreview = React.useCallback((url: string, alt: string) => {
    setPreviewUrl(url);
    setPreviewAlt(alt);
  }, []);

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

  const renderHistory = () => {
    if (!history.length) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🕒</div>
          <p>{t("dashboard.history.empty")}</p>
        </div>
      );
    }

    const renderHistoryTitle = (item: HistoryEntry) => {
      if (item.type === "generate") {
        const modelLabel =
          localizedModelOptions.find((m) => m.value === item.payload.model)?.label ||
          item.payload.model;
        return t("dashboard.history.generateDone", { model: modelLabel });
      }
      if (item.type === "batch") {
        return item.payload.mode === "card"
          ? t("dashboard.history.batchDoneCard")
          : t("dashboard.history.batchDoneMulti");
      }
      return t("dashboard.history.compareDone");
    };

    const renderHistoryDetail = (item: HistoryEntry) => {
      if (item.type === "generate") {
        return `${t("dashboard.generate.countItem", { n: item.payload.count })} · ${
          item.payload.ratio
        } · ${item.payload.imageSize}`;
      }
      if (item.type === "batch") {
        return `${t("dashboard.generate.countItem", { n: item.payload.count })} · ${
          item.payload.ratio === "auto" ? t("dashboard.batch.sizeAuto") : item.payload.ratio
        }`;
      }
      const leftLabel =
        localizedModelOptions.find((m) => m.value === item.payload.leftModel)?.label ||
        item.payload.leftModel;
      const rightLabel =
        localizedModelOptions.find((m) => m.value === item.payload.rightModel)?.label ||
        item.payload.rightModel;
      return `${leftLabel} vs ${rightLabel}`;
    };

    return (
      <div className={styles.historyGrid}>
        {history.map((item) => (
          <div key={item.id} className={styles.historyCard}>
            <div className={styles.historyHead}>
              <span className={styles.badge}>{t(`dashboard.tabs.${item.type}`)}</span>
              <span className={styles.historyTime}>
                {formatTime(item.timestamp, intlLocale)}
              </span>
            </div>
            <div className={styles.historyTitle}>{renderHistoryTitle(item)}</div>
            <div className={styles.historyDetail}>{renderHistoryDetail(item)}</div>
            {item.preview && (
              <div className={styles.historyPreview}>
                <img src={item.preview} alt={renderHistoryTitle(item)} />
              </div>
            )}
          </div>
        ))}
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
                  onDrop={(e) => handleDrop(e, setReferenceImages)}
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
	                        <div className={styles.singleResult}>
	                          {renderGeneratedResultCard(results[activeResultIndex]!, true)}
	                          {results.length > 1 ? (
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
	                          ) : null}
	                        </div>
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
	                      {t("dashboard.generate.progress", {
                          percent: progress.toFixed(0),
                        })}
	                    </div>
	                  </div>
	                )}
	              </div>
            </div>
          </div>
        )}

        {variant !== "generateOnly" && activeTab === "batch" && (
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
        )}

        {variant !== "generateOnly" && activeTab === "compare" && (
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
        )}

        {variant !== "generateOnly" && activeTab === "history" && (
          <div className={styles.panel}>{renderHistory()}</div>
        )}
      </div>

      {renderTemplateModal()}
      {renderModelModal()}
      {renderGuideModal()}
      {renderActivityModal()}

      <LoginModal
        isOpen={isLoginModalOpen}
        callbackUrl={getSelfCallbackUrl()}
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
