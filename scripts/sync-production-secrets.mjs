/**
 * 自动同步敏感信息到 Cloudflare Workers Secrets
 *
 * 此脚本仅在生产环境/CI 环境运行，用于将构建环境中的敏感信息
 * 自动设置为 Cloudflare Workers 的 secrets。
 *
 * 支持的 secrets：
 * - APIYI_API_KEY: 上游生图 API Key（可用 NANO_BANANA_API_KEY 作为别名）
 * - GOOGLE_CLIENT_SECRET: Google OAuth 客户端密钥
 * - NEXTAUTH_SECRET: NextAuth 会话加密密钥
 *
 * 使用方式：
 * - 自动：在 CI 构建流程中自动调用
 * - 手动：npm run secrets:sync:prod
 */

import { execFileSync } from "node:child_process";
import path from "node:path";

function getEnv(key) {
	const value = process.env[key];
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isTruthyEnv(key) {
	const raw = getEnv(key);
	if (!raw) return false;
	return ["1", "true", "yes", "y", "on"].includes(raw.toLowerCase());
}

function hasNonEmptyEnv(key) {
	const value = process.env[key];
	return typeof value === "string" && value.trim().length > 0;
}

function isCloudflareBuildEnv() {
	// 检测是否在 Cloudflare Pages/Workers 构建环境
	return (
		hasNonEmptyEnv("CF_PAGES") ||
		hasNonEmptyEnv("CF_PAGES_BRANCH") ||
		hasNonEmptyEnv("CF_PAGES_URL")
	);
}

function getWranglerBinPath() {
	// Cloudflare 构建环境已经执行过 `yarn install`
	return path.join(process.cwd(), "node_modules", ".bin", "wrangler");
}

function setSecret(secretName, value) {
	try {
		const wranglerBin = getWranglerBinPath();
		// 使用子进程传入 secret 值，避免在命令行中暴露
		const result = execFileSync(wranglerBin, ["secret", "put", secretName], {
			input: value + "\n",
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		process.stdout.write(`[sync-secrets] ✅ ${secretName} 同步成功\n`);
		return true;
	} catch (err) {
		process.stderr.write(`[sync-secrets] ❌ ${secretName} 同步失败: ${err.stderr || err.message}\n`);
		return false;
	}
}


// 检查是否在 CI/生产环境
const isCI =
	["1", "true", "yes"].includes(String(process.env.CI).toLowerCase()) ||
	isCloudflareBuildEnv();

if (!isCI) {
	process.stdout.write("[sync-secrets] 非 CI/生产环境，跳过 secrets 同步\n");
	process.exit(0);
}

// 需要同步的 secrets 列表
const requireApiYiKey = isTruthyEnv("REQUIRE_APIYI_API_KEY");
const secretsToSync = [
	{
		name: "APIYI_API_KEY",
		envKeyCandidates: ["APIYI_API_KEY", "NANO_BANANA_API_KEY"],
		// 默认不强制：避免在未配置生图 Key 的环境里阻断构建/部署。
		// 如需强制（例如生产必须可生图），在构建环境设置：REQUIRE_APIYI_API_KEY=true
		required: requireApiYiKey,
		description: "上游生图 API Key",
	},
	{
		name: "GOOGLE_CLIENT_SECRET",
		envKeyCandidates: ["GOOGLE_CLIENT_SECRET"],
		required: true,
		description: "Google OAuth 客户端密钥",
	},
	{
		name: "NEXTAUTH_SECRET",
		envKeyCandidates: ["NEXTAUTH_SECRET"],
		required: true,
		description: "NextAuth 会话加密密钥",
	},
];

process.stdout.write("[sync-secrets] 开始同步生产环境 secrets...\n");

let successCount = 0;
let failureCount = 0;
const missingSecrets = [];
const skippedOptionalSecrets = [];

for (const secret of secretsToSync) {
	const value = secret.envKeyCandidates.map((k) => getEnv(k)).find(Boolean);
	if (value) {
		if (setSecret(secret.name, value)) {
			successCount++;
		} else {
			failureCount++;
		}
	} else if (secret.required) {
		missingSecrets.push(secret.envKeyCandidates.join(" / "));
		failureCount++;
	} else {
		skippedOptionalSecrets.push(secret.envKeyCandidates.join(" / "));
	}
}

// 输出结果摘要
if (missingSecrets.length > 0) {
	process.stderr.write(`[sync-secrets] ❌ 缺少必需的 secrets: ${missingSecrets.join(", ")}\n`);
	process.stderr.write("[sync-secrets] 请在 Cloudflare 构建环境中配置这些 secrets，或检查环境变量设置\n");
}
if (skippedOptionalSecrets.length > 0) {
	process.stdout.write(
		`[sync-secrets] ℹ️ 未配置可选 secrets（已跳过，不影响构建）：${skippedOptionalSecrets.join(", ")}\n`,
	);
}

process.stdout.write(`\n[sync-secrets] 同步完成: ✅ ${successCount} 成功, ❌ ${failureCount} 失败\n`);

// 如果有失败的必需 secrets，退出码为非零
if (missingSecrets.length > 0) {
	process.exit(1);
}
