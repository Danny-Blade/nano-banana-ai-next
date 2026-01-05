declare module "next/dist/compiled/https-proxy-agent" {
	import type { Agent as HttpAgent } from "http";

	export class HttpsProxyAgent extends HttpAgent {
		constructor(proxy: string | URL);
	}
}

