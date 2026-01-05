import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SUPPORTED_LOCALES,
  type Locale,
  LOCALE_STORAGE_KEY,
  detectLocaleFromAcceptLanguage,
} from "@/lib/i18n/types";

const PUBLIC_FILE = /\.(.*)$/;
const DEFAULT_LOCALE: Locale = "en";

function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split("/");
  const potentialLocale = segments[1];
  if (SUPPORTED_LOCALES.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过静态文件和 API 路由
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 检查路径是否已包含有效的 locale
  const pathnameLocale = getLocaleFromPath(pathname);
  if (pathnameLocale) {
    // 如果是英语且 URL 带有 /en 前缀，重定向到不带前缀的 URL
    // 这样保持英语 URL 干净（不显示 /en）
    if (pathnameLocale === DEFAULT_LOCALE) {
      const pathWithoutLocale = pathname.replace(/^\/en/, "") || "/";
      const url = request.nextUrl.clone();
      url.pathname = pathWithoutLocale;
      return NextResponse.redirect(url);
    }
    // 其他语言保持不变
    return NextResponse.next();
  }

  // 获取用户首选语言
  // 优先从 cookie 获取（用户手动切换过）
  const cookieLocale = request.cookies.get(LOCALE_STORAGE_KEY)?.value as Locale | undefined;
  let locale: Locale = DEFAULT_LOCALE;

  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    locale = cookieLocale;
  } else {
    // 从 Accept-Language 检测
    const acceptLanguage = request.headers.get("accept-language");
    locale = detectLocaleFromAcceptLanguage(acceptLanguage);
  }

  // 英文是默认语言，不需要在 URL 中显示
  if (locale === DEFAULT_LOCALE) {
    // 内部重写到 /en 路径，但 URL 保持不变
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 非英文语言，重定向到带 locale 前缀的路径
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // 匹配所有路径，排除 api、_next、static 和文件扩展名
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
