import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudy from "@/components/lumo/case-study";
import { isLocale } from "@/lib/i18n/locales";
import { localizedWebMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const title = lang === "en"
    ? "Lumo case study: Building a feedback loop for product judgment"
    : "Caso de estudio de Lumo: Un ciclo de feedback para el criterio de producto";
  const description = lang === "en"
    ? "How Lumo was built, what the beta showed, and where the product decision tool is going."
    : "Cómo se construyó Lumo, qué mostró la beta y hacia dónde va esta herramienta de decisiones de producto.";

  return localizedWebMetadata({
    locale: lang,
    enPath: "/case-study",
    esPath: "/case-study",
    title,
    description,
    type: "article",
  });
}

export default function Page() {
  return <CaseStudy />;
}
