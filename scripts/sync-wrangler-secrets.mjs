/**
 * Sync selected keys from a local .env file into Cloudflare Workers Secrets via Wrangler.
 *
 * Usage:
 *   node scripts/sync-wrangler-secrets.mjs --from .env.local
 *   node scripts/sync-wrangler-secrets.mjs --from .env.local --env production
 *
 * Notes:
 * - Requires Wrangler auth (e.g. CLOUDFLARE_API_TOKEN) in your shell.
 * - This script never prints secret values.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function parseArgs(argv) {
  const args = { from: ".env.local", env: undefined };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--from") args.from = argv[++i];
    else if (a === "--env") args.env = argv[++i];
  }
  return args;
}

function unquote(value) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseDotEnv(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = unquote(line.slice(eq + 1));
    if (key) out[key] = value;
  }
  return out;
}

function getWranglerBin() {
  return path.join(process.cwd(), "node_modules", ".bin", "wrangler");
}

function putSecret({ wranglerBin, name, value, envName }) {
  const args = ["secret", "put", name];
  if (envName) args.push("--env", envName);
  execFileSync(wranglerBin, args, {
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
    env: process.env,
  });
}

const { from, env: envName } = parseArgs(process.argv);
const fromPath = path.isAbsolute(from) ? from : path.join(process.cwd(), from);
if (!fs.existsSync(fromPath)) {
  throw new Error(`Env file not found: ${fromPath}`);
}

const envMap = parseDotEnv(fs.readFileSync(fromPath, "utf8"));
const keys = ["NEXTAUTH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];

const missing = keys.filter((k) => !(typeof envMap[k] === "string" && envMap[k].trim().length));
if (missing.length) {
  throw new Error(`Missing keys in ${from}: ${missing.join(", ")}`);
}

const wranglerBin = getWranglerBin();
if (!fs.existsSync(wranglerBin)) {
  throw new Error("Wrangler not found at node_modules/.bin/wrangler. Run `yarn install` first.");
}

process.stdout.write(
  `[sync-secrets] Syncing ${keys.join(", ")} from ${path.basename(fromPath)} to Cloudflare Secrets${
    envName ? ` (env=${envName})` : ""
  }...\n`,
);

for (const key of keys) {
  process.stdout.write(`[sync-secrets] Putting secret: ${key}\n`);
  putSecret({ wranglerBin, name: key, value: String(envMap[key]), envName });
}

process.stdout.write("[sync-secrets] Done.\n");

