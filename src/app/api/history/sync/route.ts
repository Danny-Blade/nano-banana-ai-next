import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireD1 } from "@/lib/d1";
import { getImagePublicUrl } from "@/lib/r2";

export interface CloudHistoryItem {
  id: string;
  createdAt: number;
  model: string;
  prompt: string;
  aspectRatio: string;
  imageSize: string;
  costCredits: number;
  r2Key: string | null;
  r2Url: string | null;
}

interface GenerationJob {
  id: string;
  user_id: string;
  model_key: string;
  cost_credits: number;
  prompt: string;
  aspect_ratio: string;
  image_size: string;
  status: string;
  output_r2_key: string | null;
  created_at: number;
}

/**
 * 获取用户的云端历史记录
 * 用于新设备同步
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const db = requireD1();

    // 获取查询参数
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const after = url.searchParams.get("after"); // 时间戳，只获取此时间之后的记录

    let query = `
      SELECT id, user_id, model_key, cost_credits, prompt, aspect_ratio, image_size, status, output_r2_key, created_at
      FROM generation_jobs
      WHERE user_id = ? AND status = 'succeeded'
    `;
    const params: (string | number)[] = [userId];

    if (after) {
      query += ` AND created_at > ?`;
      params.push(parseInt(after, 10));
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await db
      .prepare(query)
      .bind(...params)
      .all<GenerationJob>();

    const items: CloudHistoryItem[] = result.results.map((job) => ({
      id: job.id,
      createdAt: job.created_at,
      model: job.model_key,
      prompt: job.prompt,
      aspectRatio: job.aspect_ratio,
      imageSize: job.image_size,
      costCredits: job.cost_credits,
      r2Key: job.output_r2_key,
      r2Url: job.output_r2_key ? getImagePublicUrl(job.output_r2_key) : null,
    }));

    // 获取总数
    let countQuery = `
      SELECT COUNT(*) as total
      FROM generation_jobs
      WHERE user_id = ? AND status = 'succeeded'
    `;
    const countParams: (string | number)[] = [userId];

    if (after) {
      countQuery += ` AND created_at > ?`;
      countParams.push(parseInt(after, 10));
    }

    const countResult = await db
      .prepare(countQuery)
      .bind(...countParams)
      .first<{ total: number }>();

    return NextResponse.json({
      items,
      total: countResult?.total || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[api/history/sync] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

/**
 * 获取同步状态（本地和云端的差异）
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await req.json();
    const { localIds = [] } = body as { localIds: string[] };

    const db = requireD1();

    // 获取云端所有成功的任务 ID
    const cloudResult = await db
      .prepare(
        `SELECT id FROM generation_jobs WHERE user_id = ? AND status = 'succeeded' ORDER BY created_at DESC`
      )
      .bind(userId)
      .all<{ id: string }>();

    const cloudIds = new Set(cloudResult.results.map((r) => r.id));
    const localIdSet = new Set(localIds);

    // 计算差异
    const missingInLocal = cloudResult.results
      .filter((r) => !localIdSet.has(r.id))
      .map((r) => r.id);

    const missingInCloud = localIds.filter((id) => !cloudIds.has(id));

    return NextResponse.json({
      cloudTotal: cloudIds.size,
      localTotal: localIds.length,
      missingInLocal, // 本地缺失的（需要从云端下载）
      missingInCloud, // 云端缺失的（可能是本地新生成还没上传的）
    });
  } catch (error) {
    console.error("[api/history/sync] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to check sync status" },
      { status: 500 }
    );
  }
}
