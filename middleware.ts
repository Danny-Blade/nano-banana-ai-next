export const runtime = 'edge';

export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
