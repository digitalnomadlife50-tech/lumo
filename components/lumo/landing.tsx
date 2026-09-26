"use client";

import { Reveal, Wordmark, delay } from "./ui";
import { LiveDemo, demoMapPoints } from "./live-demo";
import { JudgmentMap } from "./judgment-map";
import { MonthlyBriefCard } from "./monthly-brief";
import { DEMO_DECISIONS } from "@/lib/demo/decisions";
import { computeBrief } from "@/lib/demo/brief";

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
            <a className="lm-navlink" href="#demo">How it works</a>
            <a className="lm-navlink" href="#record">Over time</a>
            <a className="lm-navlink" href="#why">Why Lumo</a>
            <a className="lm-navlink" href="#about">About</a>
            <a className="lm-btn" href="/app" style={{ padding: "11px 22px" }}>Try the demo</a>
          </div>
        </nav>

        <section className="lm-hero lm-hero-center">
          <div className="lm-hero-copy lm-hero-copy-center">
            <div className="lm-anim lm-label" style={delay(0)}>A decision tool for product managers</div>
            <h1 className="lm-anim lm-h1" style={delay(80)}>
              Hard calls, with the <span>legwork done.</span>
            </h1>
            <p className="lm-anim lm-lede" style={delay(160)}>
              Make your gut call first. Lumo does the research, shows where your instinct and the evidence disagree, and drafts the message for each audience. It keeps a record, so you learn where your instincts hold and where they slip.
            </p>
            <div className="lm-anim lm-row lm-row-center" style={delay(240)}>
              <a className="lm-btn" href="/app" style={{ padding: "15px 28px", fontSize: 16 }}>Try the demo</a>
              <a className="lm-btn-sec" href="#demo" style={{ padding: "14px 24px", fontSize: 16 }}>Watch it work</a>
            </div>
            <div className="lm-anim lm-mono lm-caption" style={delay(320)}>Free demo. No sign-up. Your decisions stay in your browser.</div>
          </div>
        </section>
      </div>

      <section id="demo" className="lm-wrap lm-section" style={{ paddingTop: 8 }}>
        <LiveDemo />
      </section>

      <section className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="lm-label">The problem</div>
            <h2 className="lm-h2" style={{ maxWidth: 680 }}>AI gave you more options. It didn&apos;t give you more judgment.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
            <p className="lm-body-lg">You get more drafts, more analysis, and more ideas than ever. You still have the same hours to decide what&apos;s right.</p>
            <p className="lm-body-lg">And the more you hand off, the less you practice the part that&apos;s still yours.</p>
          </div>
        </div>
      </section>

      <section id="record" style={{ background: "var(--lm-muted)" }}>
        <div className="lm-wrap lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
              <div className="lm-label">Over time</div>
              <h2 className="lm-h2">It remembers how your calls turned out.</h2>
              <p className="lm-body-lg">Every decision becomes a point. After a few months, the patterns are hard to miss.</p>
            </div>
          </div>
          <JudgmentMap points={demoMapPoints()} />
          <p className="lm-body-lg" style={{ marginTop: 16, marginBottom: 48, maxWidth: 640, color: "var(--lm-text-2)" }}>
            Each dot is a decision. Left to right is how sure you were. Up and down is how it turned out.
          </p>
          <MonthlyBriefCard brief={october} />
        </div>
      </section>

      <section className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
            <div className="lm-label">No IT ticket</div>
            <h2 className="lm-h2">Works on day one.</h2>
            <p className="lm-body-lg">Paste it, clip it, forward it, or just talk it through after the meeting.</p>
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
      </section>

      <section id="why" style={{ background: "var(--lm-muted)" }}>
        <div className="lm-wrap lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
              <div className="lm-label">Why Lumo</div>
              <h2 className="lm-h2">Why not ChatGPT, or a decision journal?</h2>
              <p className="lm-body-lg">A chat will help with one decision, but it starts from zero every time. It doesn&apos;t record your gut before you know the answer, and it doesn&apos;t know how your last ten calls went. A decision journal keeps the record, but you do all the work. Lumo does the legwork on the decision in front of you and remembers how it turned out.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
            <div className="lm-label">Why I built this</div>
            <p className="lm-body-lg" style={{ fontSize: 19 }}>
              I&apos;m a product leader and three-time founder. I kept watching PM friends make a hard call, then lose days carrying it to every team that needed to hear it. AI made the drafts faster. It didn&apos;t make the judgment better, and it never remembered how last quarter&apos;s calls went. Lumo is my attempt at that part. It&apos;s a working prototype, built end to end.
            </p>
            <a className="lm-link" href="https://linkedin.com/in/terrancerange" style={{ fontWeight: 500 }}>Terrance Range</a>
          </div>
        </div>
      </section>

      <div className="lm-wrap">
        <Reveal className="lm-ctaband">
          <h2 className="lm-h2">Bring the call you&apos;re sitting on.</h2>
          <a className="lm-btn-dark" href="/app">Try the demo</a>
        </Reveal>
      </div>

      <footer className="lm-footer">
        <div className="lm-wrap lm-footer-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Wordmark />
            <div style={{ fontSize: 15, color: "#C9C3B8" }}>Hard calls, with the legwork done.</div>
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
