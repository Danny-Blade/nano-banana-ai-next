import { NextRequest, NextResponse } from "next/server";

// 允许代理的域名白名单
const ALLOWED_DOMAINS = [
  "aiimage.pkgames.org",
  "cdn.ainanobanana.io",
  "image.ainanobanana.io",
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);

    // 检查域名是否在白名单中
    if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403 }
      );
    }

    // 获取图片
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({
      dataUrl: `data:${contentType};base64,${base64}`,
      contentType,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
