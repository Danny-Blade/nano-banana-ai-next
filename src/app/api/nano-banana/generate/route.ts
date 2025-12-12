import { NextRequest, NextResponse } from "next/server";

const API_URL =
  "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent";

// Allow env override but fall back to the provided key for convenience.
const API_KEY = "sk-HTHfXpVZunRRGTnI70F4448c1c8e4e778b9b05A9Df5a380c";

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
      { error: "API key is not configured" },
      { status: 500, statusText: "Missing API key" }
    );
  }

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
      return NextResponse.json(
        { error: errorText || "Upstream request failed" },
        { status: response.status, statusText: response.statusText }
      );
    }

    const data = await response.json();
    const inlineData =
      data?.candidates?.[0]?.content?.parts?.[0]?.inlineData || null;

    if (!inlineData?.data) {
      return NextResponse.json(
        { error: "No image returned from API" },
        { status: 502, statusText: "Invalid response" }
      );
    }

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
    return NextResponse.json(
      { error: message },
      { status: 500, statusText: "Request failed" }
    );
  }
}
