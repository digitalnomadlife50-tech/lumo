"use client"

import Link from "next/link"
import { Wordmark } from "./ui"
import { JudgmentMap } from "./judgment-map"
import { MonthlyBriefCard } from "./monthly-brief"
import { LiveDemo, demoMapPoints } from "./live-demo"
import { useDict, useDemoData, useLocale, useLocaleHref } from "@/lib/i18n"
import { fill } from "@/lib/i18n/get-dictionary"

const NUMBER_WORDS: Record<string, string[]> = {
  en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  es: ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"],
}

/** Sentence-initial counts read better as words; mirrors the brief's convention. */
function countWord(locale: string, n: number) {
  const words = NUMBER_WORDS[locale] ?? NUMBER_WORDS.en
  const w = words[n] ?? String(n)
  return w.charAt(0).toUpperCase() + w.slice(1)
}

export default function DemoHome() {
  const d = useDict()
  const t = d.demoHome
  const locale = useLocale()
  const lh = useLocaleHref()
  const { persona, decisions, current, brief } = useDemoData("October")
  const points = demoMapPoints(decisions)
  const recent = [...decisions].sort((a, b) => b.number - a.number).slice(0, 4)
  const first = decisions.find((x) => x.number === 1) ?? decisions[0]

  // Receipt numbers come straight from the record so they can never drift from
  // the brief and the map, which compute theirs the same way.
  const total = decisions.length
  const worseCount = decisions.filter((x) => x.outcome.result === "worse").length
  const worseDateCount = decisions.filter((x) => x.outcome.result === "worse" && x.kind === "timing").length

  return (
    <div className="lm-page">
      <div className="lm-wrap">
        <nav className="lm-nav">
          <Wordmark />
          <div className="lm-nav-links">
            <Link className="lm-navlink" href={lh("/")}>{t.navHome}</Link>
            <Link className="lm-btn" href={lh("/app")} style={{ padding: "11px 22px" }}>{t.bringOwn}</Link>
          </div>
        </nav>

        <header className="lm-demo-hero">
          <div className="lm-label">{t.demoMode}</div>
          <h1 className="lm-h1" style={{ maxWidth: 780 }}>
            {fill(t.heroTitle, { name: persona.name })}
          </h1>
          <p className="lm-lede" style={{ maxWidth: 620 }}>
            {fill(t.heroLede, { role: persona.role, company: persona.company, months: persona.monthsUsing })}
          </p>
        </header>

        <section className="lm-section" style={{ paddingTop: 24 }}>
          <div className="lm-noticed">
            <div className="lm-label">{t.onYourMind}</div>
            <h2 className="lm-noticed-q">{current.question}</h2>
            <p className="lm-noticed-body">
              {fill(t.noticedLead, { option: current.gut.option, confidence: current.gut.confidence, gap: current.gap })}
            </p>
            <a className="lm-btn" href="#walkthrough" style={{ alignSelf: "flex-start" }}>{t.watchHow}</a>
          </div>
        </section>

        <section id="map" className="lm-section">
          <JudgmentMap points={points} />
        </section>

        <section className="lm-section">
          <MonthlyBriefCard brief={brief} />
        </section>

        <section className="lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 620 }}>
              <div className="lm-label">{t.recentLabel}</div>
              <h2 className="lm-h2">{t.recentTitle}</h2>
            </div>
          </div>
          <div className="lm-recent">
            {recent.map((x) => (
              <article key={x.number} className="lm-recent-card">
                <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>No.{x.number} / {x.kind}</div>
                <h3 className="lm-recent-title">{x.title}</h3>
                <div className={`lm-recent-result is-${x.outcome.result}`}>
                  {x.outcome.result === "better" ? t.results.better : x.outcome.result === "worse" ? t.results.worse : t.results.asExpected}
                </div>
                <p className="lm-recent-lesson">{x.outcome.lesson}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="walkthrough" className="lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 620 }}>
              <div className="lm-label">{t.walkthroughLabel}</div>
              <h2 className="lm-h2">{fill(t.walkthroughTitle, { number: current.number })}</h2>
            </div>
          </div>
          <LiveDemo />
        </section>

        <section className="lm-section">
          <div className="lm-ctaband">
            <div className="lm-ctaband-copy">
              <h2 className="lm-h2">{t.ctaTitle}</h2>
              <ul className="lm-ctaband-receipts">
                <li>
                  <strong>{t.receipts.pattern.lead}</strong>{" "}
                  {fill(t.receipts.pattern.body, {
                    worse: countWord(locale, worseCount),
                    total,
                    dates: countWord(locale, worseDateCount),
                  })}
                </li>
                <li>
                  <strong>{t.receipts.rule.lead}</strong> {t.receipts.rule.body}
                </li>
                <li>
                  <strong>{t.receipts.nothing.lead}</strong> {fill(t.receipts.nothing.body, { total })}
                </li>
              </ul>
              <p className="lm-ctaband-pivot">{t.ctaPivot}</p>
              <Link className="lm-btn-dark" href={lh("/app")}>{t.bringReal}</Link>
            </div>
            <div className="lm-ctaband-note">
              <span className="lm-ctaband-tape" aria-hidden="true" />
              <div className="lm-indexcard lm-ctaband-card">
                <span className="lm-indexcard-rule" aria-hidden="true" />
                <div className="lm-indexcard-inner">
                  <div className="lm-label">{fill(t.whereStarted, { name: persona.name })}</div>
                  <p className="lm-indexcard-opt">{first.final.option}</p>
                  <div className="lm-indexcard-rows">
                    <div>
                      <span className="lm-caption">{d.common.confidence}</span>
                      <span className="lm-indexcard-val">{first.final.confidence} {d.common.of5}</span>
                    </div>
                    <div>
                      <span className="lm-caption">{d.common.gaveUp}</span>
                      <span className="lm-indexcard-val">{first.final.gaveUp}</span>
                    </div>
                  </div>
                </div>
                <div className="lm-indexcard-stamp">
                  No. {first.number} &middot; {first.outcome.result === "better" ? t.stampResults.better : first.outcome.result === "worse" ? t.stampResults.worse : t.stampResults.asExpected}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
