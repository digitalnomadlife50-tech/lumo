"use client";

import { Reveal, Wordmark, delay } from "./ui";
import { LiveDemo, demoMapPoints } from "./live-demo";
import { JudgmentMap } from "./judgment-map";
import { MonthlyBriefCard } from "./monthly-brief";
import { DEMO_DECISIONS } from "@/lib/demo/decisions";
import { computeBrief } from "@/lib/demo/brief";

const HOW = [
  ["Your gut first.", "Ten seconds, before you see anything. It's the only honest record of what you actually thought."],
  ["The legwork, done.", "Research, reactions, a premortem, and how each option plays out."],
  ["See the gap.", "Where your instinct matched the evidence, and what you missed."],
  ["Learn from how it went.", "Rate the reasoning and the result separately. Good calls can go badly. Lucky ones can go well."],
];

const CAPTURE = [
  ["Paste", "M9 4h6a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a1 1 0 0 1 1-1Zm0 3h6V6H9v1Z"],
  ["Screenshot", "M4 7a2 2 0 0 1 2-2h1l1-1.5h6L15 5h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm7 2.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"],
  ["Voice", "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3ZM6 11a6 6 0 0 0 12 0M12 17v4"],
  ["Clip", "M8 6a3 3 0 0 1 6 0v8a4 4 0 0 1-8 0V8"],
  ["Forward", "M3 6h18v12H3V6Zm0 0 9 7 9-7"],
];

export default function Landing() {
  const october = computeBrief(DEMO_DECISIONS, "October");

  return (
    <div className="lm-page">
      <div className="lm-wrap">
        <nav className="lm-nav">
          <Wordmark />
          <div className="lm-nav-links">
            <a className="lm-navlink" href="#how">How it works</a>
            <a className="lm-navlink" href="#map">The map</a>
            <a className="lm-navlink" href="#why">Why Lumo</a>
            <a className="lm-btn" href="/app" style={{ padding: "11px 22px" }}>Try Lumo</a>
          </div>
        </nav>

        <section className="lm-hero lm-hero-center">
          <div className="lm-hero-copy lm-hero-copy-center">
            <div className="lm-anim lm-label" style={delay(0)}>For product managers in the AI era</div>
            <h1 className="lm-anim lm-h1" style={delay(80)}>
              Get better at the calls <span>AI can&apos;t make for you.</span>
            </h1>
            <p className="lm-anim lm-lede" style={delay(160)}>
              Lumo does the legwork on your hard decisions. You make a quick gut call first, then see what the evidence says. Over time, you learn where your instincts are right and where they need a second look.
            </p>
            <div className="lm-anim lm-row lm-row-center" style={delay(240)}>
              <a className="lm-btn" href="/app" style={{ padding: "15px 28px", fontSize: 16 }}>Bring a real decision</a>
              <a className="lm-btn-sec" href="#demo" style={{ padding: "14px 24px", fontSize: 16 }}>Watch it work</a>
            </div>
            <div className="lm-anim lm-mono lm-caption" style={delay(320)}>Works on day one. No IT approval needed.</div>
          </div>
        </section>
      </div>

      <section id="demo" className="lm-wrap lm-section" style={{ paddingTop: 8 }}>
        <LiveDemo />
      </section>

      <section className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <h2 className="lm-h2" style={{ maxWidth: 680 }}>AI gave you more options. It didn&apos;t give you more judgment.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
            <p className="lm-body-lg">You get more drafts, more analysis, and more ideas than ever. You still have the same hours to decide what&apos;s right.</p>
            <p className="lm-body-lg">And the more you hand off, the less you practice the part that&apos;s still yours.</p>
          </div>
        </div>
      </section>

      <section id="how" style={{ background: "var(--lm-muted)" }}>
        <div className="lm-wrap lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="lm-label">How it works</div>
              <h2 className="lm-h2">Four moves, every decision.</h2>
            </div>
          </div>
          <div className="lm-grid4">
            {HOW.map(([t, b], i) => (
              <Reveal key={t} delayMs={i * 120} className="lm-why-card is-lumo" as="article">
                <strong>{t}</strong>
                {b}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="map" className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
            <div className="lm-label">The map</div>
            <h2 className="lm-h2">See how you decide.</h2>
            <p className="lm-body-lg">Every decision becomes a point. After a few months, the patterns are hard to miss.</p>
          </div>
        </div>
        <JudgmentMap points={demoMapPoints()} />
      </section>

      <section style={{ background: "var(--lm-muted)" }}>
        <div className="lm-wrap lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
              <div className="lm-label">The brief</div>
              <h2 className="lm-h2">Once a month, the short version.</h2>
              <p className="lm-body-lg">What you&apos;re good at, where you run off, and one thing to try next month. Lumo reminds you the next time it comes up.</p>
            </div>
          </div>
          <MonthlyBriefCard brief={october} />
        </div>
      </section>

      <section className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
            <div className="lm-label">No IT ticket</div>
            <h2 className="lm-h2">Works on day one.</h2>
            <p className="lm-body-lg">Paste it, clip it, forward it, or just talk it through after the meeting. Names get hidden before anything is sent. Your decisions stay in your browser.</p>
          </div>
        </div>
        <div className="lm-capture-row">
          {CAPTURE.map(([label, d], i) => (
            <Reveal key={label} delayMs={i * 80} className="lm-capture-opt">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={d} />
              </svg>
              <span>{label}</span>
            </Reveal>
          ))}
        </div>
        <div className="lm-mono lm-caption" style={{ marginTop: 20 }}>Connected apps come with the team plan.</div>
      </section>

      <section id="why" style={{ background: "var(--lm-muted)" }}>
        <div className="lm-wrap lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
              <div className="lm-label">Why Lumo</div>
              <h2 className="lm-h2">Why not just ask ChatGPT or Claude?</h2>
              <p className="lm-body-lg">You can, and for one decision it&apos;ll help. But a chat doesn&apos;t record your gut before you know the answer, doesn&apos;t know how your last ten calls went, and won&apos;t remind you of your own advice when it counts.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="lm-wrap">
        <Reveal className="lm-ctaband">
          <h2 className="lm-h2">Bring the call you&apos;re sitting on.</h2>
          <a className="lm-btn-dark" href="/app">Start a decision</a>
        </Reveal>
      </div>

      <footer className="lm-footer">
        <div className="lm-wrap lm-footer-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Wordmark />
            <div style={{ fontSize: 15, color: "#C9C3B8" }}>Get better at the calls AI can&apos;t make for you.</div>
          </div>
          <div style={{ fontSize: 14, color: "var(--lm-text-3)", lineHeight: 1.8 }}>
            <a href="https://linkedin.com/in/terrancerange" style={{ color: "var(--lm-text-3)" }}>Built by Terrance Range</a>
            <br />
            2026
          </div>
        </div>
      </footer>
    </div>
  );
}
