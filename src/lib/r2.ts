/**
 * Cloudflare R2 存储封装。
 *
 * 在生产环境（Cloudflare Pages/Workers）中，把 R2 存储桶绑定为 `R2`。
 * 本项目会从 `process.env.R2` 或通过 OpenNext 上下文读取。
 */

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  httpMetadata?: {
    contentType?: string;
  };
  customMetadata?: Record<string, string>;
}

export interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
  blob(): Promise<Blob>;
}

export interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
  customMetadata?: Record<string, string>;
}

export interface R2ListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

export interface R2ListResult {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
}

export interface R2Bucket {
  put(key: string, value: ArrayBuffer | ReadableStream | string | Blob, options?: R2PutOptions): Promise<R2Object>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
  list(options?: R2ListOptions): Promise<R2ListResult>;
  head(key: string): Promise<R2Object | null>;
}

export const getR2 = (): R2Bucket | null => {
  const envR2 = (process.env as unknown as { R2?: R2Bucket }).R2;
  if (envR2) return envR2;

  const globalR2 = (globalThis as unknown as { R2?: R2Bucket }).R2;
  if (globalR2) return globalR2;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare") as typeof import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext?.();
    const r2 = (ctx?.env as unknown as { R2?: R2Bucket } | undefined)?.R2;
    if (r2) return r2;
  } catch {
    // ignore
  }

  return null;
};

export const requireR2 = (): R2Bucket => {
  const r2 = getR2();
  if (!r2) {
    throw new Error(
      "未找到 R2 存储桶绑定。请将 Cloudflare R2 存储桶绑定为 `R2`（在 wrangler.jsonc 中配置）。"
    );
  }
  return r2;
};

/**
 * 生成图片在 R2 中的存储路径
 * 格式: images/{userId}/{jobId}.{ext}
 */
export const getImageR2Key = (userId: string, jobId: string, ext = "png"): string => {
  return `images/${userId}/${jobId}.${ext}`;
};

/**
 * 从 R2 key 中提取 userId 和 jobId
 */
export const parseImageR2Key = (key: string): { userId: string; jobId: string } | null => {
  const match = key.match(/^images\/([^/]+)\/([^/]+)\.[a-z]+$/);
  if (!match) return null;
  return { userId: match[1], jobId: match[2] };
};

/**
 * 生成图片的公开访问 URL
 * 需要在 Cloudflare R2 设置中启用公开访问
 */
export const getImagePublicUrl = (r2Key: string): string => {
  const publicDomain = process.env.R2_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (publicDomain) {
    return `https://${publicDomain}/${r2Key}`;
  }
  // 如果没有配置公开域名，返回相对路径，通过 API 代理访问
  return `/api/r2/image/${encodeURIComponent(r2Key)}`;
};

/**
 * 上传图片到 R2
 */
export const uploadImageToR2 = async (params: {
  userId: string;
  jobId: string;
  imageData: ArrayBuffer | Uint8Array | string; // ArrayBuffer, Uint8Array, or base64 string
  mimeType?: string;
}): Promise<{ r2Key: string; publicUrl: string }> => {
  const { userId, jobId, imageData, mimeType = "image/png" } = params;
  const r2 = requireR2();

  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
  const r2Key = getImageR2Key(userId, jobId, ext);

  let data: ArrayBuffer;
  if (typeof imageData === "string") {
    // base64 string
    if (typeof atob === "function") {
      const binary = atob(imageData);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      data = bytes.buffer as ArrayBuffer;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const BufferRef = (globalThis as any).Buffer as
        | { from(data: string, encoding: string): Uint8Array }
        | undefined;
      if (!BufferRef) throw new Error("Missing base64 decoder");
      const bytes = BufferRef.from(imageData, "base64");
      data = bytes.buffer as ArrayBuffer;
    }
  } else if (imageData instanceof Uint8Array) {
    data = imageData.buffer as ArrayBuffer;
  } else {
    data = imageData;
  }

  await r2.put(r2Key, data, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      userId,
      jobId,
      uploadedAt: new Date().toISOString(),
    },
  });

  return {
    r2Key,
    publicUrl: getImagePublicUrl(r2Key),
  };
};

/**
 * 获取用户的所有图片列表（用于同步）
 */
export const listUserImages = async (userId: string): Promise<R2Object[]> => {
  const r2 = requireR2();
  const prefix = `images/${userId}/`;
  const objects: R2Object[] = [];
  let cursor: string | undefined;

  do {
    const result = await r2.list({ prefix, limit: 1000, cursor });
    objects.push(...result.objects);
    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);

  return objects;
};

/**
 * 从 R2 获取图片数据
 */
export const getImageFromR2 = async (r2Key: string): Promise<{
  data: ArrayBuffer;
  mimeType: string;
} | null> => {
  const r2 = requireR2();
  const object = await r2.get(r2Key);
  if (!object) return null;

  const data = await object.arrayBuffer();
  const mimeType = object.httpMetadata?.contentType || "image/png";

  return { data, mimeType };
};

/**
 * 删除 R2 中的图片
 */
export const deleteImageFromR2 = async (r2Key: string): Promise<void> => {
  const r2 = requireR2();
  await r2.delete(r2Key);
};
