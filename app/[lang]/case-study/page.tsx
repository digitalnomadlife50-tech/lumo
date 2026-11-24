import type { Metadata } from "next";
import CaseStudy from "@/components/lumo/case-study";
import { resolveLocale } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);

  return {
    title: "Lumo — Case Study",
    description:
      "A feedback loop for product judgment. How Lumo was built, what the beta showed, and where it's going.",
    alternates: {
      canonical: "/case-study",
      languages: {
        en: "/en/case-study",
        es: "/es/case-study",
      },
    },
    openGraph: {
      title: "Lumo — Case Study",
      description:
        "A feedback loop for product judgment. How Lumo was built, what the beta showed, and where it's going.",
      type: "article",
      locale,
      url: "/case-study",
    },
  };
}

export default function Page() {
  return <CaseStudy />;
}
