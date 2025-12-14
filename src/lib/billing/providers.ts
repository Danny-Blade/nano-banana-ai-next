import type { BillingProvider } from "@/lib/billing/types";

/**
 * 支付渠道适配层接口。
 *
 * 先接入 Creem，后续加 Stripe 作为备选。
 * 应用其余部分只依赖该接口，这样切换/新增渠道不会影响业务逻辑。
 */
export type BillingProviderAdapter = {
  createCheckout: (params: {
    userId: string;
    productId: string;
    orderId: string;
    successUrl: string;
    cancelUrl: string;
  }) => Promise<{ checkoutUrl: string }>;
};

const notImplemented = (provider: BillingProvider): BillingProviderAdapter => ({
  async createCheckout() {
    throw new Error(
      `${provider} checkout not implemented yet. Implement provider API call + webhook normalization first.`
    );
  },
});

export const getBillingProvider = (provider: BillingProvider): BillingProviderAdapter => {
  // TODO：先实现 Creem，再补 Stripe。
  return notImplemented(provider);
};
