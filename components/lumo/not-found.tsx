"use client";

import Link from "next/link";
import { LanguageSwitcher, Wordmark } from "./ui";
import { useDict, useLocale, useLocaleHref } from "@/lib/i18n";

const copy = {
  en: {
    title: "This page took a wrong turn.",
    body: "The link may be old, or the page may have moved. Start again with a decision, or return to the Lumo home page.",
    home: "Back to Lumo",
  },
  es: {
    title: "Esta página tomó un camino equivocado.",
    body: "Puede que el enlace sea antiguo o que la página se haya movido. Empieza de nuevo con una decisión o vuelve al inicio de Lumo.",
    home: "Volver a Lumo",
  },
} as const;

export default function LumoNotFound() {
  const locale = useLocale();
  const d = useDict();
  const lh = useLocaleHref();
  const t = copy[locale];

  return (
    <div className="lm-page lm-not-found">
      <div className="lm-wrap">
        <header className="lm-nav">
          <Wordmark href={`/${locale}`} />
          <LanguageSwitcher />
        </header>
      </div>
      <main className="lm-wrap lm-not-found-main" aria-labelledby="not-found-title">
        <div className="lm-label">404 / Lumo</div>
        <h1 id="not-found-title" className="lm-h1">{t.title}</h1>
        <p className="lm-lede">{t.body}</p>
        <div className="lm-row">
          <Link className="lm-btn" href={lh("/app")}>{d.common.tryDemo}</Link>
          <Link className="lm-btn-sec" href={`/${locale}`}>{t.home}</Link>
        </div>
      </main>
    </div>
  );
}
