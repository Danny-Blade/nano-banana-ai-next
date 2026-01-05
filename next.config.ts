import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 配置项 */

  // OpenNext 适配 Cloudflare 时需要 Next.js 输出 standalone 产物
  output: "standalone",

  // 允许外部图片域名
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aiimage.pkgames.org",
      },
    ],
  },
};

export default nextConfig;

// 在开发模式下初始化 Cloudflare 绑定（D1、KV、R2 等）
// 这样 yarn dev 可以访问本地 Cloudflare 资源
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev({
      // 使用开发环境配置文件
      configPath: "wrangler.dev.toml",
      // 持久化本地数据，与 wrangler d1 execute --local 使用相同路径
      persist: { path: ".wrangler/state/v3" },
    });
  });
}
