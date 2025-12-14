# 系统架构图

```mermaid
graph TB
    %% 用户层
    subgraph "用户层"
        U[用户浏览器]
    end

    %% 前端层
    subgraph "Cloudflare Pages"
        LB[负载均衡器]
        WEB[Next.js 应用]
        STATIC[静态资源]
    end

    %% API层
    subgraph "Cloudflare Workers"
        API[API 路由]
        AUTH[认证中间件]
        BILLING[支付服务]
        IMG_GEN[图像生成服务]
    end

    %% 外部服务
    subgraph "外部AI服务"
        GEMINI[Google Gemini API]
        FLUX[Flux API]
        SORA[Sora API]
        SEEDREAM[Seedream API]
    end

    subgraph "支付服务"
        CREEM[Creem支付]
        STRIPE[Stripe支付]
    end

    subgraph "OAuth服务"
        GOOGLE[Google OAuth]
        FACEBOOK[Facebook OAuth]
    end

    %% 数据层
    subgraph "Cloudflare服务"
        D1[(D1数据库)]
        R2[(R2存储)]
        KV[(KV缓存)]
    end

    %% 连接关系
    U --> LB
    LB --> WEB
    LB --> STATIC

    WEB --> API
    API --> AUTH
    API --> BILLING
    API --> IMG_GEN

    AUTH --> GOOGLE
    AUTH --> FACEBOOK

    IMG_GEN --> GEMINI
    IMG_GEN --> FLUX
    IMG_GEN --> SORA
    IMG_GEN --> SEEDREAM

    BILLING --> CREEM
    BILLING --> STRIPE

    AUTH --> D1
    BILLING --> D1
    IMG_GEN --> D1
    IMG_GEN --> R2

    API --> KV

    %% 样式
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef external fill:#fff3e0
    classDef data fill:#e8f5e8

    class U,WEB,STATIC frontend
    class API,AUTH,BILLING,IMG_GEN backend
    class GEMINI,FLUX,SORA,SEEDREAM,CREEM,STRIPE,GOOGLE,FACEBOOK external
    class D1,R2,KV data
```

## 技术栈说明

### 前端层
- **Next.js 16**: React 全栈框架
- **React 19**: UI 组件库
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架

### 后端层
- **Cloudflare Workers**: 服务端运行时
- **NextAuth.js**: OAuth 认证
- **D1 数据库**: SQLite 存储
- **R2 存储**: 图像文件存储

### 外部服务
- **AI 模型**: Gemini, Flux, Sora, Seedream
- **支付**: Creem, Stripe
- **认证**: Google, Facebook OAuth

### 部署架构
- **CDN**: Cloudflare 全球分发
- **边缘计算**: 25+ 地区部署
- **无服务器**: 按需扩缩容