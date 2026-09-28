"use client";

import { LanguageSwitcher, Reveal, Wordmark, delay } from "./ui";
import { LiveDemo } from "./live-demo";
import { OverTime } from "./over-time";
import { ClipboardPaste, Forward, Mic, Scan, Video, type LucideIcon } from "lucide-react";
import { useDict, useLocaleHref } from "@/lib/i18n";

const INPUT_ICONS: LucideIcon[] = [ClipboardPaste, Scan, Mic, Video, Forward];

export default function Landing() {
  const d = useDict();
  const lh = useLocaleHref();
  const t = d.landing;
  return (
    <div className="lm-page">
      <div className="lm-wrap">
        <nav className="lm-nav">
          <Wordmark />
          <div className="lm-nav-links">
            <a className="lm-navlink" href="#demo">{d.nav.howItWorks}</a>
            <a className="lm-navlink" href="#record">{d.nav.overTime}</a>
            <a className="lm-navlink" href="#why">{d.nav.whyLumo}</a>
            <a className="lm-navlink" href="#about">{d.nav.about}</a>
            <LanguageSwitcher />
            <a className="lm-btn" href={lh("/app")} style={{ padding: "11px 22px" }}>{d.common.tryDemo}</a>
          </div>
        </nav>

        <section className="lm-hero lm-hero-center">
          <div className="lm-hero-copy lm-hero-copy-center">
            <div className="lm-anim lm-label" style={delay(0)}>{t.heroLabel}</div>
            <h1 className="lm-anim lm-h1" style={delay(80)}>
              {t.heroTitleA}<span>{t.heroTitleB}</span>
            </h1>
            <p className="lm-anim lm-lede" style={delay(160)}>
              {t.heroLede}
            </p>
            <div className="lm-anim lm-row lm-row-center" style={delay(240)}>
              <a className="lm-btn" href={lh("/app")} style={{ padding: "15px 28px", fontSize: 16 }}>{d.common.tryDemo}</a>
              <a className="lm-btn-sec" href="#demo" style={{ padding: "14px 24px", fontSize: 16 }}>{t.watchItWork}</a>
            </div>
            <div className="lm-anim lm-mono lm-caption" style={delay(320)}>{t.heroCaption}</div>
          </div>
        </section>
      </div>

      <section id="demo" className="lm-wrap lm-section lm-section-tight">
        <h2 className="sr-only">{t.howItWorksSr}</h2>
        <LiveDemo />
      </section>

      <section className="lm-wrap lm-section">
        <div className="lm-problem">
          <div className="lm-problem-copy">
            <div className="lm-label">{t.problemLabel}</div>
            <h2 className="lm-h2">{t.problemTitle}</h2>
            <p className="lm-body-lg">{t.problemBody1}</p>
            <p className="lm-body-lg">{t.problemBody2}</p>
          </div>
          <Reveal className="lm-problem-art">
            <img
              src="/illustrations/spot-problem.png"
              alt={t.problemImgAlt}
              width={1000}
              height={545}
              className="lm-spot-img"
            />
          </Reveal>
        </div>
      </section>

      <section id="record" style={{ background: "var(--lm-muted)" }}>
        <OverTime />
      </section>

      <section className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <div className="lm-sec-copy">
            <h2 className="lm-h2">{t.captureTitle}</h2>
            <p className="lm-body-lg">{t.captureBody}</p>
          </div>
        </div>
        <div className="lm-capture-row">
          {t.inputs.map((label, i) => {
            const Icon = INPUT_ICONS[i];
            return (
              <Reveal key={label} delayMs={i * 80} className="lm-capture-opt">
                <Icon className="lm-capture-icon" strokeWidth={1.5} aria-hidden="true" />
                <span>{label}</span>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="why" style={{ background: "var(--lm-muted)" }}>
        <div className="lm-wrap lm-section">
          <div className="lm-sec-head">
            <div className="lm-sec-copy">
              <div className="lm-label">{t.whyLabel}</div>
              <h2 className="lm-h2">{t.whyTitle}</h2>
              <p className="lm-body-lg">{t.whyBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="lm-wrap lm-section">
        <div className="lm-about">
          <img
            src="/illustrations/terry-portrait.png"
            alt={t.aboutImgAlt}
            width={180}
            height={180}
            className="lm-about-portrait"
          />
          <div className="lm-about-copy">
            <div className="lm-label">{t.aboutLabel}</div>
            <p className="lm-body-lg" style={{ fontSize: 19 }}>
              {t.aboutBody}
            </p>
            <a className="lm-link" href="https://linkedin.com/in/terrancerange" style={{ fontWeight: 500 }}>{t.aboutName}</a>
          </div>
        </div>
      </section>

      <div className="lm-wrap">
        <Reveal className="lm-ctaband">
          <div className="lm-ctaband-copy">
            <h2 className="lm-h2">{t.ctaTitle}</h2>
            <a className="lm-btn-dark" href={lh("/app")}>{d.common.tryDemo}</a>
          </div>
          <div className="lm-ctaband-note" aria-hidden="true">
            <span className="lm-ctaband-tape" />
            <div className="lm-indexcard lm-ctaband-card">
              <span className="lm-indexcard-rule" />
              <div className="lm-indexcard-inner">
                <div className="lm-label">{t.ctaCardLabel}</div>
                <p className="lm-indexcard-opt">{t.ctaCardOption}</p>
                <div className="lm-indexcard-rows">
                  <div>
                    <span className="lm-caption">{d.common.confidence}</span>
                    <span className="lm-indexcard-val">4 {d.common.of5}</span>
                  </div>
                  <div>
                    <span className="lm-caption">{d.common.gaveUp}</span>
                    <span className="lm-indexcard-val">{t.ctaCardGaveUp}</span>
                  </div>
                </div>
              </div>
              <div className="lm-indexcard-stamp">{t.ctaCardStamp}</div>
            </div>
          </div>
        </Reveal>
      </div>

      <footer className="lm-footer">
        <div className="lm-wrap lm-footer-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Wordmark />
            <div style={{ fontSize: 15, color: "#C9C3B8" }}>{t.footerTagline}</div>
          </div>
          <div style={{ fontSize: 14, color: "var(--lm-text-3)", lineHeight: 1.8 }}>
            <a href="https://linkedin.com/in/terrancerange" style={{ color: "var(--lm-text-3)" }}>{t.footerBuiltBy}</a>
            <br />
            2026
          </div>
        </div>
      </footer>
    </div>
  );
}
