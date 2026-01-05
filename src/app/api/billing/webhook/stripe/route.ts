import { NextRequest, NextResponse } from "next/server";
import { handleBillingEvent } from "@/lib/billing/handleEvent";
import type { BillingEvent } from "@/lib/billing/types";

/**
 * Stripe webhook 路由（占位版本）。
 *
 * TODO：
 * - 使用 `Stripe-Signature` + `STRIPE_WEBHOOK_SECRET` 做验签
 * - 将 Stripe event 映射为我们的 `BillingEvent`
 *
 * 目前先接受一个已经符合 `BillingEvent` 结构的 JSON，
 * 便于在接入 Stripe SDK 前先验证积分/订阅逻辑。
 */
export async function POST(req: NextRequest) {
  const event = (await req.json().catch(() => null)) as BillingEvent | null;
  if (!event || event.provider !== "stripe") {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const result = await handleBillingEvent(event);
  return NextResponse.json({ ...result, ok: true });
}
