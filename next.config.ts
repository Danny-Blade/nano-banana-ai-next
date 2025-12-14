import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 配置项 */
  reactCompiler: true,

  // OpenNext 适配 Cloudflare 时需要 Next.js 输出 standalone 产物
  output: "standalone",
};

export default nextConfig;
