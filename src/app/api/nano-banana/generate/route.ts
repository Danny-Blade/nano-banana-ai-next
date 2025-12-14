import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { chargeCredits, getModelCost, refundCredits } from "@/lib/credits";
import { requireD1, nowSeconds } from "@/lib/d1";
import { newId } from "@/lib/id";

const API_URL =
  "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent";

/**
 * 旧版接口（兼容历史 UI 调用）。
 * 新功能建议统一使用 `/api/image/generate`（支持多模型 + 按模型扣费）。
 */
const API_KEY = process.env.APIYI_API_KEY || process.env.NANO_BANANA_API_KEY || "";

type RequestBody = {
  prompt?: string;
  aspectRatio?: string;
  imageSize?: "1K" | "2K" | "4K";
};

const TIMEOUT_MS: Record<RequestBody["imageSize"], number> = {
  "1K": 180_000,
  "2K": 300_000,
  "4K": 360_000,
};

export async function POST(req: NextRequest) {
  const { prompt, aspectRatio = "1:1", imageSize = "2K" } =
    (await req.json()) as RequestBody;

  if (!prompt || !prompt.trim()) {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400, statusText: "Missing prompt" }
    );
  }

  if (!API_KEY) {
    return NextResponse.json(
      {
        error:
          "API key 未配置。请在服务器环境设置 APIYI_API_KEY 或 NANO_BANANA_API_KEY（不要用 NEXT_PUBLIC 前缀），然后重启服务。",
      },
      { status: 500, statusText: "Missing API key" }
    );
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  // 该接口固定调用 gemini-3-pro-image-preview，对应我们的 nano-banana-pro 定价。
  const modelKey = "nano-banana-pro";
  const cost = await getModelCost(modelKey);
  if (cost == null) {
    return NextResponse.json(
      { error: `Unsupported/disabled model pricing: ${modelKey}` },
      { status: 500 }
    );
  }

  const jobId = newId("job");
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

  const db = requireD1();
  const now = nowSeconds();
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
      modelKey,
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

  const timeout = TIMEOUT_MS[imageSize] ?? TIMEOUT_MS["2K"];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }], role: "user" }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio, imageSize },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errorText = await response.text();
      await db
        .prepare(
          `UPDATE generation_jobs SET status = ?, error = ?, updated_at = ? WHERE id = ?`
        )
        .bind(
          "failed",
          `${response.status}: ${errorText || response.statusText}`,
          nowSeconds(),
          jobId
        )
        .run();
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
      await db
        .prepare(
          `UPDATE generation_jobs SET status = ?, error = ?, updated_at = ? WHERE id = ?`
        )
        .bind("failed", "502: No image returned from API", nowSeconds(), jobId)
        .run();
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

    await db
      .prepare(`UPDATE generation_jobs SET status = ?, updated_at = ? WHERE id = ?`)
      .bind("succeeded", nowSeconds(), jobId)
      .run();
    return NextResponse.json({
      imageData: inlineData.data as string,
      mimeType: inlineData.mimeType || "image/png",
    });
  } catch (error) {
    clearTimeout(timer);
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Request timed out"
        : (error as Error)?.message || "Unknown error";
    await db
      .prepare(
        `UPDATE generation_jobs SET status = ?, error = ?, updated_at = ? WHERE id = ?`
      )
      .bind("failed", `500: ${message}`, nowSeconds(), jobId)
      .run();
    await refundCredits({
      userId,
      amount: cost,
      reason: "generation_refund",
      refProvider: null,
      refId: jobId,
    });
    return NextResponse.json(
      { error: message },
      { status: 500, statusText: "Request failed" }
    );
  }
}
