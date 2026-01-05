import LoginClient from "./login-client";

export default async function LoginPage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const resolvedSearchParams = (await searchParams) ?? {};
	const callbackUrlParam = resolvedSearchParams.callbackUrl;
	const callbackUrl =
		typeof callbackUrlParam === "string" && callbackUrlParam.trim()
			? callbackUrlParam
			: "/";

	return <LoginClient callbackUrl={callbackUrl} />;
}
