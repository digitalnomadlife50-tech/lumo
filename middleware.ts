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

  // Keep the canonical root and legacy app URLs on the English entry point.
  const url = request.nextUrl.clone();
  if (pathname === "/") {
    url.pathname = "/en";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  // Other unprefixed URLs follow the browser's preferred locale.
  const locale = detectLocale(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Run on everything except the paths handled above; the matcher keeps
  // static assets out before the function even runs.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
