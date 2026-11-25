"use client";

import { usePathname } from "next/navigation";

const copy = {
  en: {
    title: "This page took a wrong turn.",
    body: "The link may be old, or the page may have moved. Start again with a decision, or return to the Lumo home page.",
    home: "Back to Lumo",
    demo: "Try the demo",
    wordmark: "Lumo home",
    language: "Choose language",
  },
  es: {
    title: "Esta página tomó un camino equivocado.",
    body: "Puede que el enlace sea antiguo o que la página se haya movido. Empieza de nuevo con una decisión o vuelve al inicio de Lumo.",
    home: "Volver a Lumo",
    demo: "Probar la demo",
    wordmark: "Inicio de Lumo",
    language: "Elige el idioma",
  },
} as const;

export default function GlobalNotFoundView() {
  const pathname = usePathname() || "";
  const locale = pathname.split("/")[1] === "es" ? "es" : "en";
  const otherLocale = locale === "en" ? "es" : "en";
  const t = copy[locale];
  const home = `/${locale}`;
  const pathWithoutLocale = pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/";
  const alternateHref = `/${otherLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;

  return (
    <div className="lm-page lm-not-found" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="lm-wrap">
        <header className="lm-nav">
          <a className="lm-wordmark" href={home} aria-label={t.wordmark}>lumo<i aria-hidden="true" /></a>
          <nav className="lm-langswitch" aria-label={t.language}>
            {locale === "en" ? <span className="is-active" aria-current="true">English</span> : <a href={alternateHref} hrefLang="en">English</a>}
            {locale === "es" ? <span className="is-active" aria-current="true">Español</span> : <a href={alternateHref} hrefLang="es">Español</a>}
          </nav>
        </header>
      </div>
      <main className="lm-wrap lm-not-found-main" aria-labelledby="global-not-found-title">
        <div className="lm-label">404 / Lumo</div>
        <h1 id="global-not-found-title" className="lm-h1">{t.title}</h1>
        <p className="lm-lede">{t.body}</p>
        <div className="lm-row">
          <a className="lm-btn" href={`${home}/app`}>{t.demo}</a>
          <a className="lm-btn-sec" href={home}>{t.home}</a>
        </div>
      </main>
    </div>
  );
}
