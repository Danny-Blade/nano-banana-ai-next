export const modelOptions = [
  { value: "nano-banana", creditsPerImage: 2 },
  { value: "nano-banana-pro", creditsPerImage: 4 },
  { value: "seedream-4-0", creditsPerImage: 5 },
  { value: "sora-image", creditsPerImage: 6 },
  { value: "flux-kontext-pro", creditsPerImage: 3 },
  { value: "flux-kontext-max", creditsPerImage: 8 },
] as const;

export const ratioOptions = [
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

export const resolutionOptions: Record<string, string[]> = {
  "nano-banana": ["2K", "1K"],
  "nano-banana-pro": ["4K", "2K", "1K"],
  "seedream-4-0": ["2K", "1K"],
  "sora-image": ["2K", "1K"],
  "flux-kontext-pro": ["2K", "1K"],
  "flux-kontext-max": ["4K", "2K"],
};

export type ModelValue = (typeof modelOptions)[number]["value"];
export type MaybeModelValue = ModelValue | "";
export type RatioValue = (typeof ratioOptions)[number]["value"];
export type BatchRatioValue = "auto" | RatioValue;

export type UploadedImage = {
  id: string;
  name: string;
  url: string;
  size: string;
};

export type GeneratedResult = {
  id: string;
  url: string;
  prompt: string;
  model: string;
  ratio: string;
  resolution: string;
};

export type BatchResult = GeneratedResult & {
  promptLabel: string;
};

export type CompareResult = {
  id: string;
  left: string;
  right: string;
  prompt: string;
  ratio: string;
  leftModel: string;
  rightModel: string;
};

export type ImageHistoryItem = {
  id: string;
  createdAt: number;
  model: ModelValue;
  prompt: string;
  aspectRatio: string;
  imageSize: string;
  costCredits: number;
  thumbnailDataUrl: string;
  imageUrl?: string;
  fileName?: string;
  savedDirName?: string;
  savedVia?: "download" | "fs";
  /** 参考图缩略图（用于 image-to-image 生成） */
  referenceImageThumbnail?: string;
  /** 参考图原始 URL */
  referenceImageUrl?: string;
};

export type LocalizedModelOption = {
  value: ModelValue;
  creditsPerImage: number;
  label: string;
  description: string;
  badge?: string;
  points: string;
};
