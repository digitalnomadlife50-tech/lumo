import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALES, detectLocale, isLocale } from "@/lib/i18n/locales";

const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, Next internals, and files (images, icons, etc.).
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Already locale-prefixed: carry on.
  const firstSegment = pathname.split("/")[1];
  if (isLocale(firstSegment)) {
    return NextResponse.next();
  }

  // No locale: detect from the browser and redirect to /en/... or /es/....
  const locale = detectLocale(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except the paths handled above; the matcher keeps
  // static assets out before the function even runs.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
