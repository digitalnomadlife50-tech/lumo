import Landing from "@/components/lumo/landing";
import { resolveLocale } from "@/lib/i18n/get-dictionary";
import { homepageSchema, homepageDescription, safeJsonLd } from "@/lib/seo";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const structuredData = homepageSchema(locale, homepageDescription(locale));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
      <Landing />
    </>
  );
}
