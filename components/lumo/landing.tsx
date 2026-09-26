"use client";

import { Reveal, Wordmark, delay } from "./ui";
import { LiveDemo, demoMapPoints } from "./live-demo";
import { JudgmentMap } from "./judgment-map";
import { MonthlyBriefCard } from "./monthly-brief";
import { DEMO_DECISIONS } from "@/lib/demo/decisions";
import { computeBrief } from "@/lib/demo/brief";
import { ClipboardPaste, Forward, Mic, Scan, Video, type LucideIcon } from "lucide-react";

const INPUTS: [string, LucideIcon][] = [
  ["Paste", ClipboardPaste],
  ["Screenshot", Scan],
  ["Voice", Mic],
  ["Video clip", Video],
  ["Forward", Forward],
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
              Make hard product decisions faster, and <span>learn from every one.</span>
            </h1>
            <p className="lm-anim lm-lede" style={delay(160)}>
              Write down your first instinct. Lumo does the research, shows where your instinct and the evidence disagree, and drafts an update for each person or team who needs to know. Over time, you see where your instincts are right and where they&apos;re off.
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
        <div className="lm-problem">
          <div className="lm-problem-copy">
            <div className="lm-label">The problem</div>
            <h2 className="lm-h2">AI gave you more options. It didn&apos;t give you more judgment.</h2>
            <p className="lm-body-lg">You get more drafts, more analysis, and more ideas than ever. You still have the same hours to decide what&apos;s right.</p>
            <p className="lm-body-lg">And the more you hand off, the less you practice the part that&apos;s still yours.</p>
          </div>
          <Reveal className="lm-problem-art">
            <img
              src="/illustrations/spot-problem.png"
              alt="A tall stack of drafts beside one small blank index card"
              width={1408}
              height={768}
              className="lm-spot-img"
            />
          </Reveal>
        </div>
      </section>

      <section id="record" style={{ background: "var(--lm-muted)" }}>
        <div className="lm-wrap lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
              <div className="lm-label">Over time</div>
              <h2 className="lm-h2">It remembers how your decisions turned out.</h2>
              <p className="lm-body-lg">Jordan&apos;s 40 past decisions. Each dot is one.</p>
            </div>
          </div>
          <JudgmentMap points={demoMapPoints()} variant="replay" />
          <p className="lm-body-lg" style={{ marginTop: 16, marginBottom: 48, maxWidth: 640, color: "var(--lm-text-2)" }}>
            Left to right is how sure Jordan was, from 1 to 5. Up and down is how it turned out.
          </p>
          <MonthlyBriefCard brief={october} />
        </div>
      </section>

      <section className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
            <h2 className="lm-h2">Works right away. No IT approval needed.</h2>
            <p className="lm-body-lg">Paste text, add a screenshot, forward an email, upload a video clip, or talk it through after the meeting.</p>
          </div>
        </div>
        <div className="lm-capture-row">
          {INPUTS.map(([label, Icon], i) => (
            <Reveal key={label} delayMs={i * 80} className="lm-capture-opt">
              <Icon className="lm-capture-icon" strokeWidth={1.5} aria-hidden="true" />
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
              <p className="lm-body-lg">A chat will help with one decision, but it starts from nothing every time. It doesn&apos;t record your first instinct before you know the answer, and it doesn&apos;t know how your past decisions turned out. A decision journal keeps the history, but you do all the work. Lumo does the research on the decision in front of you and remembers how it turned out.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="lm-wrap lm-section">
        <div className="lm-about">
          <img
            src="/illustrations/terry-portrait.png"
            alt="Terrance Range"
            width={180}
            height={180}
            className="lm-about-portrait"
          />
          <div className="lm-about-copy">
            <div className="lm-label">Why I built this</div>
            <p className="lm-body-lg" style={{ fontSize: 19 }}>
              I&apos;m a product leader and three-time founder. I kept watching product manager friends make a hard decision, then spend days explaining it to every team that needed to hear it. AI made the drafts faster. It didn&apos;t make the decisions better, and it never remembered how last quarter&apos;s decisions turned out. Lumo is my attempt at that part. It&apos;s a working prototype, built end to end.
            </p>
            <a className="lm-link" href="https://linkedin.com/in/terrancerange" style={{ fontWeight: 500 }}>Terrance Range</a>
          </div>
        </div>
      </section>

      <div className="lm-wrap">
        <Reveal className="lm-ctaband">
          <div className="lm-ctaband-card" aria-hidden="true" />
          <h2 className="lm-h2">Bring a decision you&apos;re stuck on.</h2>
          <a className="lm-btn-dark" href="/app">Try the demo</a>
        </Reveal>
      </div>

      <footer className="lm-footer">
        <div className="lm-wrap lm-footer-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Wordmark />
            <div style={{ fontSize: 15, color: "#C9C3B8" }}>Make hard product decisions faster, and learn from every one.</div>
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
