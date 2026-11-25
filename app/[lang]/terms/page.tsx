import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/lumo/legal-page";
import { getLegalDocument } from "@/lib/legal-content";
import { LOCALES, isLocale } from "@/lib/i18n/locales";
import { localizedWebMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const content = getLegalDocument(lang, "terms");
  return localizedWebMetadata({
    locale: lang,
    enPath: "/terms",
    esPath: "/terms",
    title: `${content.title} | Lumo`,
    description: content.description,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <LegalPage locale={lang} content={getLegalDocument(lang, "terms")} />;
}
