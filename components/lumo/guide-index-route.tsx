import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideIndex, GuideShell } from "@/components/lumo/guides";
import { LOCALES, isLocale } from "@/lib/i18n/locales";
import { GUIDE_PATHS, guideIndexHref, guideIndexMetadata, otherLocale, safeJsonLd, localizedUrl } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return guideIndexMetadata(lang);
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function GuideIndexRoute({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang;
  const alternate = guideIndexHref(otherLocale(locale));
  const indexPath = GUIDE_PATHS[locale];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: locale === "en" ? "Product decision guides" : "Guías de decisiones de producto",
    inLanguage: locale,
    url: localizedUrl(locale, indexPath),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
      <GuideShell locale={locale} alternateHref={alternate}>
        <GuideIndex locale={locale} />
      </GuideShell>
    </>
  );
}


