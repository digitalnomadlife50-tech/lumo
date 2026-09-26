"use client"

import Link from "next/link"
import { Wordmark } from "./ui"
import { JudgmentMap } from "./judgment-map"
import { MonthlyBriefCard } from "./monthly-brief"
import { LiveDemo, demoMapPoints } from "./live-demo"
import { PERSONA } from "@/lib/demo/persona"
import { DEMO_DECISIONS } from "@/lib/demo/decisions"
import { CURRENT_DECISION } from "@/lib/demo/current"
import { computeBrief } from "@/lib/demo/brief"

export default function DemoHome() {
  const brief = computeBrief(DEMO_DECISIONS, "October")
  const points = demoMapPoints()
  const recent = [...DEMO_DECISIONS].sort((a, b) => b.number - a.number).slice(0, 4)
  const first = DEMO_DECISIONS.find((d) => d.number === 1) ?? DEMO_DECISIONS[0]

  return (
    <div className="lm-page">
      <div className="lm-wrap">
        <nav className="lm-nav">
          <Wordmark />
          <div className="lm-nav-links">
            <Link className="lm-navlink" href="/">Home</Link>
            <Link className="lm-btn" href="/app" style={{ padding: "11px 22px" }}>Bring your own decision</Link>
          </div>
        </nav>

        <header className="lm-demo-hero">
          <div className="lm-label">Demo mode</div>
          <h1 className="lm-h1" style={{ maxWidth: 780 }}>
            You&apos;re looking at {PERSONA.name}&apos;s Lumo.
          </h1>
          <p className="lm-lede" style={{ maxWidth: 620 }}>
            {PERSONA.role} at {PERSONA.company}, {PERSONA.monthsUsing} months and 40 decisions in. This is what Lumo looks like once it knows you. Nothing here calls an API. It already happened.
          </p>
        </header>

        <section className="lm-section" style={{ paddingTop: 24 }}>
          <div className="lm-noticed">
            <div className="lm-label">On your mind right now</div>
            <h2 className="lm-noticed-q">{CURRENT_DECISION.question}</h2>
            <p className="lm-noticed-body">
              Your first instinct says {CURRENT_DECISION.gut.option}, confidence {CURRENT_DECISION.gut.confidence}. Here&apos;s what you might not have noticed: {CURRENT_DECISION.gap}
            </p>
            <a className="lm-btn" href="#walkthrough" style={{ alignSelf: "flex-start" }}>Watch how it played out</a>
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
              <div className="lm-label">Recent calls</div>
              <h2 className="lm-h2">The last few, and how they landed.</h2>
            </div>
          </div>
          <div className="lm-recent">
            {recent.map((d) => (
              <article key={d.number} className="lm-recent-card">
                <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>No.{d.number} / {d.kind}</div>
                <h3 className="lm-recent-title">{d.title}</h3>
                <div className={`lm-recent-result is-${d.outcome.result}`}>
                  {d.outcome.result === "better" ? "Better than expected" : d.outcome.result === "worse" ? "Worse than expected" : "As expected"}
                </div>
                <p className="lm-recent-lesson">{d.outcome.lesson}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="walkthrough" className="lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 620 }}>
              <div className="lm-label">The open decision, start to finish</div>
              <h2 className="lm-h2">No.{CURRENT_DECISION.number}, played out.</h2>
            </div>
          </div>
          <LiveDemo />
        </section>

        <section className="lm-section">
          <div className="lm-ctaband">
            <div className="lm-ctaband-copy">
              <h2 className="lm-h2">This is what 40 decisions later looks like.</h2>
              <ul className="lm-ctaband-receipts">
                <li>
                  <strong>One pattern found.</strong> Nine of the 40 calls went worse than expected. Seven of them were dates.
                </li>
                <li>
                  <strong>One rule that stuck.</strong>{" "}When you give a customer a date, add your engineering lead&apos;s worst case first.
                </li>
                <li>
                  <strong>Nothing dropped.</strong> All 40 revisited and rated, including the ones that stung.
                </li>
              </ul>
              <p className="lm-ctaband-pivot">Yours starts with one.</p>
              <Link className="lm-btn-dark" href="/app">Bring a real decision</Link>
            </div>
            <div className="lm-ctaband-note">
              <span className="lm-ctaband-tape" aria-hidden="true" />
              <div className="lm-indexcard lm-ctaband-card">
                <span className="lm-indexcard-rule" aria-hidden="true" />
                <div className="lm-indexcard-inner">
                  <div className="lm-label">Where {PERSONA.name} started</div>
                  <p className="lm-indexcard-opt">{first.final.option}</p>
                  <div className="lm-indexcard-rows">
                    <div>
                      <span className="lm-caption">Confidence</span>
                      <span className="lm-indexcard-val">{first.final.confidence} of 5</span>
                    </div>
                    <div>
                      <span className="lm-caption">Gave up</span>
                      <span className="lm-indexcard-val">{first.final.gaveUp}</span>
                    </div>
                  </div>
                </div>
                <div className="lm-indexcard-stamp">
                  No. {first.number} &middot; {first.outcome.result === "better" ? "Turned out better" : first.outcome.result === "worse" ? "Turned out worse" : "Went as expected"}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
