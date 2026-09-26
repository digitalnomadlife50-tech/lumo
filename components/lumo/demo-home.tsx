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
            <h2 className="lm-h2">This is what 40 decisions later looks like.</h2>
            <p style={{ margin: 0, fontSize: 19, opacity: 0.92 }}>Yours starts with one.</p>
            <Link className="lm-btn-dark" href="/app">Bring a real decision</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
