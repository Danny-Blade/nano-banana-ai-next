// OpenNext for Cloudflare 的配置文件（必需）
// 说明：先保持最小配置，避免强依赖 R2 / KV 等缓存组件；后续需要缓存再按需开启。
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig();

