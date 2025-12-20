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
import { execFileSync } from "node:child_process";
import path from "node:path";

function getEnv(...keys) {
	for (const key of keys) {
		const value = process.env[key];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
	return undefined;
}

function hasNonEmptyEnv(key) {
	const value = process.env[key];
	return typeof value === "string" && value.trim().length > 0;
}

function isCloudflareBuildEnv() {
	// Cloudflare Pages/Workers 构建环境通常会注入这些变量（不同产品形态可能略有差异）
	return (
		hasNonEmptyEnv("CF_PAGES") ||
		hasNonEmptyEnv("CF_PAGES_BRANCH") ||
		hasNonEmptyEnv("CF_PAGES_URL")
	);
}

function isUuidLike(value) {
	// D1 的 database_id 是 UUID（形如 8-4-4-4-12）
	return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
		value,
	);
}

function printEnvDiagnostics() {
	const interestingKeys = [
		"D1_DATABASE_ID",
		"CF_D1_DATABASE_ID",
		"D1_DATABASE_NAME",
		"CF_D1_DATABASE_NAME",
		"NEXTAUTH_URL",
		"WORKER_NAME",
		"CF_WORKER_NAME",
		"GOOGLE_CLIENT_ID",
		"GOOGLE_CLIENT_SECRET",
		"NEXTAUTH_SECRET",
		"CI",
		"CF_PAGES",
		"CF_PAGES_BRANCH",
		"CF_PAGES_URL",
	];
	const present = interestingKeys.filter((k) => hasNonEmptyEnv(k));
	process.stdout.write(
		`[generate-wrangler-config] 环境变量检查：已存在的关键变量键：${present.length ? present.join(", ") : "(无)"}\n`,
	);
}

function getWranglerBinPath() {
	// Cloudflare 构建环境已经执行过 `yarn install`，所以 node_modules 里一定有 wrangler
	return path.join(process.cwd(), "node_modules", ".bin", "wrangler");
}

function tryDiscoverD1DatabaseIdByName(databaseName) {
	try {
		const wranglerBin = getWranglerBinPath();
		const out = execFileSync(wranglerBin, ["d1", "list", "--json"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
		const list = JSON.parse(out);
		if (!Array.isArray(list)) return undefined;

		const getId = (item) =>
			typeof item?.uuid === "string"
				? item.uuid
				: typeof item?.id === "string"
					? item.id
					: typeof item?.database_id === "string"
						? item.database_id
						: undefined;

		const exact = list.find((item) => item?.name === databaseName);
		if (exact) return getId(exact);

		// 没有匹配名称时，如果只有一个 D1，就直接使用它（减少配置出错概率）
		if (list.length === 1) return getId(list[0]);
	} catch {
		// 忽略：可能没有 API Token，或 wrangler 在该环境不可用
	}
	return undefined;
}

let d1DatabaseId = getEnv("D1_DATABASE_ID", "CF_D1_DATABASE_ID");

// 本地开发允许不配置（不覆盖仓库里的模板配置）；CI/Cloudflare 环境强制要求配置。
const isCI =
	["1", "true", "yes"].includes(String(process.env.CI).toLowerCase()) ||
	isCloudflareBuildEnv();
if (!d1DatabaseId) {
	printEnvDiagnostics();

	if (isCI) {
		// 兜底：如果 Cloudflare 构建环境里没拿到环境变量，但配置了 wrangler 的 API Token，
		// 可以尝试通过 `wrangler d1 list` 自动查找 database_id。
		const d1DatabaseName = getEnv("D1_DATABASE_NAME", "CF_D1_DATABASE_NAME") ?? "nano_banana";
		const discoveredId = tryDiscoverD1DatabaseIdByName(d1DatabaseName);
		if (discoveredId) {
			d1DatabaseId = discoveredId;
			process.stdout.write(
				`[generate-wrangler-config] 未检测到 D1_DATABASE_ID，已通过 wrangler 自动匹配 D1（name=${d1DatabaseName}）。\n`,
			);
		} else {
			throw new Error(
				[
					"缺少环境变量 `D1_DATABASE_ID`（或 `CF_D1_DATABASE_ID`）。",
					"请检查：",
					"1) 是否把变量加在了正确的环境（Production / Preview）",
					"2) 是否加在“构建环境变量/Build variables”（而不是仅运行时变量）",
					"3) 是否保存后重新触发了一次部署",
				].join("\n"),
			);
		}
	}
	// 非 CI：不改动配置，方便本地 build
	process.stdout.write(
		"[generate-wrangler-config] 未设置 D1_DATABASE_ID，跳过写入 wrangler.jsonc（本地 build 正常）。\n",
	);
	process.exit(0);
}

if (!isUuidLike(d1DatabaseId)) {
	printEnvDiagnostics();
	throw new Error(
		[
			"`D1_DATABASE_ID` 不是有效的 D1 数据库 UUID。",
			"你很可能填成了数据库名称/绑定名（例如 nano_banana / nano_banana_db），但这里必须是 Database ID（UUID）。",
			"获取方式：Cloudflare 控制台 → D1 → 进入数据库详情页 → 复制 Database ID。",
		].join("\n"),
	);
}

const workerName = getEnv("WORKER_NAME", "CF_WORKER_NAME") ?? "nano-banana-ai-next";
const d1DatabaseName = getEnv("D1_DATABASE_NAME", "CF_D1_DATABASE_NAME") ?? "nano_banana";
const nextAuthUrl = getEnv("NEXTAUTH_URL");
const defaultNextAuthUrl =
	getEnv("DEFAULT_NEXTAUTH_URL") ??
	"https://nano-banana-ai-next.blusdanny1230.workers.dev";

// Google OAuth 凭据
const googleClientId = getEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = getEnv("GOOGLE_CLIENT_SECRET");

// 在 CI 环境验证 OAuth 凭据（避免部署后才发现配置错误）
if (isCI) {
	const missingOAuthVars = [];
	if (!googleClientId) missingOAuthVars.push("GOOGLE_CLIENT_ID");
	if (!googleClientSecret) missingOAuthVars.push("GOOGLE_CLIENT_SECRET");

	if (missingOAuthVars.length > 0) {
		printEnvDiagnostics();
		throw new Error(
			[
				`缺少 Google OAuth 环境变量：${missingOAuthVars.join(", ")}。`,
				"请检查：",
				"1) 是否把变量加在了正确的环境（Production / Preview）",
				"2) 是否加在\"构建环境变量/Build variables\"（GOOGLE_CLIENT_ID）和 Secrets（GOOGLE_CLIENT_SECRET）",
				"3) 是否保存后重新触发了一次部署",
			].join("\n"),
		);
	}
}

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

// NextAuth 的 OAuth callback URL 由 NEXTAUTH_URL 决定（例如 /api/auth/callback/google）。
// - 本地 `yarn dev` 通常是 http://localhost:3000（来自 .env.local）
// - 部署到 Cloudflare Workers 后建议显式设置为线上域名，避免回调 URL 不匹配
//
// 注意：wrangler 的 vars 会写入部署产物；不要把 secret（例如 NEXTAUTH_SECRET, GOOGLE_CLIENT_SECRET）放在这里。
if (nextAuthUrl && !(nextAuthUrl.includes("localhost") || nextAuthUrl.includes("127.0.0.1"))) {
	config.vars = { ...(config.vars ?? {}), NEXTAUTH_URL: nextAuthUrl };
} else if (isCI && !nextAuthUrl) {
	// 先上兜底：如果 CI/Cloudflare 构建环境未配置 NEXTAUTH_URL，则默认写入 workers.dev。
	// 如需自定义域名，建议在 Cloudflare 环境变量中设置 NEXTAUTH_URL（或在构建环境设置 DEFAULT_NEXTAUTH_URL）。
	config.vars = { ...(config.vars ?? {}), NEXTAUTH_URL: defaultNextAuthUrl };
	process.stdout.write(
		`[generate-wrangler-config] 未检测到 NEXTAUTH_URL；已写入默认值：${defaultNextAuthUrl}\n`,
	);
}

// Google OAuth Client ID（非敏感信息，可写入 wrangler vars）
if (googleClientId) {
	config.vars = { ...(config.vars ?? {}), GOOGLE_CLIENT_ID: googleClientId };
	if (process.env.NODE_ENV !== "production") {
		process.stdout.write(
			`[generate-wrangler-config] 已配置 GOOGLE_CLIENT_ID: ${googleClientId.slice(0, 20)}...\n`,
		);
	}
}

const targetPath = path.join(process.cwd(), "wrangler.jsonc");
fs.writeFileSync(targetPath, JSON.stringify(config, null, 2) + "\n", "utf8");

const oauthStatus = googleClientId ? "已配置" : "未配置";
process.stdout.write(
	`[generate-wrangler-config] 已写入 wrangler.jsonc（DB=${d1DatabaseName}, id=${d1DatabaseId.slice(0, 8)}...${d1DatabaseId.slice(-4)}, OAuth=${oauthStatus}）。\n`,
);
