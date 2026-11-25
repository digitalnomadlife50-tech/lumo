import Link from "next/link";
import { LanguageSwitcher, Wordmark } from "./ui";
import type { Locale } from "@/lib/i18n/locales";
import type { LegalDocument } from "@/lib/legal-content";

const labels = {
  en: {
    eyebrow: "Lumo / Legal",
    effective: "Effective",
    contents: "On this page",
    back: "Back to Lumo",
    footer: "A feedback loop for product judgment.",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact Terrance Range",
    footerNav: "Legal navigation",
  },
  es: {
    eyebrow: "Lumo / Legal",
    effective: "En vigor desde",
    contents: "En esta página",
    back: "Volver a Lumo",
    footer: "Un ciclo de feedback para el criterio de producto.",
    privacy: "Privacidad",
    terms: "Términos",
    contact: "Contactar con Terrance Range",
    footerNav: "Navegación legal",
  },
} as const;

export function LegalPage({ locale, content }: { locale: Locale; content: LegalDocument }) {
  const t = labels[locale];
  const home = `/${locale}`;

  return (
    <div className="lm-page lm-legal-page">
      <div className="lm-wrap">
        <header className="lm-nav lm-legal-nav">
          <Wordmark href={home} />
          <div className="lm-legal-nav-actions">
            <Link className="lm-backlink" href={home}>{t.back}</Link>
            <LanguageSwitcher />
          </div>
        </header>
      </div>

      <main className="lm-legal-main">
        <div className="lm-legal-intro">
          <div className="lm-label">{t.eyebrow}</div>
          <h1 className="lm-h1">{content.title}</h1>
          <p className="lm-lede">{content.description}</p>
          <p className="lm-caption">{t.effective}: {content.effectiveDate}</p>
        </div>

        <div className="lm-legal-body">
          <aside className="lm-legal-toc">
            <nav aria-label={t.contents}>
              <span className="lm-label">{t.contents}</span>
              <ol>
                {content.sections.map((section, index) => (
                  <li key={section.heading}>
                    <a href={`#section-${index + 1}`}>{section.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="lm-legal-content">
            {content.sections.map((section, index) => (
              <section key={section.heading} id={`section-${index + 1}`}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </main>

      <footer className="lm-footer lm-legal-footer">
        <div className="lm-wrap lm-footer-inner">
          <div className="lm-legal-footer-brand">
            <Wordmark href={home} />
            <p>{t.footer}</p>
          </div>
          <nav className="lm-legal-footer-links" aria-label={t.footerNav}>
            <Link href={`${home}/privacy`}>{t.privacy}</Link>
            <Link href={`${home}/terms`}>{t.terms}</Link>
            <a href="https://terrance.company">{t.contact}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
