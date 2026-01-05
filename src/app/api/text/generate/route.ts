import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { chargeCredits, getModelCost, refundCredits } from "@/lib/credits";
import { requireD1, nowSeconds } from "@/lib/d1";
import { newId } from "@/lib/id";

const API_BASE =
  process.env.APIYI_API_BASE_URL?.replace(/\/+$/, "") || "https://api.apiyi.com";
const OPENAI_CHAT_URL = `${API_BASE}/v1/chat/completions`;

/**
 * 上游 API Key（服务端环境变量）。
 * 注意：不要使用 `NEXT_PUBLIC_` 前缀（否则会打包进前端）。
 */
const getApiKey = () =>
  process.env.APIYI_API_KEY || process.env.NANO_BANANA_API_KEY || "";

type RequestBody = {
  model?: string;
  prompt?: string;
  maxTokens?: number;
  temperature?: number;
};

const TEXT_MODEL_MAP: Record<string, string> = {
  "opus-4-5": "claude-3-5-sonnet-20241022",
  "sonnet-4-5": "claude-3-5-sonnet-20241022",
  "haiku-3-5": "claude-3-5-haiku-20241022",
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

const readUpstreamError = async (response: Response) => {
  try {
    const data: unknown = await response.json();
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
      const topMessage =
        typeof record.message === "string" ? record.message : null;
      if (topMessage) return topMessage;
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
      maxTokens = 1000,
      temperature = 0.7,
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

    // 必须登录：文本生成需要扣对应用户的积分。
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
      reason: "text_generation_charge",
      refProvider: null,
      refId: jobId,
    });

    if (!charged) {
      return NextResponse.json({ error: "积分不足" }, { status: 402 });
    }

    // 记录任务到 DB：用于历史/审计。
    try {
      await db
        .prepare(
          `
        INSERT INTO text_generation_jobs(
          id, user_id, model_key, cost_credits, prompt, max_tokens, temperature,
          status, error, output_text, created_at, updated_at
        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `.trim()
        )
        .bind(
          jobId,
          userId,
          model,
          cost,
          prompt,
          maxTokens,
          temperature,
          "running",
          null,
          null,
          now,
          now
        )
        .run();
    } catch (err) {
      // 如果任务记录写入失败，必须退款，避免用户"扣了积分但无记录"。
      await refundCredits({
        userId,
        amount: cost,
        reason: "text_generation_refund",
        refProvider: null,
        refId: jobId,
      });
      throw err;
    }

    const markFailed = async (message: string, status?: number) => {
      await db
        .prepare(
          `UPDATE text_generation_jobs SET status = ?, error = ?, updated_at = ? WHERE id = ?`
        )
        .bind(
          "failed",
          status ? `${status}: ${message}` : message,
          nowSeconds(),
          jobId
        )
        .run();
    };

    const markSucceeded = async (outputText: string) => {
      await db
        .prepare(
          `UPDATE text_generation_jobs SET status = ?, output_text = ?, updated_at = ? WHERE id = ?`
        )
        .bind("succeeded", outputText, nowSeconds(), jobId)
        .run();
    };

    try {
      const upstreamModel = TEXT_MODEL_MAP[model] || model;

      const payload = {
        model: upstreamModel,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
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
        180_000 // 3 minutes timeout
      );

      if (!response.ok) {
        const errorText = await readUpstreamError(response);
        await markFailed(errorText || "Upstream request failed", response.status);
        await refundCredits({
          userId,
          amount: cost,
          reason: "text_generation_refund",
          refProvider: null,
          refId: jobId,
        });
        return NextResponse.json(
          { error: errorText || "Upstream request failed" },
          { status: response.status, statusText: response.statusText }
        );
      }

      const data = await response.json();
      const generatedText: string =
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.message?.contentText ||
        "";

      if (!generatedText) {
        await markFailed("No text returned from API", 502);
        await refundCredits({
          userId,
          amount: cost,
          reason: "text_generation_refund",
          refProvider: null,
          refId: jobId,
        });
        return NextResponse.json(
          { error: "No text returned from API" },
          { status: 502, statusText: "Invalid response" }
        );
      }

      await markSucceeded(generatedText);

      return NextResponse.json({
        text: generatedText,
        model: upstreamModel,
        usage: data?.usage,
      });
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
          reason: "text_generation_refund",
          refProvider: null,
          refId: jobId,
        });
      } catch (refundErr) {
        console.error("[text/generate] Failed to refund after error:", refundErr);
      }
      return NextResponse.json(
        { error: message },
        { status: 500, statusText: "Request failed" }
      );
    }
  } catch (error) {
    console.error("[api/text/generate] Unhandled error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500, statusText: "Internal Server Error" }
    );
  }
}