export type BillingProvider = "creem" | "stripe";

export type ProductType = "subscription" | "one_time";

export type CheckoutRequest = {
  provider: BillingProvider;
  productId: string;
};

/**
 * 统一的 checkout 返回结构（给前端使用）。
 * 大多数渠道是一个跳转 URL（托管收银台）。
 */
export type CheckoutResponse = {
  checkoutUrl: string;
  orderId: string;
};

/**
 * 统一的 webhook 事件结构。
 *
 * 各支付渠道的 webhook payload 需要先归一化为该结构，
 * 这样业务层就不依赖 Creem/Stripe 的细节差异。
 */
export type BillingEvent =
  | {
      type: "ONE_TIME_PAID";
      provider: BillingProvider;
      providerEventId: string;
      providerOrderId: string;
      userId: string;
      productId: string;
      credits: number;
    }
  | {
      type: "SUBSCRIPTION_PERIOD_PAID";
      provider: BillingProvider;
      providerEventId: string;
      providerSubscriptionId: string;
      providerCustomerId?: string | null;
      userId: string;
      productId: string;
      periodStart: number;
      periodEnd: number;
      credits: number;
      status: string;
    }
  | {
      type: "SUBSCRIPTION_ENDED";
      provider: BillingProvider;
      providerEventId: string;
      providerSubscriptionId: string;
      userId: string;
      endedAt: number;
      status: string;
    };
