import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, detectLocale, isLocale } from "@/lib/i18n/locales";
import { isRetiredStorePath, retiredStoreResponse } from "@/lib/seo";

const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isRetiredStorePath(pathname)) {
    return retiredStoreResponse();
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const [, firstSegment, section] = pathname.split("/");
  if (isLocale(firstSegment)) {
    const expectedSection = firstSegment === "en" ? "guides" : "guias";
    if ((section === "guides" || section === "guias") && section !== expectedSection) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(`/${firstSegment}/${section}`, `/${firstSegment}/${expectedSection}`);
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  if (pathname === "/" || pathname === "/app" || pathname.startsWith("/app/")) {
    url.pathname = `/en${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 308);
  }

  const locale = detectLocale(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel).*)"],
};
