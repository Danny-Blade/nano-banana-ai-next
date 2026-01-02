import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { chargeCredits, getModelCost, refundCredits } from "@/lib/credits";
import { requireD1, nowSeconds } from "@/lib/d1";
import { getUserById } from "@/lib/users";
import { newId } from "@/lib/id";

const API_BASE =
  process.env.APIYI_API_BASE_URL?.replace(/\/+$/, "") || "https://api.apiyi.com";
const GEMINI_BASE = `${API_BASE}/v1beta/models`;
const OPENAI_CHAT_URL = `${API_BASE}/v1/chat/completions`;
const OPENAI_IMAGES_GENERATIONS_URL = `${API_BASE}/v1/images/generations`;
const OPENAI_IMAGES_EDITS_URL = `${API_BASE}/v1/images/edits`;

/**
 * 上游 API Key（服务端环境变量）。
 * 注意：不要使用 `NEXT_PUBLIC_` 前缀（否则会打包进前端）。
 */
const getApiKey = () =>
  process.env.APIYI_API_KEY || process.env.NANO_BANANA_API_KEY || "";

type RequestBody = {
  model?: string;
  prompt?: string;
  aspectRatio?: string;
  imageSize?: "1K" | "2K" | "4K";
  referenceImages?: string[];
  quality?: "standard" | "hd";
};

const GEMINI_MODEL_MAP: Record<string, string> = {
  "nano-banana": "gemini-2.5-flash-image",
  "nano-banana-pro": "gemini-3-pro-image-preview",
};

const SEEDREAM_MODEL_MAP: Record<string, string> = {
  "seedream-4-0": "seedream-4-0-250828",
  "seedream-4-5": "seedream-4-5-251128",
};

/**
 * 根据 imageSize 和 aspectRatio 计算 SeeDream 使用的像素尺寸。
 * SeeDream API 需要标准 OpenAI 格式的 size 参数（如 "1024x1024"）。
 * 注意：SeeDream 4.5 要求最小像素数为 3,686,400（约 1920x1920）。
 */
const getSeedreamSize = (
  imageSize: "1K" | "2K" | "4K",
  aspectRatio: string
): string => {
  // SeeDream 4.5 要求最小 3,686,400 像素，所以基础分辨率需要足够大
  // 使用 3072 作为基础，确保极端宽高比（如 21:9）也满足最小像素要求
  // 3072x1344 (21:9 对齐后) = 4,128,768 像素 > 3,686,400 ✓
  const baseResolution: Record<string, number> = {
    "1K": 3072,
    "2K": 3072,
    "4K": 4096,
  };

  const base = baseResolution[imageSize] || 3072;

  // 解析宽高比
  const [wStr, hStr] = aspectRatio.split(":");
  const w = parseInt(wStr, 10) || 1;
  const h = parseInt(hStr, 10) || 1;

  if (w === h) {
    return `${base}x${base}`;
  }

  // 计算实际像素尺寸，保持宽高比
  // 以较长边为基准
  const ratio = w / h;
  let width: number;
  let height: number;

  if (ratio > 1) {
    // 宽 > 高
    width = base;
    height = Math.round(base / ratio);
  } else {
    // 高 > 宽
    height = base;
    width = Math.round(base * ratio);
  }

  // 对齐到 64 像素（部分 API 要求）
  width = Math.round(width / 64) * 64;
  height = Math.round(height / 64) * 64;

  return `${width}x${height}`;
};

const base64ToBlob = (base64: string, mimeType: string) => {
  // Cloudflare Workers 不保证存在 Node 的 `Buffer`，优先使用 Web API。
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mimeType });
  }
  // 在没有 `atob` 的 Node 环境下做兼容回退。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BufferRef = (globalThis as any).Buffer as
    | { from(data: string, encoding: string): Uint8Array }
    | undefined;
  if (!BufferRef) throw new Error("Missing base64 decoder");
  const bytes = BufferRef.from(base64, "base64");
  // 复制到普通 `Uint8Array<ArrayBuffer>`，避免 TS 在 BlobPart 类型上报错。
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: mimeType });
};

const parseDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
};

const fetchWithTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs: number
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const extractMarkdownImageUrls = (text: string) => {
  const urls: string[] = [];
  const regex = /!\[[^\]]*?\]\((https?:\/\/[^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    urls.push(match[1]);
  }
  return urls;
};

const extractDataUrls = (text: string) => {
  const urls: string[] = [];
  const regex = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    urls.push(match[0]);
  }
  return urls;
};

/**
 * 将外部图片 URL 转换为 base64
 * 用于处理 Flux 等模型返回的外部 URL，确保客户端可以直接下载
 */
const fetchImageAsBase64 = async (
  imageUrl: string
): Promise<{ data: string; mimeType: string } | null> => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "image/png";
    const arrayBuffer = await response.arrayBuffer();

    // 使用 Web API 或 Node Buffer 转换为 base64
    let base64: string;
    if (typeof btoa === "function") {
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const BufferRef = (globalThis as any).Buffer as
        | { from(data: ArrayBuffer): { toString(encoding: string): string } }
        | undefined;
      if (!BufferRef) return null;
      base64 = BufferRef.from(arrayBuffer).toString("base64");
    }

    return { data: base64, mimeType: contentType };
  } catch {
    return null;
  }
};

const formatUpstreamError = (record: Record<string, unknown>): string | null => {
  const err = record.error;
  if (err && typeof err === "object") {
    const errRecord = err as Record<string, unknown>;
    const message =
      typeof errRecord.message === "string" && errRecord.message.trim()
        ? errRecord.message
        : null;
    const localized =
      typeof errRecord.localized_message === "string" &&
      errRecord.localized_message.trim()
        ? errRecord.localized_message
        : null;
    const code =
      typeof errRecord.code === "string" && errRecord.code.trim()
        ? errRecord.code
        : null;
    const type =
      typeof errRecord.type === "string" && errRecord.type.trim()
        ? errRecord.type
        : null;
    const param =
      typeof errRecord.param === "string" && errRecord.param.trim()
        ? errRecord.param
        : null;

    const primary = localized ?? message ?? code ?? null;
    if (primary) {
      const suffix = param ? ` (param: ${param})` : "";
      return type && primary !== type ? `${type}: ${primary}${suffix}` : `${primary}${suffix}`;
    }
    if (type) return type;
  }

  const topMessage =
    typeof record.message === "string" && record.message.trim()
      ? record.message
      : null;
  return topMessage;
};

const readUpstreamError = async (response: Response) => {
  try {
    const data: unknown = await response.json();
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data) as unknown;
        if (parsed && typeof parsed === "object") {
          const formatted = formatUpstreamError(parsed as Record<string, unknown>);
          if (formatted) return formatted;
          return JSON.stringify(parsed);
        }
      } catch {
        return data;
      }
      return data;
    }
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      const err = record.error;
      if (typeof err === "string") return err;
      if (err && typeof err === "object") {
        const errRecord = err as Record<string, unknown>;
        const message =
          typeof errRecord.message === "string" ? errRecord.message : null;
        const type = typeof errRecord.type === "string" ? errRecord.type : null;
        if (message) return type ? `${type}: ${message}` : message;
      }
      const formatted = formatUpstreamError(record);
      if (formatted) return formatted;
    }
    return JSON.stringify(data);
  } catch {
    return await response.text();
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const {
      model,
      prompt,
      aspectRatio = "1:1",
      imageSize = "2K",
      referenceImages = [],
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400, statusText: "Missing prompt" }
      );
    }
    if (!model) {
      return NextResponse.json(
        { error: "Model is required" },
        { status: 400, statusText: "Missing model" }
      );
    }
    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "API key 未配置。请在服务器环境设置 APIYI_API_KEY 或 NANO_BANANA_API_KEY（不要用 NEXT_PUBLIC 前缀），然后重新部署/重启服务。",
        },
        { status: 500, statusText: "Missing API key" }
      );
    }

    // 必须登录：生图需要扣对应用户的积分。
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 模型价格以服务端为准（防止客户端篡改）。
    const cost = await getModelCost(model);
    if (cost == null) {
      return NextResponse.json(
        { error: `Unsupported/disabled model pricing: ${model}` },
        { status: 400, statusText: "Unsupported model" }
      );
    }

    const jobId = newId("job");
    const now = nowSeconds();
    const db = requireD1();

    const charged = await chargeCredits({
      userId,
      amount: cost,
      reason: "generation_charge",
      refProvider: null,
      refId: jobId,
    });

    if (!charged) {
      return NextResponse.json({ error: "积分不足" }, { status: 402 });
    }

    const creditsAfterCharge = await getUserById(userId);
    const remainingCredits = creditsAfterCharge?.credits_balance ?? null;

    const success = (payload: Record<string, unknown>) =>
      NextResponse.json({
        ...payload,
        credits: remainingCredits,
      });

    // 记录任务到 DB：用于历史/审计。
    //（目前是同步返回；长耗时建议迁移到 Queues 异步执行。）
    try {
      await db
        .prepare(
          `
        INSERT INTO generation_jobs(
          id, user_id, model_key, cost_credits, prompt, aspect_ratio, image_size,
          status, error, output_r2_key, created_at, updated_at
        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `.trim()
        )
        .bind(
          jobId,
          userId,
          model,
          cost,
          prompt,
          aspectRatio,
          imageSize,
          "running",
          null,
          null,
          now,
          now
        )
        .run();
    } catch (err) {
      // 如果任务记录写入失败，必须退款，避免用户“扣了积分但无记录”。
      await refundCredits({
        userId,
        amount: cost,
        reason: "generation_refund",
        refProvider: null,
        refId: jobId,
      });
      throw err;
    }

    const markFailed = async (message: string, status?: number) => {
      await db
        .prepare(
          `UPDATE generation_jobs SET status = ?, error = ?, updated_at = ? WHERE id = ?`
        )
        .bind(
          "failed",
          status ? `${status}: ${message}` : message,
          nowSeconds(),
          jobId
        )
        .run();
    };

    const markSucceeded = async () => {
      await db
        .prepare(
          `UPDATE generation_jobs SET status = ?, updated_at = ? WHERE id = ?`
        )
        .bind("succeeded", nowSeconds(), jobId)
        .run();
    };

    try {
    if (model in GEMINI_MODEL_MAP) {
      const geminiModel = GEMINI_MODEL_MAP[model];
      const apiUrl = `${GEMINI_BASE}/${geminiModel}:generateContent`;
      const parts: Array<Record<string, unknown>> = [];

      for (const img of referenceImages) {
        const parsed = parseDataUrl(img);
        if (parsed?.data) {
          parts.push({
            inlineData: { mimeType: parsed.mimeType, data: parsed.data },
          });
        }
      }

      parts.push({ text: prompt });

      const response = await fetchWithTimeout(
        apiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            contents: [{ parts, role: "user" }],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: { aspectRatio, imageSize },
            },
          }),
        },
        imageSize === "4K" ? 360_000 : imageSize === "2K" ? 300_000 : 180_000
      );

      if (!response.ok) {
        const errorText = await readUpstreamError(response);
        await markFailed(errorText || "Upstream request failed", response.status);
        await refundCredits({
          userId,
          amount: cost,
          reason: "generation_refund",
          refProvider: null,
          refId: jobId,
        });
        return NextResponse.json(
          { error: errorText || "Upstream request failed" },
          { status: response.status, statusText: response.statusText }
        );
      }

      const data = await response.json();
      const inlineData =
        data?.candidates?.[0]?.content?.parts?.[0]?.inlineData || null;

      if (!inlineData?.data) {
        await markFailed("No image returned from API", 502);
        await refundCredits({
          userId,
          amount: cost,
          reason: "generation_refund",
          refProvider: null,
          refId: jobId,
        });
        return NextResponse.json(
          { error: "No image returned from API" },
          { status: 502, statusText: "Invalid response" }
        );
      }

      await markSucceeded();
      return success({
        imageData: inlineData.data as string,
        mimeType: inlineData.mimeType || "image/png",
      });
    }

    if (model === "sora-image") {
      const hasRefs = referenceImages.length > 0;
      const content = hasRefs
        ? [
            { type: "text", text: prompt },
            ...referenceImages.map((url) => ({
              type: "image_url",
              image_url: { url },
            })),
          ]
        : prompt;

      const payload = {
        model: "sora_image",
        messages: [{ role: "user", content }],
      };

      const response = await fetchWithTimeout(
        OPENAI_CHAT_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        },
        240_000
      );

      if (!response.ok) {
        const errorText = await readUpstreamError(response);
        await markFailed(errorText || "Upstream request failed", response.status);
        await refundCredits({
          userId,
          amount: cost,
          reason: "generation_refund",
          refProvider: null,
          refId: jobId,
        });
        return NextResponse.json(
          { error: errorText || "Upstream request failed" },
          { status: response.status, statusText: response.statusText }
        );
      }

      const data = await response.json();
      const contentText: string =
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.message?.contentText ||
        "";

      const markdownUrls = extractMarkdownImageUrls(contentText);
      if (markdownUrls.length) {
        await markSucceeded();
        return success({ imageUrl: markdownUrls[0] });
      }

      const dataUrls = extractDataUrls(contentText);
      if (dataUrls.length) {
        const parsed = parseDataUrl(dataUrls[0]);
        if (parsed?.data) {
          await markSucceeded();
          return success({
            imageData: parsed.data,
            mimeType: parsed.mimeType || "image/png",
          });
        }
      }

      await markFailed("No image returned from API", 502);
      await refundCredits({
        userId,
        amount: cost,
        reason: "generation_refund",
        refProvider: null,
        refId: jobId,
      });
      return NextResponse.json(
        { error: "No image returned from API" },
        { status: 502, statusText: "Invalid response" }
      );
    }

    if (model.startsWith("flux-")) {
      const upstreamModel = model;
      const extraBody: Record<string, unknown> = {};
      if (aspectRatio && aspectRatio !== "auto") {
        extraBody.aspect_ratio = aspectRatio;
      }

      if (referenceImages.length > 0) {
        const parsed = parseDataUrl(referenceImages[0]);
        if (!parsed?.data) {
          await markFailed("Invalid reference image", 400);
          await refundCredits({
            userId,
            amount: cost,
            reason: "generation_refund",
            refProvider: null,
            refId: jobId,
          });
          return NextResponse.json(
            { error: "Invalid reference image" },
            { status: 400 }
          );
        }

        const blob = base64ToBlob(parsed.data, parsed.mimeType);
        const form = new FormData();
        form.append("model", upstreamModel);
        form.append("prompt", prompt);
        form.append("image", blob, "input.png");
        if (Object.keys(extraBody).length) {
          form.append("extra_body", JSON.stringify(extraBody));
        }

        const response = await fetchWithTimeout(
          OPENAI_IMAGES_EDITS_URL,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            body: form,
          },
          240_000
        );

        if (!response.ok) {
          const errorText = await readUpstreamError(response);
          await markFailed(errorText || "Upstream request failed", response.status);
          await refundCredits({
            userId,
            amount: cost,
            reason: "generation_refund",
            refProvider: null,
            refId: jobId,
          });
          return NextResponse.json(
            { error: errorText || "Upstream request failed" },
            { status: response.status, statusText: response.statusText }
          );
        }

        const data = await response.json();
        const item = data?.data?.[0];
        if (item?.b64_json) {
          await markSucceeded();
          return success({
            imageData: item.b64_json as string,
            mimeType: "image/png",
          });
        }
        if (item?.url) {
          // 将外部 URL 转换为 base64，确保客户端可以直接下载
          const imageBase64 = await fetchImageAsBase64(item.url);
          if (imageBase64) {
            await markSucceeded();
            return success({
              imageData: imageBase64.data,
              mimeType: imageBase64.mimeType,
            });
          }
          // 如果转换失败，返回原始 URL（客户端需要通过代理下载）
          await markSucceeded();
          return success({ imageUrl: item.url as string });
        }
        await markFailed("No image returned from API", 502);
        await refundCredits({
          userId,
          amount: cost,
          reason: "generation_refund",
          refProvider: null,
          refId: jobId,
        });
        return NextResponse.json(
          { error: "No image returned from API" },
          { status: 502, statusText: "Invalid response" }
        );
      }

      const payload: Record<string, unknown> = {
        model: upstreamModel,
        prompt,
      };
      if (Object.keys(extraBody).length) {
        payload.extra_body = extraBody;
      }

      const response = await fetchWithTimeout(
        OPENAI_IMAGES_GENERATIONS_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        },
        240_000
      );

      if (!response.ok) {
        const errorText = await readUpstreamError(response);
        await markFailed(errorText || "Upstream request failed", response.status);
        await refundCredits({
          userId,
          amount: cost,
          reason: "generation_refund",
          refProvider: null,
          refId: jobId,
        });
        return NextResponse.json(
          { error: errorText || "Upstream request failed" },
          { status: response.status, statusText: response.statusText }
        );
      }

      const data = await response.json();
      const item = data?.data?.[0];
      if (item?.b64_json) {
        await markSucceeded();
        return success({
          imageData: item.b64_json as string,
          mimeType: "image/png",
        });
      }
      if (item?.url) {
        // 将外部 URL 转换为 base64，确保客户端可以直接下载
        const imageBase64 = await fetchImageAsBase64(item.url);
        if (imageBase64) {
          await markSucceeded();
          return success({
            imageData: imageBase64.data,
            mimeType: imageBase64.mimeType,
          });
        }
        // 如果转换失败，返回原始 URL（客户端需要通过代理下载）
        await markSucceeded();
        return success({ imageUrl: item.url as string });
      }
      await markFailed("No image returned from API", 502);
      await refundCredits({
        userId,
        amount: cost,
        reason: "generation_refund",
        refProvider: null,
        refId: jobId,
      });
      return NextResponse.json(
        { error: "No image returned from API" },
        { status: 502, statusText: "Invalid response" }
      );
    }

    if (model.startsWith("seedream")) {
      const upstreamModel = SEEDREAM_MODEL_MAP[model] || model;
      const resolvedQuality =
        body.quality ||
        (imageSize === "4K" ? "hd" : "standard");

      const hasRefs = referenceImages.length > 0;
      let response: Response;

      if (hasRefs) {
        const parsed = parseDataUrl(referenceImages[0]);
        if (!parsed?.data) {
          await markFailed("Invalid reference image", 400);
          await refundCredits({
            userId,
            amount: cost,
            reason: "generation_refund",
            refProvider: null,
            refId: jobId,
          });
          return NextResponse.json(
            { error: "Invalid reference image" },
            { status: 400 }
          );
        }

        const blob = base64ToBlob(parsed.data, parsed.mimeType);
        const seedreamSize = getSeedreamSize(imageSize, aspectRatio);
        const form = new FormData();
        form.append("model", upstreamModel);
        form.append("prompt", prompt);
        form.append("image", blob, "input.png");
        form.append("size", seedreamSize);
        form.append("quality", resolvedQuality);
        form.append("response_format", "b64_json");

        response = await fetchWithTimeout(
          OPENAI_IMAGES_EDITS_URL,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            body: form,
          },
          240_000
        );
      } else {
        const seedreamSize = getSeedreamSize(imageSize, aspectRatio);
        const payload: Record<string, unknown> = {
          model: upstreamModel,
          prompt,
          size: seedreamSize,
          quality: resolvedQuality,
          response_format: "b64_json",
        };

        response = await fetchWithTimeout(
          OPENAI_IMAGES_GENERATIONS_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          },
          240_000
        );
      }

      if (!response.ok) {
        const errorText = await readUpstreamError(response);
        await markFailed(errorText || "Upstream request failed", response.status);
        await refundCredits({
          userId,
          amount: cost,
          reason: "generation_refund",
          refProvider: null,
          refId: jobId,
        });
        return NextResponse.json(
          { error: errorText || "Upstream request failed" },
          { status: response.status, statusText: response.statusText }
        );
      }

      const data = await response.json();
      const item = data?.data?.[0];
      if (item?.b64_json) {
        await markSucceeded();
        return success({
          imageData: item.b64_json as string,
          mimeType: "image/png",
        });
      }
      if (item?.url) {
        await markSucceeded();
        return success({ imageUrl: item.url as string });
      }

      await markFailed("No image returned from API", 502);
      await refundCredits({
        userId,
        amount: cost,
        reason: "generation_refund",
        refProvider: null,
        refId: jobId,
      });
      return NextResponse.json(
        { error: "No image returned from API" },
        { status: 502, statusText: "Invalid response" }
      );
    }

    await markFailed(`Unsupported model: ${model}`, 400);
    await refundCredits({
      userId,
      amount: cost,
      reason: "generation_refund",
      refProvider: null,
      refId: jobId,
    });
    return NextResponse.json(
      { error: `Unsupported model: ${model}` },
      { status: 400, statusText: "Unsupported model" }
    );
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "Request timed out"
          : (error as Error)?.message || "Unknown error";
      try {
        await markFailed(message, 500);
        await refundCredits({
          userId,
          amount: cost,
          reason: "generation_refund",
          refProvider: null,
          refId: jobId,
        });
      } catch (refundErr) {
        console.error("[generate] Failed to refund after error:", refundErr);
      }
      return NextResponse.json(
        { error: message },
        { status: 500, statusText: "Request failed" }
      );
    }
  } catch (error) {
    console.error("[api/image/generate] Unhandled error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500, statusText: "Internal Server Error" }
    );
  }
}
