/**
 * 生成用于 `wrangler deploy` 的最终 wrangler 配置文件。
 *
 * 背景：
 * - Wrangler 部署时，D1 绑定必须提供真实 `database_id`，否则会报错：
 *   `binding DB of type d1 must have a valid id specified [code: 10021]`
 *
 * 推荐做法：
 * - 不把 D1 的 database_id 硬编码提交到仓库
 * - 在 Cloudflare 的构建环境变量里配置 `D1_DATABASE_ID`（或 `CF_D1_DATABASE_ID`）
 * - 构建阶段自动把 id 写进 `wrangler.jsonc`，确保 deploy 成功
 */

import fs from "node:fs";
import path from "node:path";

function getEnv(...keys) {
	for (const key of keys) {
		const value = process.env[key];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
	return undefined;
}

const d1DatabaseId = getEnv("D1_DATABASE_ID", "CF_D1_DATABASE_ID");

// 本地开发允许不配置（不覆盖仓库里的模板配置）；CI/Cloudflare 环境强制要求配置。
const isCI = ["1", "true", "yes"].includes(String(process.env.CI).toLowerCase());
if (!d1DatabaseId) {
	if (isCI) {
		throw new Error(
			"缺少环境变量 `D1_DATABASE_ID`（或 `CF_D1_DATABASE_ID`）。请在 Cloudflare 项目里配置后再部署。",
		);
	}
	// 非 CI：不改动配置，方便本地 build
	process.stdout.write(
		"[generate-wrangler-config] 未设置 D1_DATABASE_ID，跳过写入 wrangler.jsonc（本地 build 正常）。\n",
	);
	process.exit(0);
}

const workerName = getEnv("WORKER_NAME", "CF_WORKER_NAME") ?? "nano-banana-ai-next";
const d1DatabaseName = getEnv("D1_DATABASE_NAME") ?? "nano_banana";

const config = {
	$schema: "node_modules/wrangler/config-schema.json",
	name: workerName,
	main: ".open-next/worker.js",
	compatibility_date: "2025-12-01",
	compatibility_flags: ["nodejs_compat"],
	assets: { directory: ".open-next/assets", binding: "ASSETS" },
	d1_databases: [
		{
			binding: "DB",
			database_name: d1DatabaseName,
			database_id: d1DatabaseId,
		},
	],
};

const targetPath = path.join(process.cwd(), "wrangler.jsonc");
fs.writeFileSync(targetPath, JSON.stringify(config, null, 2) + "\n", "utf8");
process.stdout.write(`[generate-wrangler-config] 已写入 wrangler.jsonc（DB=${d1DatabaseName}）。\n`);
