import Link from "next/link";
import { Wordmark } from "@/components/lumo/ui";
import { allGuideArticles, getGuideArticle } from "@/lib/guides-content";
import { byline, guideArticleHref, guideIndexHref, liveDemoPath, otherLocale, type GuideId } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/locales";

const copy = {
  en: {
    home: "Home",
    index: "Guides",
    tryDemo: "Try the demo",
    switch: "Español",
    eyebrow: "Lumo field guide",
    minutes: (value: number) => `${value} min read`,
    example: "A message you can adapt",
    takeaway: "The short version",
    next: "A decision is easier to explain when you can see how you reached it.",
    cta: "Try the product decision demo",
    back: "All product decision guides",
    updated: "Published September 28, 2026",
  },
  es: {
    home: "Inicio",
    index: "Guías",
    tryDemo: "Probar la demo",
    switch: "English",
    eyebrow: "Guía práctica de Lumo",
    minutes: (value: number) => `${value} min de lectura`,
    example: "Un mensaje que puedes adaptar",
    takeaway: "En pocas palabras",
    next: "Es más fácil explicar una decisión cuando puedes ver cómo llegaste a ella.",
    cta: "Probar la demo de decisiones de producto",
    back: "Todas las guías de decisiones de producto",
    updated: "Publicado el 28 de septiembre de 2026",
  },
} as const;

export function GuideShell({
  locale,
  alternateHref,
  children,
}: {
  locale: Locale;
  alternateHref: string;
  children: React.ReactNode;
}) {
  const labels = copy[locale];
  const guideIndex = guideIndexHref(locale);

  return (
    <div className="lm-page lm-guide-page">
      <div className="lm-wrap">
        <header className="lm-nav lm-guide-nav">
          <Wordmark />
          <nav className="lm-guide-links" aria-label={locale === "en" ? "Main navigation" : "Navegación principal"}>
            <Link href={`/${locale}`}>{labels.home}</Link>
            <Link href={guideIndex}>{labels.index}</Link>
            <Link href={alternateHref} hrefLang={otherLocale(locale)} lang={otherLocale(locale)}>{labels.switch}</Link>
            <Link className="lm-btn" href={liveDemoPath(locale)}>{labels.tryDemo}</Link>
          </nav>
        </header>
      </div>
      {children}
      <footer className="lm-footer lm-guide-footer">
        <div className="lm-wrap lm-guide-footer-inner">
          <div>
            <Wordmark />
            <p>{labels.next}</p>
          </div>
          <nav aria-label={locale === "en" ? "Footer navigation" : "Navegación del pie de página"}>
            <Link href={guideIndex}>{labels.back}</Link>
            <Link href={liveDemoPath(locale)}>{labels.cta}</Link>
          </nav>
          <span>© 2026 Lumo</span>
        </div>
      </footer>
    </div>
  );
}

export function GuideIndex({ locale }: { locale: Locale }) {
  const labels = copy[locale];
  const articles = allGuideArticles(locale);

  return (
    <main className="lm-guide-main lm-guide-index">
      <div className="lm-guide-eyebrow">{labels.eyebrow}</div>
      <h1>{locale === "en" ? "Product decisions, made clearer" : "Decisiones de producto más claras"}</h1>
      <p className="lm-guide-intro">
        {locale === "en"
          ? "Practical, experience-led guides for the decisions that shape a product team—from slipping dates to staffing trade-offs."
          : "Guías prácticas basadas en experiencia para las decisiones que dan forma a un equipo de producto: fechas, scope y contratación."}
      </p>
      <div className="lm-guide-list" aria-label={locale === "en" ? "Product decision articles" : "Artículos sobre decisiones de producto"}>
        {articles.map((article) => (
          <article className="lm-guide-card" key={article.id}>
            <div className="lm-guide-card-meta">
              <span>{labels.minutes(article.minutes)}</span>
              <span aria-hidden="true">·</span>
              <span>{labels.updated}</span>
            </div>
            <h2><Link href={guideArticleHref(locale, article.id)}>{article.title}</Link></h2>
            <p>{article.summary}</p>
            <Link className="lm-guide-read-link" href={guideArticleHref(locale, article.id)}>
              {locale === "en" ? "Read the guide" : "Leer la guía"}
              <span aria-hidden="true"> →</span>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export function GuideArticle({ locale, id }: { locale: Locale; id: GuideId }) {
  const article = getGuideArticle(id, locale);
  const labels = copy[locale];
  const alternate = guideArticleHref(otherLocale(locale), id);
  return (
    <GuideShell locale={locale} alternateHref={alternate}>
      <main className="lm-guide-main lm-guide-article">
        <nav className="lm-guide-breadcrumb" aria-label={locale === "en" ? "Breadcrumb" : "Ruta de navegación"}>
          <Link href={guideIndexHref(locale)}>{labels.back}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{article.title}</span>
        </nav>
        <article>
          <header className="lm-guide-article-header">
            <div className="lm-guide-eyebrow">{labels.eyebrow}</div>
            <h1>{article.title}</h1>
            <p className="lm-guide-dek">{article.summary}</p>
            <div className="lm-guide-byline">
              <span>{byline.replace("By ", locale === "en" ? "By " : "Por ")}</span>
              <span aria-hidden="true">·</span>
              <span>{labels.minutes(article.minutes)}</span>
            </div>
          </header>
          <div className="lm-guide-prose">
            {article.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {article.sections.map((section, index) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {index === 2 && (
                  <figure className="lm-guide-message">
                    <figcaption>{labels.example}</figcaption>
                    <div className="lm-guide-message-bar">
                      <span aria-hidden="true" className="lm-guide-message-dot" />
                      <span>{article.exampleLabel}</span>
                    </div>
                    <blockquote>{article.exampleMessage}</blockquote>
                  </figure>
                )}
              </section>
            ))}
            <aside className="lm-guide-takeaway">
              <h2>{labels.takeaway}</h2>
              <p>{article.takeaway}</p>
            </aside>
          </div>
          <aside className="lm-guide-cta">
            <div>
              <span className="lm-guide-eyebrow">Lumo</span>
              <p>{labels.next}</p>
            </div>
            <Link className="lm-btn" href={liveDemoPath(locale)}>{labels.cta}</Link>
          </aside>
        </article>
      </main>
    </GuideShell>
  );
}


