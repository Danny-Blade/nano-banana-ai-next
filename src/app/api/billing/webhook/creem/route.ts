import { NextRequest, NextResponse } from "next/server";
import { handleBillingEvent } from "@/lib/billing/handleEvent";
import type { BillingEvent } from "@/lib/billing/types";

/**
 * Creem webhook 路由（占位版本）。
 *
 * TODO：
 * - 使用 Creem webhook secret 做验签
 * - 将 Creem 原始 payload 归一化为我们的 `BillingEvent`
 *
 * 目前先接受一个已经符合 `BillingEvent` 结构的 JSON，
 * 便于在接真实 payload 前先验证 DB/积分逻辑是否正确。
 */
export async function POST(req: NextRequest) {
  const event = (await req.json().catch(() => null)) as BillingEvent | null;
  if (!event || event.provider !== "creem") {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const result = await handleBillingEvent(event);
  return NextResponse.json({ ok: true, ...result });
}
