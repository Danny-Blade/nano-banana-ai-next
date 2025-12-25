"use client";

import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

export default function LoginClient({ callbackUrl }: { callbackUrl: string }) {
	const router = useRouter();

	const getSafeCallbackUrl = () => {
		try {
			// 避免 open redirect：只允许站内跳转
			const url = new URL(callbackUrl, window.location.origin);
			if (url.origin !== window.location.origin) return "/";
			return `${url.pathname}${url.search}${url.hash}`;
		} catch {
			return "/";
		}
	};

	return (
		<LoginModal
			isOpen
			callbackUrl={callbackUrl}
			onClose={() => {
				router.replace(getSafeCallbackUrl());
			}}
		/>
	);
}
