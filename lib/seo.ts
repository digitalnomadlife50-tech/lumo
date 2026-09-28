import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/locales";

export const SITE_URL = "https://www.trylumo.co";
export const ARTICLE_PUBLISHED_AT = "2026-09-28";
export const ARTICLE_AUTHOR = "Terry, product director and three-time founder";
export const GUIDE_PATHS = { en: "/guides", es: "/guias" } as const;
export const GUIDE_SLUGS = {
  launch: { en: "tell-stakeholders-launch-is-slipping", es: "avisar-que-el-launch-se-retrasa" },
  scope: { en: "decide-whether-to-cut-scope", es: "decidir-si-recortar-el-scope" },
  vpUpdate: { en: "write-a-decision-update-for-your-vp", es: "escribir-una-actualizacion-de-decision-para-tu-vp" },
  hiring: { en: "hire-now-or-wait", es: "contratar-ahora-o-esperar" },
} as const;
export type GuideId = keyof typeof GUIDE_SLUGS;
export const guideIds = Object.keys(GUIDE_SLUGS) as GuideId[];
export const GUIDE_IDS = guideIds;
export const byline = `By ${ARTICLE_AUTHOR}`;
export const otherLocale = (locale: Locale): Locale => locale === "en" ? "es" : "en";
export const articleAlternatePaths = (id: GuideId) => ({ en: guidePath("en", id), es: guidePath("es", id) });

export const localizedUrl = (locale: Locale, path = "") => `${SITE_URL}/${locale}${path}`;
export const guidePath = (locale: Locale, id: GuideId) => `${GUIDE_PATHS[locale]}/${GUIDE_SLUGS[id][locale]}`;
export const guideIndexHref = (locale: Locale) => `/${locale}${GUIDE_PATHS[locale]}`;
export const guideArticleHref = (locale: Locale, id: GuideId) => `/${locale}${guidePath(locale, id)}`;
export const liveDemoPath = (locale: Locale) => `/${locale}/app`;
export const robotsSitemapUrl = () => `${SITE_URL}/sitemap.xml`;
export const shouldRedirectHost = (hostname: string) => hostname.toLowerCase() === "www.trylumo.co";

export function languageAlternates(enPath: string, esPath: string) {
  return { en: localizedUrl("en", enPath), es: localizedUrl("es", esPath), "x-default": localizedUrl("en", enPath) };
}

export function localizedWebMetadata({ locale, enPath, esPath, title, description, type = "website" }: {
  locale: Locale; enPath: string; esPath: string; title: string; description: string; type?: "website" | "article";
}): Metadata {
  const url = localizedUrl(locale, locale === "en" ? enPath : esPath);
  return {
    metadataBase: new URL(SITE_URL), title, description,
    alternates: { canonical: url, languages: languageAlternates(enPath, esPath) },
    openGraph: { title, description, url, siteName: "Lumo", locale: locale === "es" ? "es_ES" : "en_US", type, images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

export const safeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

export function articleSchema(title: string, locale: Locale, path: string) {
  return { "@context": "https://schema.org", "@type": "Article", headline: title,
    author: { "@type": "Person", name: ARTICLE_AUTHOR }, datePublished: ARTICLE_PUBLISHED_AT,
    inLanguage: locale, mainEntityOfPage: localizedUrl(locale, path) };
}

export function homepageSchema(locale: Locale, description: string) {
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "SoftwareApplication", name: "Lumo", applicationCategory: "BusinessApplication", operatingSystem: "Web", description, url: localizedUrl(locale), inLanguage: locale, offers: { "@type": "Offer", price: 0, priceCurrency: "USD" } },
    { "@type": "Organization", name: "Lumo", url: SITE_URL, logo: `${SITE_URL}/icon.svg`, sameAs: [] },
  ] };
}

export function homepageTitle(locale: Locale) {
  return locale === "en" ? "Lumo: The decision tool for product managers" : "Lumo: La herramienta de decisiones para product managers";
}
export function homepageDescription(locale: Locale) {
  return locale === "en"
    ? "Work through a hard product decision with Lumo, compare options with evidence, save your reasoning, and prepare updates for each team affected by the outcome."
    : "Analiza una decisión difícil de producto con Lumo, compara opciones con evidencia, conserva tu razonamiento y prepara mensajes claros para cada equipo afectado.";
}
export const homepageMetadata = (locale: Locale) => localizedWebMetadata({ locale, enPath: "", esPath: "", title: homepageTitle(locale), description: homepageDescription(locale) });

export function guideIdFromSlug(locale: Locale, slug: string) {
  return guideIds.find((id) => GUIDE_SLUGS[id][locale] === slug);
}
export function guideIndexMetadata(locale: Locale) {
  return localizedWebMetadata({ locale, enPath: GUIDE_PATHS.en, esPath: GUIDE_PATHS.es,
    title: locale === "en" ? "Product decision guides for product managers | Lumo" : "Guías de decisiones de producto | Lumo",
    description: locale === "en" ? "Explore guides for product managers on launch delays, scope decisions, executive updates, and hiring—with clear trade-offs, useful examples, and next steps." : "Guías prácticas para product managers sobre retrasos de launch, scope, comunicación ejecutiva y contratación, con ejemplos y próximos pasos claros." });
}
export function appMetadata(locale: Locale) {
  return localizedWebMetadata({ locale, enPath: "/app", esPath: "/app",
    title: locale === "en" ? "Lumo: Workspace for product decisions" : "Lumo: decisiones de producto en equipo",
    description: locale === "en" ? "Work through a product decision with Lumo, compare options, record your reasoning, and prepare clear messages for each team affected by the outcome." : "Analiza decisiones de producto con Lumo, compara opciones, registra tu razonamiento y prepara mensajes claros para los equipos afectados por tu elección." });
}
export function demoMetadata(locale: Locale) {
  return localizedWebMetadata({ locale, enPath: "/app/demo", esPath: "/app/demo",
    title: locale === "en" ? "Lumo: Product decision demo walkthrough" : "Lumo: demo guiada de decisiones de producto",
    description: locale === "en" ? "Explore Lumo's judgment map and monthly brief, then follow a sample product decision from its first signal through a clear update for each team affected." : "Explora el mapa de criterio de Lumo y el resumen mensual; sigue una decisión de producto desde la primera señal hasta los mensajes para cada equipo afectado." });
}
export function articleMetadata(locale: Locale, title: string, description: string, id: GuideId) {
  return localizedWebMetadata({ locale, enPath: guidePath("en", id), esPath: guidePath("es", id), title: `${title} | Lumo`, description, type: "article" });
}

export function isRetiredStorePath(pathname: string) {
  const path = pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/";
  return ["/products", "/collections", "/cart", "/pages", "/blogs", "/account", "/checkouts"].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
export function retiredStoreResponse() {
  return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>This page no longer exists | Lumo</title></head><body style="margin:0;background:#FAF7F0;color:#1F1B17;font-family:Inter,system-ui,sans-serif"><main style="max-width:720px;margin:0 auto;padding:96px 24px"><p style="font-size:24px;line-height:1.4">This page no longer exists.</p><a style="color:#E26847" href="/en">Go to Lumo</a></main></body></html>', { status: 410, headers: { "content-type": "text/html; charset=utf-8" } });
}
export function robotsMetadata() {
  return { rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }], sitemap: robotsSitemapUrl() };
}
export const staticPagePaths = (locale: Locale) => ["", "/app", "/app/demo", GUIDE_PATHS[locale]];

