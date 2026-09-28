import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/lumo/guides";
import { GUIDE_CONTENT } from "@/lib/guides-content";
import { LOCALES, isLocale } from "@/lib/i18n/locales";
import { GUIDE_IDS, GUIDE_SLUGS, articleMetadata, articleSchema, guideIdFromSlug, guidePath, safeJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const id = guideIdFromSlug(lang, slug);
  if (!id) return {};
  const article = GUIDE_CONTENT[id][lang];
  return articleMetadata(lang, article.title, article.description, id);
}

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => GUIDE_IDS.map((id) => ({ lang, slug: GUIDE_SLUGS[id][lang] })));
}

export default async function GuideArticleRoute({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const id = guideIdFromSlug(lang, slug);
  if (!id) notFound();
  const article = GUIDE_CONTENT[id][lang];
  const path = guidePath(lang, id);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema(article.title, lang, path)) }} />
      <GuideArticle locale={lang} id={id} />
    </>
  );
}


