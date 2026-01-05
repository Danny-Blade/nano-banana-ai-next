import { NextRequest, NextResponse } from "next/server";
import { getImageFromR2 } from "@/lib/r2";

/**
 * 通过 API 代理获取 R2 图片
 * 用于没有配置 R2 公开域名的情况
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const r2Key = decodeURIComponent(key);

    // 验证 key 格式
    if (!r2Key.startsWith("images/")) {
      return NextResponse.json(
        { error: "Invalid key format" },
        { status: 400 }
      );
    }

    const result = await getImageFromR2(r2Key);
    if (!result) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    return new NextResponse(result.data, {
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[api/r2/image] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
