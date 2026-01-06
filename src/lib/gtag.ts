// Google Analytics 配置和事件追踪工具

export const GA_TRACKING_ID = 'G-4T0N007BNY';

// 页面浏览事件
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// 自定义事件追踪
type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 预定义的事件类型，方便各页面使用
export const trackEvents = {
  // 图片生成相关
  generateImage: (model: string) => event({
    action: 'generate_image',
    category: 'Image Generation',
    label: model,
  }),

  batchGenerate: (count: number) => event({
    action: 'batch_generate',
    category: 'Image Generation',
    value: count,
  }),

  compareModels: (models: string) => event({
    action: 'compare_models',
    category: 'Image Generation',
    label: models,
  }),

  // 图片转视频
  imageToVideo: () => event({
    action: 'image_to_video',
    category: 'Video Generation',
  }),

  // 用户行为
  login: (method: string) => event({
    action: 'login',
    category: 'User',
    label: method,
  }),

  signup: (method: string) => event({
    action: 'sign_up',
    category: 'User',
    label: method,
  }),

  // 付费相关
  viewPricing: () => event({
    action: 'view_pricing',
    category: 'Conversion',
  }),

  selectPlan: (plan: string) => event({
    action: 'select_plan',
    category: 'Conversion',
    label: plan,
  }),

  purchase: (plan: string, value: number) => event({
    action: 'purchase',
    category: 'Conversion',
    label: plan,
    value: value,
  }),

  // 历史记录
  viewHistory: () => event({
    action: 'view_history',
    category: 'Engagement',
  }),

  downloadImage: () => event({
    action: 'download_image',
    category: 'Engagement',
  }),

  // 提示词相关
  usePrompt: (promptType: string) => event({
    action: 'use_prompt',
    category: 'Prompt',
    label: promptType,
  }),

  // 页面交互
  clickCTA: (ctaName: string) => event({
    action: 'click_cta',
    category: 'Engagement',
    label: ctaName,
  }),
};

// TypeScript 类型声明
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
