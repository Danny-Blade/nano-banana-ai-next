import type { UploadedImage } from "./types";

export const REFERENCE_IMAGE_LIMIT = 5;

export const openFileDialog = (ref: React.RefObject<HTMLInputElement | null>) => {
  const input = ref.current;
  if (!input) return;
  input.value = "";
  input.click();
};

export const handleImageUploadFiles = (
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

export const removeImage = (
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

export const handleDrop = (
  event: React.DragEvent<HTMLDivElement>,
  setter: React.Dispatch<React.SetStateAction<UploadedImage[]>>,
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
) => {
  event.preventDefault();
  setIsDragging(false);
  const dropped = Array.from(event.dataTransfer.files || []);
  handleImageUploadFiles(dropped, setter, REFERENCE_IMAGE_LIMIT);
};

export const downloadImage = async (url: string, name?: string) => {
  const filename = name || `nano-banana-${Date.now()}.png`;

  const trigger = (href: string) => {
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (url.startsWith("data:") || url.startsWith("blob:")) {
    trigger(url);
    return;
  }

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    trigger(objectUrl);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5_000);
  } catch {
    trigger(url);
  }
};

export const toDataUrl = async (objectUrl: string) => {
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

export const encodeReferenceImages = async (images: UploadedImage[]) => {
  if (!images.length) return [];
  const encoded = await Promise.all(
    images.map((img) => toDataUrl(img.url).catch(() => null))
  );
  return encoded.filter(Boolean) as string[];
};

export const createThumbnailDataUrl = async (url: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();

    const bitmap =
      typeof createImageBitmap === "function" ? await createImageBitmap(blob) : null;
    const maxSize = 320;
    const srcW = bitmap ? bitmap.width : 0;
    const srcH = bitmap ? bitmap.height : 0;
    if (!bitmap || !srcW || !srcH) return null;

    const scale = Math.min(1, maxSize / Math.max(srcW, srcH));
    const width = Math.max(1, Math.round(srcW * scale));
    const height = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);
    try {
      bitmap.close();
    } catch {
      // ignore
    }
    return canvas.toDataURL("image/jpeg", 0.78);
  } catch {
    return null;
  }
};

export const mapResolutionToImageSize = (value: string) => {
  if (value === "4K") return "4K";
  if (value === "2K") return "2K";
  return "1K";
};
