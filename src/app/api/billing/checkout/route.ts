import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireD1, nowSeconds } from "@/lib/d1";
import { newId } from "@/lib/id";
import { getBlockingSubscription } from "@/lib/billing/subscriptions";
import { getBillingProvider } from "@/lib/billing/providers";
import type { BillingProvider, CheckoutRequest } from "@/lib/billing/types";

type ProductRow = {
  id: string;
  type: "subscription" | "one_time";
  credits: number;
  active: number;
};

const isProvider = (value: unknown): value is BillingProvider =>
  value === "creem" || value === "stripe";

/**
 * 创建托管收银台（checkout）会话。
 *
 * - 同时支持 Creem 与 Stripe（先接 Creem，后续加 Stripe 作为备选）。
 * - 强制订阅规则：订阅不可叠加；必须等结束后再订。
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as CheckoutRequest | null;
  if (!body || !isProvider(body.provider) || !body.productId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = requireD1();
  const product = await db
    .prepare(`SELECT id, type, credits, active FROM products WHERE id = ? LIMIT 1`)
    .bind(body.productId)
    .first<ProductRow>();

  if (!product || product.active !== 1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.type === "subscription") {
    const blocking = await getBlockingSubscription(userId);
    if (blocking) {
      return NextResponse.json(
        {
          error:
            "当前已有有效订阅，订阅不可叠加。请等待本期结束后再重新订阅。",
        },
        { status: 409 }
      );
    }
  }

  const now = nowSeconds();
  const orderId = newId("order");

  // 在渠道返回其规范订单号之前，先用我们自己的 `orderId` 作为占位 provider_order_id。
  // webhook 处理必须以渠道真实 id 为准，并做幂等去重。
  await db
    .prepare(
      `
      INSERT INTO orders(
        id, user_id, provider, provider_order_id, type, product_id, status,
        amount, currency, created_at, updated_at
      ) VALUES(?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)
    `.trim()
    )
    .bind(
      orderId,
      userId,
      body.provider,
      orderId,
      product.type,
      product.id,
      "created",
      now,
      now
    )
    .run();

  const origin =
    req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const adapter = getBillingProvider(body.provider);
    const { checkoutUrl } = await adapter.createCheckout({
      userId,
      productId: product.id,
      orderId,
      successUrl: `${origin}/dashboard?billing=success`,
      cancelUrl: `${origin}/pricing?billing=cancel`,
    });

    return NextResponse.json({ checkoutUrl, orderId });
  } catch (err) {
    await db
      .prepare(`UPDATE orders SET status = ?, updated_at = ? WHERE id = ?`)
      .bind("failed", nowSeconds(), orderId)
      .run();

    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json(
      { error: message },
      { status: 501, statusText: "Not implemented" }
    );
  }
}
