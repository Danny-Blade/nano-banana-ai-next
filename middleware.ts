export const runtime = 'edge';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 非默认语言（需要在 URL 中显示前缀）
const NON_DEFAULT_LOCALES = ['zh', 'ja', 'ko'];

// 需要认证的路径（不带语言前缀）
const PROTECTED_PATHS = ['/dashboard', '/history'];

// 获取不带语言前缀的路径
const getPathWithoutLocale = (pathname: string): string => {
  for (const locale of NON_DEFAULT_LOCALES) {
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
};

// 检查路径是否需要认证
const isProtectedPath = (pathname: string): boolean => {
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  return PROTECTED_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
};

// 检查是否是登录页面
const isLoginPage = (pathname: string): boolean => {
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  return pathWithoutLocale === '/login' || pathWithoutLocale.startsWith('/login/');
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查路径是否以 /en 开头（默认语言，需要重定向去掉前缀）
  const hasEnPrefix = pathname === '/en' || pathname.startsWith('/en/');
  if (hasEnPrefix) {
    // 重定向到不带 /en 的路径（SEO 友好）
    const newPathname = pathname === '/en' ? '/' : pathname.replace(/^\/en/, '');
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  // 检查路径是否以非默认语言前缀开头
  const hasNonDefaultLocale = NON_DEFAULT_LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // 认证检查函数（只检查受保护的路径）
  const checkAuth = async () => {
    // 只有受保护的路径才需要认证检查
    if (!isProtectedPath(pathname)) {
      // 如果是登录页且已登录，重定向到首页
      if (isLoginPage(pathname)) {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });
        if (token) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
      return null;
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const signInUrl = new URL('/login', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }

    return null;
  };

  // 如果没有语言前缀（使用默认语言 English）
  if (!hasNonDefaultLocale) {
    // 只检查认证，不需要 rewrite（已有 (default) 路由组处理默认语言）
    const authResponse = await checkAuth();
    if (authResponse) return authResponse;

    return NextResponse.next();
  }

  // 有非默认语言前缀的情况，只做认证检查
  const authResponse = await checkAuth();
  if (authResponse) return authResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
