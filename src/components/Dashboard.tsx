"use client";

import React from "react";
import styles from "./Dashboard.module.css";
import { siteContent } from "@/config/content";

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

type HistoryEntry = {
  id: string;
  type: Tab;
  title: string;
  detail: string;
  timestamp: Date;
  preview?: string;
};

type TemplateTarget = "generate" | "batch" | "batch-multi" | "compare";

const modelOptions = [
  {
    value: "nano-banana",
    label: "Nano Banana",
    description: "极速生成，适合通用场景",
    points: "消耗 2 积分/张",
    badge: "新",
  },
  {
    value: "nano-banana-pro",
    label: "Nano Banana Pro",
    description: "高质量商业级，细节更强",
    points: "消耗 4 积分/张",
    badge: "Pro",
  },
  {
    value: "seedream-4-0",
    label: "SeeDream 4.0",
    description: "写实光影，产品与人物一致性好",
    points: "消耗 5 积分/张",
  },
  {
    value: "sora-image",
    label: "Sora_image",
    description: "动态场景、故事感画面",
    points: "消耗 6 积分/张",
  },
  {
    value: "flux-kontext-pro",
    label: "Flux Kontext Pro",
    description: "文生图稳定，场景理解佳",
    points: "消耗 3 积分/张",
  },
  {
    value: "flux-kontext-max",
    label: "Flux Kontext Max",
    description: "超高分辨率与复杂细节",
    points: "消耗 8 积分/张",
  },
];

const ratioOptions = [
  { value: "1:1", label: "方形 1:1" },
  { value: "16:9", label: "横版 16:9" },
  { value: "9:16", label: "竖版 9:16" },
  { value: "4:3", label: "横版 4:3" },
  { value: "3:4", label: "竖版 3:4" },
  { value: "3:2", label: "横版 3:2" },
  { value: "2:3", label: "竖版 2:3" },
  { value: "21:9", label: "影院 21:9" },
  { value: "5:4", label: "横版 5:4" },
  { value: "4:5", label: "竖版 4:5" },
];

const resolutionOptions: Record<string, string[]> = {
  "nano-banana": ["2K", "1K"],
  "nano-banana-pro": ["4K", "2K", "1K"],
  "seedream-4-0": ["2K", "1K"],
  "sora-image": ["2K", "1K"],
  "flux-kontext-pro": ["2K", "1K"],
  "flux-kontext-max": ["4K", "2K"],
};

const templateCategories = [
  {
    key: "hot",
    label: "热门",
    prompts: [
      "一只可爱的小猫咪坐在花园里，油画风格，高清，细节丰富，阳光洒落在身上",
      "年轻女性的商业人像，干净背景，柔和光线，胶片质感",
      "未来感的城市夜景，霓虹灯、高楼、雨夜倒影，赛博朋克氛围",
    ],
  },
  {
    key: "ecommerce",
    label: "电商",
    prompts: [
      "设计一张图文店促销活动海报，橙红色主色调，包含折扣标签和明亮的光效",
      "一双跑鞋的产品海报，悬浮在烟雾里，黑色背景，光影突出轮廓，附带文案：极速回弹",
    ],
  },
  {
    key: "video",
    label: "视频封面",
    prompts: [
      "科技感直播封面，蓝紫渐变背景，抽象光线元素，标题位置预留",
      "烘焙教程视频封面，温暖色调，厨房背景，手工蛋糕特写",
    ],
  },
];

const promptTemplatesByTarget: Record<TemplateTarget, string> = {
  generate: "例如：打造一张高端时尚杂志封面，冷色调摄影棚灯光，保持自然肤色",
  batch: "一条街头潮流穿搭海报，突出质感与纹理，背景虚化",
  "batch-multi":
    "产品展示：一双白色运动鞋摆放在光洁的石面上，顶部柔光\n\n场景展示：模特穿着运动鞋在篮球场起跳，动感模糊背景",
  compare: "同一场景下的两个灯光方案，对比柔光与硬光的细节表现",
};

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = React.useState<Tab>("generate");
  const [resultTab, setResultTab] = React.useState<ResultTab>("result");
  const [selectedModel, setSelectedModel] = React.useState(modelOptions[0].value);
  const [resolution, setResolution] = React.useState(
    resolutionOptions[modelOptions[0].value][0]
  );
  const [ratio, setRatio] = React.useState(ratioOptions[0].value);
  const [generatePrompt, setGeneratePrompt] = React.useState("");
  const [generateCount, setGenerateCount] = React.useState("1");
  const [referenceImages, setReferenceImages] = React.useState<UploadedImage[]>([]);
  const [results, setResults] = React.useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const [batchMode, setBatchMode] = React.useState<"card" | "multi">("card");
  const [cardPrompt, setCardPrompt] = React.useState("");
  const [cardCount, setCardCount] = React.useState(5);
  const [batchPrompts, setBatchPrompts] = React.useState("");
  const [batchRatio, setBatchRatio] = React.useState("auto");
  const [batchCount, setBatchCount] = React.useState("1");
  const [batchConcurrency, setBatchConcurrency] = React.useState("3");
  const [batchReferenceImages, setBatchReferenceImages] = React.useState<UploadedImage[]>(
    []
  );
  const [batchResults, setBatchResults] = React.useState<BatchResult[]>([]);
  const [isBatching, setIsBatching] = React.useState(false);
  const [batchProgress, setBatchProgress] = React.useState(0);

  const [compareLeftModel, setCompareLeftModel] = React.useState(modelOptions[0].value);
  const [compareRightModel, setCompareRightModel] = React.useState(modelOptions[1].value);
  const [comparePrompt, setComparePrompt] = React.useState("");
  const [compareRatio, setCompareRatio] = React.useState(ratioOptions[0].value);
  const [compareReferenceImages, setCompareReferenceImages] = React.useState<
    UploadedImage[]
  >([]);
  const [compareResults, setCompareResults] = React.useState<CompareResult[]>([]);
  const [showEvaluation, setShowEvaluation] = React.useState(false);

  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  const [showTemplates, setShowTemplates] = React.useState(false);
  const [templateCategory, setTemplateCategory] = React.useState(
    templateCategories[0].key
  );
  const [templateTarget, setTemplateTarget] = React.useState<TemplateTarget>("generate");
  const [showModelPicker, setShowModelPicker] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);
  const [showActivity, setShowActivity] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");
  const [savedMessage, setSavedMessage] = React.useState("");

  const referenceInputRef = React.useRef<HTMLInputElement>(null);
  const batchReferenceInputRef = React.useRef<HTMLInputElement>(null);
  const compareReferenceInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const defaults = resolutionOptions[selectedModel] || ["自动"];
    setResolution(defaults[0]);
  }, [selectedModel]);

  const [isDragging, setIsDragging] = React.useState(false);

  const imagePool = React.useMemo(() => siteContent.explore.images || [], []);

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
      const next = [
        {
          ...entry,
          id: `history-${Date.now()}-${prev.length}`,
        },
        ...prev,
      ];
      return next.slice(0, 12);
    });
  }, []);

  const handleImageUpload = (
    files: FileList | null,
    setter: React.Dispatch<React.SetStateAction<UploadedImage[]>>,
    limit = 3
  ) => {
    if (!files || files.length === 0) return;
    setter((prev) => {
      const remaining = Math.max(limit - prev.length, 0);
      const selected = Array.from(files).slice(0, remaining);
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
    setter((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    setter: React.Dispatch<React.SetStateAction<UploadedImage[]>>
  ) => {
    event.preventDefault();
    setIsDragging(false);
    handleImageUpload(event.dataTransfer.files, setter, 3);
  };

  const downloadImage = (url: string, name?: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name || `nano-banana-${Date.now()}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleGenerate = () => {
    if (isGenerating) return;
    const targetPrompt = generatePrompt || promptTemplatesByTarget.generate;
    if (!targetPrompt.trim()) {
      setError("请输入提示词");
      return;
    }

    const mapResolutionToImageSize = (value: string) => {
      if (value === "4K") return "4K";
      if (value === "2K") return "2K";
      return "1K";
    };

    const imageSize = mapResolutionToImageSize(resolution);
    const count = Math.max(1, Math.min(4, parseInt(generateCount, 10) || 1));

    const generateOnce = async () => {
      const response = await fetch("/api/nano-banana/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: targetPrompt,
          aspectRatio: ratio,
          imageSize,
        }),
      });

      if (!response.ok) {
        const info = await response.json().catch(() => ({}));
        throw new Error(info.error || response.statusText);
      }

      const data = (await response.json()) as { imageData: string; mimeType?: string };
      const mime = data.mimeType || "image/png";
      return `data:${mime};base64,${data.imageData}`;
    };

    const run = async () => {
      setIsGenerating(true);
      setError(null);
      setResultTab("result");
      setProgress(6);
      const generated: GeneratedResult[] = [];

      for (let i = 0; i < count; i += 1) {
        try {
          const url = await generateOnce();
          generated.push({
            id: `gen-${Date.now()}-${i}`,
            url,
            prompt: targetPrompt,
            model: "gemini-3-pro-image-preview",
            ratio,
            resolution: imageSize,
          });
          setProgress(Math.min(98, Math.round(((i + 1) / count) * 90 + 8)));
        } catch (err) {
          const message = err instanceof Error ? err.message : "生成失败";
          setError(message);
          break;
        }
      }

      if (generated.length) {
        setResults(generated);
        addHistoryEntry({
          type: "generate",
          title: "Nano Banana Pro 生成完成",
          detail: `${generated.length} 张 · ${ratio} · ${imageSize}`,
          timestamp: new Date(),
          preview: generated[0]?.url,
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
    setIsBatching(true);
    runFakeProgress(setBatchProgress, 1600, () => {
      const prompts =
        batchMode === "card"
          ? [cardPrompt || promptTemplatesByTarget.batch]
          : batchPrompts
              .split(/\n\s*\n/)
              .map((p) => p.trim())
              .filter(Boolean);
      const count = Math.max(1, Math.min(6, prompts.length * parseInt(batchCount, 10)));
      const picked = pickImages(count);
      const newBatchResults: BatchResult[] = picked.map((url, idx) => ({
        id: `batch-${Date.now()}-${idx}`,
        url,
        prompt: prompts[idx % prompts.length],
        promptLabel: prompts[idx % prompts.length]?.slice(0, 26) || "批量生成",
        model: selectedModel,
        ratio: batchRatio === "auto" ? "自适应" : batchRatio,
        resolution,
      }));
      setBatchResults(newBatchResults);
      setIsBatching(false);
      setBatchProgress(0);
      addHistoryEntry({
        type: "batch",
        title: batchMode === "card" ? "抽卡模式完成" : "批量生成完成",
        detail: `${newBatchResults.length} 张 · ${batchRatio === "auto" ? "自适应" : batchRatio}`,
        timestamp: new Date(),
        preview: newBatchResults[0]?.url,
      });
    });
  };

  const handleCompare = () => {
    if (!compareLeftModel || !compareRightModel) return;
    const picked = pickImages(2);
    const newResult: CompareResult = {
      id: `compare-${Date.now()}`,
      left: picked[0],
      right: picked[1] || picked[0],
      prompt: comparePrompt || promptTemplatesByTarget.compare,
      ratio: compareRatio,
      leftModel: compareLeftModel,
      rightModel: compareRightModel,
    };
    setCompareResults([newResult]);
    setShowEvaluation(true);
    addHistoryEntry({
      type: "compare",
      title: "模型对比完成",
      detail: `${compareLeftModel} vs ${compareRightModel}`,
      timestamp: new Date(),
      preview: picked[0],
    });
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

  const handleSaveApiKey = () => {
    setSavedMessage(apiKey ? "已保存到本地，仅前端存储。" : "请输入 API Key。");
    setTimeout(() => setSavedMessage(""), 2200);
  };

  const currentModel = modelOptions.find((m) => m.value === selectedModel);
  const activeModel = currentModel || modelOptions[0];

  const handleModelSelect = (modelValue: string) => {
    setSelectedModel(modelValue);
    setShowModelPicker(false);
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
              aria-label="移除图片"
              onClick={() => removeHandler(img.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderTemplateModal = () => {
    if (!showTemplates) return null;
    const currentCategory = templateCategories.find((c) => c.key === templateCategory);
    return (
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalCard}>
          <div className={styles.modalHeader}>
            <div>
              <div className={styles.modalTitle}>提示词模板库</div>
              <div className={styles.modalCaption}>
                选择模板快速填充当前场景的提示词
              </div>
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
                {cat.label}
              </button>
            ))}
          </div>
          <div className={styles.templateGrid}>
            {currentCategory?.prompts.map((prompt, idx) => (
              <button
                key={idx}
                className={styles.templateCard}
                onClick={() => handleApplyTemplate(prompt)}
              >
                <div className={styles.templateTitle}>模板 {idx + 1}</div>
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
              <div className={styles.modalTitle}>Choose Model</div>
              <div className={styles.modalCaption}>不同模型速度、质量与积分消耗各有侧重</div>
            </div>
            <button className={styles.closeBtn} onClick={() => setShowModelPicker(false)}>
              ×
            </button>
          </div>
          <div className={styles.modelGrid}>
            {modelOptions.map((model) => (
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
                  <span className={styles.modelOptionHint}>适配垫图与文生图</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsModal = () => {
    if (!showSettings) return null;
    return (
      <div className={styles.modalOverlay} role="dialog" aria-modal="true">
        <div className={styles.modalCard}>
          <div className={styles.modalHeader}>
            <div>
              <div className={styles.modalTitle}>API 设置</div>
              <div className={styles.modalCaption}>
                保存 API 易 / 自建中转站的 Key，前端本地存储
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setShowSettings(false)}>
              ×
            </button>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>API Key</label>
            <input
              type="password"
              className={styles.input}
              placeholder="示例：sk-xxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.ghostBtn} onClick={() => setShowSettings(false)}>
              取消
            </button>
            <button className={styles.primaryBtn} onClick={handleSaveApiKey}>
              保存 Key
            </button>
          </div>
          {savedMessage && <div className={styles.notice}>{savedMessage}</div>}
          <div className={styles.noticeAlt}>
            <span className={styles.badge}>小贴士</span>
            推荐创建按次计费令牌，避免额度超支。
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
              <div className={styles.modalTitle}>使用说明</div>
              <div className={styles.modalCaption}>
                抽卡 / 批量 / 模型对比，与参考站一致的操作流
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setShowGuide(false)}>
              ×
            </button>
          </div>
          <ul className={styles.list}>
            <li>图片编辑：上传参考图或直接填提示词，选择比例后生成。</li>
            <li>
              批量生成：切换抽卡或多提示词模式，可共用参考图，控制并发与数量。
            </li>
            <li>模型对比：左右选择模型，输入同一提示词并对比输出。</li>
            <li>历史记录：最新生成自动入库，便于复用与下载。</li>
          </ul>
          <div className={styles.noticeAlt}>
            <span className={styles.badge}>提示</span>
            生成按钮会模拟进度条，方便演示前端交互。
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
              <div className={styles.modalTitle}>新用户福利</div>
              <div className={styles.modalCaption}>站内同款活动提示区</div>
            </div>
            <button className={styles.closeBtn} onClick={() => setShowActivity(false)}>
              ×
            </button>
          </div>
          <div className={styles.activityBlock}>
            <div className={styles.activityTitle}>🎉 注册即送 10 张测试图</div>
            <p className={styles.activityText}>
              体验 gpt-4o-image / Gemini 2.5 Flash，批量、垫图、对比等功能一次到位。
            </p>
            <div className={styles.activityGrid}>
              <div className={styles.activityItem}>极速出图 · 低延迟</div>
              <div className={styles.activityItem}>支持批量与模型对比</div>
              <div className={styles.activityItem}>历史留存 · 方便复现</div>
            </div>
            <button className={styles.primaryBtn} onClick={() => setShowActivity(false)}>
              了解了
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
          <p>暂无历史记录，先生成一张吧。</p>
        </div>
      );
    }
    return (
      <div className={styles.historyGrid}>
        {history.map((item) => (
          <div key={item.id} className={styles.historyCard}>
            <div className={styles.historyHead}>
              <span className={styles.badge}>{item.type}</span>
              <span className={styles.historyTime}>{formatTime(item.timestamp)}</span>
            </div>
            <div className={styles.historyTitle}>{item.title}</div>
            <div className={styles.historyDetail}>{item.detail}</div>
            {item.preview && (
              <div className={styles.historyPreview}>
                <img src={item.preview} alt={item.title} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className={styles.dashboard}>
      <div className={styles.gradient} />
      <div className={styles.inner}>
        <div className={styles.tabBar}>
          {[
            { key: "generate", label: "图片编辑", icon: "✨" },
            { key: "batch", label: "批量生成", icon: "🧩" },
            { key: "compare", label: "模型对比", icon: "⚖️" },
            { key: "history", label: "历史记录", icon: "📜" },
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

        {activeTab === "generate" && (
          <div className={styles.panel}>
            <div className={`${styles.panelGrid} ${styles.generateGrid}`}>
              <div className={styles.column}>
                <div className={styles.modelBar}>
                  <div>
                    <div className={styles.modelLabel}>Selected Model</div>
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
                    Change Model
                  </button>
                </div>

                <div className={styles.sectionHeader}>
                  <div>
                    <div className={styles.sectionTitle}>图生图 / 文生图</div>
                    <div className={styles.sectionCaption}>支持垫图，最多 3 张</div>
                  </div>
                </div>
                <div
                  className={`${styles.uploadArea} ${
                    isDragging ? styles.uploadAreaActive : ""
                  } ${referenceImages.length ? styles.uploadAreaFilled : ""}`}
                  onClick={() => referenceInputRef.current?.click()}
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
                      <div className={styles.uploadTitle}>点击或拖拽上传参考图片</div>
                      <div className={styles.uploadHint}>支持 JPG / PNG · 最多 3 张</div>
                    </div>
                  </div>
                  {referenceImages.length > 0 && (
                    <div className={styles.uploadPreviewRow}>
                      {referenceImages.map((img) => (
                        <div key={img.id} className={styles.uploadThumbInline}>
                          <img src={img.url} alt={img.name} />
                          <button
                            className={styles.removeInlineBtn}
                            aria-label="移除图片"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(img.id, setReferenceImages);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {referenceImages.length < 3 && (
                        <button
                          className={styles.uploadAdd}
                          onClick={(e) => {
                            e.stopPropagation();
                            referenceInputRef.current?.click();
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
                      handleImageUpload(e.target.files, setReferenceImages, 3);
                      if (e.target) e.target.value = "";
                    }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <div className={styles.sectionHeader}>
                    <label className={styles.label}>提示词</label>
                    <button
                      className={styles.linkBtn}
                      onClick={() => setTemplateTarget("generate") || setShowTemplates(true)}
                    >
                      提示词模板
                    </button>
                  </div>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder={promptTemplatesByTarget.generate}
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                  />
                  <div className={styles.promptActions}>
                    <button className={`${styles.ghostBtn} ${styles.clearBtn}`} onClick={handleClearGenerate}>
                      清空
                    </button>
                    <div className={styles.generateWrap}>
                      <div className={styles.generateMeta}>预计消耗：{activeModel.points}</div>
                      <button className={styles.primaryBtn} onClick={handleGenerate}>
                        开始生成
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.gridTwo}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>比例</label>
                    <select
                      className={styles.select}
                      value={ratio}
                      onChange={(e) => setRatio(e.target.value)}
                    >
                      {ratioOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>生成数量</label>
                    <select
                      className={styles.select}
                      value={generateCount}
                      onChange={(e) => setGenerateCount(e.target.value)}
                    >
                      <option value="1">1 张</option>
                      <option value="2">2 张</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>分辨率</label>
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
                    <div className={styles.sectionTitle}>生成结果</div>
                    <div className={styles.tabRow}>
                      {["result", "original", "compare"].map((key) => (
                        <button
                          key={key}
                          className={`${styles.subTab} ${
                            resultTab === key ? styles.active : ""
                          }`}
                          onClick={() => setResultTab(key as ResultTab)}
                        >
                          {key === "result" && "生成结果"}
                          {key === "original" && "原图/参考图"}
                          {key === "compare" && "前后对比"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.resultArea}>
                    {resultTab === "result" && (
                      <div className={styles.resultGrid}>
                        {results.length ? (
                          results.map((item) => (
                            <div key={item.id} className={styles.resultCard}>
                              <img src={item.url} alt={item.prompt} />
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
                                  下载
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.placeholder}>
                            <div className={styles.placeholderIcon}>🎨</div>
                            <p>生成的图片会出现在这里</p>
                          </div>
                        )}
                      </div>
                    )}

                    {resultTab === "original" && (
                      <div className={styles.resultGrid}>
                        {referenceImages.length ? (
                          referenceImages.map((img) => (
                            <div key={img.id} className={styles.resultCard}>
                              <img src={img.url} alt={img.name} />
                              <div className={styles.resultMeta}>
                                <div className={styles.resultTitle}>{img.name}</div>
                                <div className={styles.resultInfo}>{img.size}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.placeholder}>
                            <div className={styles.placeholderIcon}>🖼️</div>
                            <p>还没有参考图</p>
                          </div>
                        )}
                      </div>
                    )}

                    {resultTab === "compare" && (
                      <div className={styles.compareGrid}>
                        <div>
                          <div className={styles.sectionCaption}>参考图</div>
                          <div className={styles.resultGrid}>
                            {referenceImages.length ? (
                              referenceImages.map((img) => (
                                <div key={img.id} className={styles.resultCard}>
                                  <img src={img.url} alt={img.name} />
                                </div>
                              ))
                            ) : (
                              <div className={styles.placeholderSmall}>上传参考图后显示</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className={styles.sectionCaption}>生成结果</div>
                          <div className={styles.resultGrid}>
                            {results.length ? (
                              results.map((item) => (
                                <div key={item.id} className={styles.resultCard}>
                                  <img src={item.url} alt={item.prompt} />
                                </div>
                              ))
                            ) : (
                              <div className={styles.placeholderSmall}>生成后展示对比</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {(isGenerating || progress > 0) && (
                      <div className={styles.progressBlock}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className={styles.progressText}>
                          正在生成图片... {progress.toFixed(0)}%
                        </div>
                      </div>
                    )}
                    {error && <div className={styles.errorNote}>⚠️ {error}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "batch" && (
          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>批量生成 / 抽卡模式</div>
              <div className={styles.sectionCaption}>
                参考站同款：抽卡模式或多提示词批量生成
              </div>
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
                    🎰 抽卡模式
                  </button>
                  <button
                    className={`${styles.toggleBtn} ${
                      batchMode === "multi" ? styles.active : ""
                    }`}
                    onClick={() => setBatchMode("multi")}
                  >
                    📋 多提示词
                  </button>
                </div>

                {batchMode === "card" && (
                  <>
                    <div className={styles.inputGroup}>
                      <div className={styles.sectionHeader}>
                        <label className={styles.label}>提示词</label>
                        <button
                          className={styles.linkBtn}
                          onClick={() =>
                            setTemplateTarget("batch") || setShowTemplates(true)
                          }
                        >
                          模板
                        </button>
                      </div>
                      <textarea
                        className={styles.textarea}
                        rows={5}
                        value={cardPrompt}
                        placeholder={promptTemplatesByTarget.batch}
                        onChange={(e) => setCardPrompt(e.target.value)}
                      />
                      <div className={styles.inputNote}>一条提示词，生成多张风格相近的图片</div>
                    </div>

                    <div className={styles.sliderRow}>
                      <label className={styles.label}>生成数量（抽卡张数）</label>
                      <div className={styles.sliderValue}>{cardCount} 张</div>
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
                      <label className={styles.label}>批量提示词（空行分隔）</label>
                      <button
                        className={styles.linkBtn}
                        onClick={() =>
                          setTemplateTarget("batch-multi") || setShowTemplates(true)
                        }
                      >
                        模板
                      </button>
                    </div>
                    <textarea
                      className={styles.textarea}
                      rows={7}
                      value={batchPrompts}
                      placeholder={promptTemplatesByTarget["batch-multi"]}
                      onChange={(e) => setBatchPrompts(e.target.value)}
                    />
                    <div className={styles.inputNote}>
                      用空行分隔不同提示词，支持多行描述
                    </div>
                  </div>
                )}

                <div className={styles.gridThree}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>尺寸</label>
                    <select
                      className={styles.select}
                      value={batchRatio}
                      onChange={(e) => setBatchRatio(e.target.value)}
                    >
                      <option value="auto">自适应</option>
                      {ratioOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>每条数量</label>
                    <select
                      className={styles.select}
                      value={batchCount}
                      onChange={(e) => setBatchCount(e.target.value)}
                    >
                      <option value="1">1 张</option>
                      <option value="2">2 张</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>并发</label>
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
                    清空
                  </button>
                  <button className={styles.primaryBtn} onClick={handleBatchGenerate}>
                    开始批量
                  </button>
                </div>
              </div>

              <div className={styles.column}>
                <div className={styles.sectionHeader}>
                  <div>
                    <div className={styles.sectionTitle}>批量参考图</div>
                    <div className={styles.sectionCaption}>与参考站一致的垫图体验</div>
                  </div>
                  <button
                    className={styles.linkBtn}
                    onClick={() => batchReferenceInputRef.current?.click()}
                  >
                    上传
                  </button>
                </div>
                <div
                  className={styles.uploadArea}
                  onClick={() => batchReferenceInputRef.current?.click()}
                >
                  <div className={styles.uploadIcon}>🖇️</div>
                  <div className={styles.uploadTitle}>点击上传或粘贴图片</div>
                  <div className={styles.uploadHint}>可选 · 最多 3 张</div>
                  <input
                    ref={batchReferenceInputRef}
                    type="file"
                    className={styles.hiddenInput}
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e.target.files, setBatchReferenceImages, 3)
                    }
                  />
                </div>
                {renderUploadList(batchReferenceImages, (id) =>
                  removeImage(id, setBatchReferenceImages)
                )}

                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>生成结果</div>
                  <div className={styles.sectionCaption}>完成后自动排列卡片</div>
                </div>
                <div className={styles.resultGrid}>
                  {batchResults.length ? (
                    batchResults.map((item) => (
                      <div key={item.id} className={styles.resultCard}>
                        <img src={item.url} alt={item.prompt} />
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
                            下载
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.placeholder}>
                      <div className={styles.placeholderIcon}>🧩</div>
                      <p>批量结果将在这里显示</p>
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
                      批量进行中... {batchProgress.toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "compare" && (
          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>模型对比</div>
              <div className={styles.sectionCaption}>左右选择模型，输出并行对比</div>
            </div>
            <div className={styles.panelGrid}>
              <div className={styles.column}>
                <div className={styles.gridTwo}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>左侧模型</label>
                    <select
                      className={styles.select}
                      value={compareLeftModel}
                      onChange={(e) => setCompareLeftModel(e.target.value)}
                    >
                      <option value="">选择模型</option>
                      {modelOptions.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>右侧模型</label>
                    <select
                      className={styles.select}
                      value={compareRightModel}
                      onChange={(e) => setCompareRightModel(e.target.value)}
                    >
                      <option value="">选择模型</option>
                      {modelOptions.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <div className={styles.sectionHeader}>
                    <label className={styles.label}>提示词</label>
                    <button
                      className={styles.linkBtn}
                      onClick={() => setTemplateTarget("compare") || setShowTemplates(true)}
                    >
                      模板
                    </button>
                  </div>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={comparePrompt}
                    placeholder={promptTemplatesByTarget.compare}
                    onChange={(e) => setComparePrompt(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>共同支持尺寸</label>
                  <select
                    className={styles.select}
                    value={compareRatio}
                    onChange={(e) => setCompareRatio(e.target.value)}
                  >
                    {ratioOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
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
                    }}
                  >
                    清空
                  </button>
                  <button className={styles.primaryBtn} onClick={handleCompare}>
                    开始对比
                  </button>
                </div>
              </div>

              <div className={styles.column}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>参考图（可选）</div>
                  <div className={styles.sectionCaption}>最多 3 张</div>
                </div>
                <div
                  className={styles.uploadArea}
                  onClick={() => compareReferenceInputRef.current?.click()}
                >
                  <div className={styles.uploadIcon}>☁️</div>
                  <div className={styles.uploadTitle}>点击上传或拖拽</div>
                  <div className={styles.uploadHint}>JPG / PNG / GIF</div>
                  <input
                    ref={compareReferenceInputRef}
                    type="file"
                    className={styles.hiddenInput}
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e.target.files, setCompareReferenceImages, 3)
                    }
                  />
                </div>
                {renderUploadList(compareReferenceImages, (id) =>
                  removeImage(id, setCompareReferenceImages)
                )}

                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>对比结果</div>
                  <div className={styles.sectionCaption}>按参考站布局展示</div>
                </div>
                {compareResults.length ? (
                  compareResults.map((item) => (
                    <div key={item.id} className={styles.compareResult}>
                      <div className={styles.compareItem}>
                        <div className={styles.compareLabel}>{item.leftModel}</div>
                        <img src={item.left} alt={item.leftModel} />
                      </div>
                      <div className={styles.compareItem}>
                        <div className={styles.compareLabel}>{item.rightModel}</div>
                        <img src={item.right} alt={item.rightModel} />
                      </div>
                      <div className={styles.resultMeta}>
                        <div className={styles.resultTitle}>{item.prompt}</div>
                        <div className={styles.resultInfo}>比例 {item.ratio}</div>
                      </div>
                      <div className={styles.resultActions}>
                        <button
                          className={styles.ghostBtn}
                          onClick={() => downloadImage(item.left, `${item.id}-left.png`)}
                        >
                          下载左侧
                        </button>
                        <button
                          className={styles.ghostBtn}
                          onClick={() => downloadImage(item.right, `${item.id}-right.png`)}
                        >
                          下载右侧
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.placeholder}>
                    <div className={styles.placeholderIcon}>⚖️</div>
                    <p>对比结果将在这里显示</p>
                  </div>
                )}

                {showEvaluation && (
                  <div className={styles.evaluationBar}>
                    <span>觉得哪一侧更好？</span>
                    <div className={styles.buttonRow}>
                      <button className={styles.ghostBtn}>左侧更好</button>
                      <button className={styles.ghostBtn}>一样好</button>
                      <button className={styles.primaryBtn}>右侧更好</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && <div className={styles.panel}>{renderHistory()}</div>}
      </div>

      {renderTemplateModal()}
      {renderModelModal()}
      {renderSettingsModal()}
      {renderGuideModal()}
      {renderActivityModal()}
    </section>
  );
};

export default Dashboard;
