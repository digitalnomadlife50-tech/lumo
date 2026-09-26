"use client";

import { useEffect, useState } from "react";
import { Reveal, Wordmark, delay, usePrefersReducedMotion } from "./ui";
import { ConceptAnimation } from "./concept";
import { ProductReplay } from "./replay";

const DILEMMAS = [
  "Ship v2 now or wait for enterprise",
  "Hire the senior engineer or wait for Q1 budget",
  "Cut the onboarding redesign from scope",
  "Tell the design lead their project is paused",
  "Deprecate the legacy API this year",
  "Push back on the VP's pet feature",
];

const STEPS = [
  { n: "01", name: "What's happening", body: "Paste the situation. Slack threads, tickets, notes. Lumo underlines the people, dates, and blockers it picks up as you paste.", label: "Picked up", sample: "3 people, 2 deadlines, 1 blocker (LUM-812), 1 event" },
  { n: "02", name: "Here's what I'm reading", body: "Lumo reads it back as the real question, what matters, who's affected, and how pressing it is. Edit anything that's off.", label: "The real question", sample: "Ship v2 this quarter, or hold it for the enterprise launch" },
  { n: "03", name: "Your options", body: "The paths you already see, plus at least one you didn't write down.", label: "Lumo added", sample: "Ship v2 now and give the three prospects a written SSO date" },
  { n: "04", name: "Side by side", body: "Every path costs something. See what each one costs, who it hurts, and whether you can undo it.", label: "Can you undo it", sample: "Holding six weeks: no. The re:Invent window closes either way." },
  { n: "05", name: "Your choice", body: "Commit to a path. Say why in a sentence. Rate your confidence. Name what you're giving up.", label: "What I'm giving up", sample: "A clean enterprise story at re:Invent" },
  { n: "06", name: "Tell people", body: "A tailored draft for every audience, written from the same decision. Edit lightly, copy, send.", label: "Drafts", sample: "Engineering, your VP, sales, support" },
];

const CHAT = [
  ["Blank canvas", "You stare at an empty box and write the prompt yourself."],
  ["One draft for everyone", "You rewrite it by hand for each audience."],
  ["No history", "Last quarter's reasoning is in a thread you'll never find."],
  ["You have to know what to ask", "It answers the question you typed, not the one you should have."],
];
const LUMO = [
  ["Structured flow", "You answer questions. Lumo handles the prompting."],
  ["Drafts per audience", "Different words for different people, from one decision."],
  ["Every call on record", "Numbered, searchable, with what you gave up."],
  ["Knows what to ask", "Built around the shape of a PM decision."],
];

export default function Landing() {
  const reduced = usePrefersReducedMotion();
  const [layer, setLayer] = useState(0);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"chat" | "lumo">("lumo");

  useEffect(() => {
    if (reduced) {
      setLayer(1);
      return;
    }
    const t = setInterval(() => setLayer((l) => (l + 1) % 3), 4000);
    return () => clearInterval(t);
  }, [reduced]);

  const cur = STEPS[step];
  const cards = mode === "chat" ? CHAT : LUMO;

  return (
    <div className="lm-page">
      <div className="lm-wrap">
        <nav className="lm-nav">
          <Wordmark />
          <div className="lm-nav-links">
            <a className="lm-navlink" href="#how">How it works</a>
            <a className="lm-navlink" href="#why">Why Lumo</a>
            <a className="lm-navlink" href="#proof">Example output</a>
            <a className="lm-btn" href="/app" style={{ padding: "11px 22px" }}>Try Lumo</a>
          </div>
        </nav>

        <section className="lm-hero">
          <div className="lm-hero-copy">
            <div className="lm-anim lm-label" style={delay(0)}>For product managers in the AI era</div>
            <h1 className="lm-anim lm-h1" style={delay(80)}>
              The decisions are yours. <span>The words for them are here.</span>
            </h1>
            <p className="lm-anim lm-lede" style={delay(160)}>
              Paste the mess. Lumo reads it back, lays out your options, and hands you the message each audience needs once you make the call.
            </p>
            <div className="lm-anim lm-row" style={delay(240)}>
              <a className="lm-btn" href="/app" style={{ padding: "15px 28px", fontSize: 16 }}>Bring a real decision</a>
              <a className="lm-btn-sec" href="#proof" style={{ padding: "14px 24px", fontSize: 16 }}>See a finished one</a>
            </div>
            <div className="lm-anim lm-mono lm-caption" style={delay(320)}>About 15 minutes. No setup. Nothing to connect.</div>
          </div>

          <div className="lm-anim lm-panel" style={delay(200)} aria-label="Example of Lumo turning a messy thread into drafted messages">
            <div className="lm-panel-bar">
              <span>lumo / example</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="lm-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lm-positive)" }} />
                ai connected
              </span>
            </div>

            <div className={`lm-panel-layer ${layer === 0 ? "is-on" : ""}`} aria-hidden={layer !== 0}>
              <div className="lm-label">01 What&apos;s happening</div>
              <div className="lm-raw">
                <div><b>#launch-v2</b> dana: sales needs v2 live for re:Invent, three enterprise deals riding on it</div>
                <div><b>#eng</b> marco: SSO is two sprints minimum, can&apos;t parallelize</div>
                <div><b>LUM-812</b> blocker: enterprise SSO not scoped</div>
                <div><b>dm / vp</b> need a call on this by friday</div>
                <div><b>#support</b> onboarding fix is in v2, 40 tickets waiting on it</div>
              </div>
            </div>

            <div className={`lm-panel-layer ${layer === 1 ? "is-on" : ""}`} aria-hidden={layer !== 1} style={{ gap: 18 }}>
              <div className="lm-label">02 Here&apos;s what I&apos;m reading</div>
              <div>
                <div className="lm-caption">The real question</div>
                <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em", marginTop: 4 }}>Ship v2 this quarter, or hold it for the enterprise launch</div>
              </div>
              <div>
                <div className="lm-caption">What matters</div>
                <div style={{ fontSize: 15, marginTop: 4 }}>Revenue timing against a release current customers are waiting on</div>
              </div>
              <div>
                <div className="lm-caption">Who&apos;s affected</div>
                <div style={{ fontSize: 15, marginTop: 4 }}>Engineering, sales, support, three enterprise prospects</div>
              </div>
              <p className="lm-sig" style={{ margin: 0 }}>I noticed the onboarding fix is riding on v2 too. Delaying doesn&apos;t only affect sales.</p>
            </div>

            <div className={`lm-panel-layer ${layer === 2 ? "is-on" : ""}`} aria-hidden={layer !== 2}>
              <div className="lm-label">06 Tell people</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="lm-tab is-on">Your VP</span>
                <span className="lm-tab">Engineering</span>
                <span className="lm-tab">Sales</span>
                <span className="lm-tab">Support</span>
              </div>
              <div style={{ background: "var(--lm-canvas)", border: "1px solid var(--lm-border)", borderRadius: 10, padding: 20, fontSize: 15, lineHeight: 1.6 }}>
                <div className="lm-mono lm-caption" style={{ fontSize: 12, marginBottom: 10 }}>Subject: v2 ships on time. SSO gets its own date.</div>
                Short version: v2 goes out on schedule to existing customers. Enterprise SSO moves to its own release with a committed date, so three deals don&apos;t hold up a fix 40 customers are waiting on.
              </div>
              <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>4 drafts ready. Copy and send.</div>
            </div>
          </div>
        </section>
      </div>

      <div className="lm-strip" aria-label="Examples of decisions">
        <div className="lm-strip-track">
          {[...DILEMMAS, ...DILEMMAS].map((d, i) => (
            <span key={i} style={{ display: "inline-flex", gap: 48 }} aria-hidden={i >= DILEMMAS.length}>
              <span>{d}</span>
              <em>/</em>
            </span>
          ))}
        </div>
      </div>

      <section className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <h2 className="lm-h2" style={{ maxWidth: 640 }}>The job changed. Your tools didn&apos;t.</h2>
          <p className="lm-body-lg" style={{ maxWidth: 420 }}>AI took the grunt work. What&apos;s left is the work that needs you, and nothing is built for it.</p>
        </div>
        <div className="lm-grid3">
          {[
            ["01", "Judgment under speed pressure", "Four prototypes by lunch. Thirty minutes to decide which one matters. AI doesn't help with the deciding."],
            ["02", "The alignment tax got bigger", "Everyone has AI. Everyone is pitching. You're the one who has to converge people without breaking them."],
            ["03", "One call, seven messages", "Your team, your VP, sales, support, the doc. Generic drafts don't land. You need ones that know your context."],
          ].map(([n, t, b], i) => (
            <Reveal key={n} delayMs={i * 120} className="lm-card" as="article">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="lm-probnum">{n}</div>
                <h3>{t}</h3>
                <p>{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="lm-dark">
        <div className="lm-wrap lm-section lm-split">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="lm-label">The artifact factory</div>
            <h2 className="lm-h2">Make the call once. Send it seven ways.</h2>
            <p className="lm-body-lg">Each audience needs a different message. Lumo drafts them from the same decision, so they don&apos;t contradict each other.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <ConceptAnimation />
          </div>
        </div>
      </section>

      <section id="how" className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="lm-label">The product</div>
            <h2 className="lm-h2">Six steps. About fifteen minutes.</h2>
          </div>
          <p className="lm-body-lg">Pick a step to see it.</p>
        </div>
        <div className="lm-steps">
          <div className="lm-steplist" role="tablist" aria-label="Product steps">
            {STEPS.map((s, i) => (
              <button
                key={s.n}
                role="tab"
                aria-selected={i === step}
                className={`lm-stepbtn ${i === step ? "is-on" : ""}`}
                onClick={() => setStep(i)}
              >
                <span className="lm-mono">{s.n}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
          <div className="lm-steppreview" role="tabpanel">
            <div key={step} className="lm-fade-swap" style={{ display: "flex", flexDirection: "column", gap: 20, flexGrow: 1 }}>
              <div className="lm-mono" style={{ fontSize: 12, color: "var(--lm-accent)" }}>STEP {cur.n}</div>
              <h3>{cur.name}</h3>
              <p className="lm-body-lg" style={{ maxWidth: 560 }}>{cur.body}</p>
              <div className="lm-sample">
                <div className="lm-label" style={{ marginBottom: 8 }}>{cur.label}</div>
                {cur.sample}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why" style={{ background: "var(--lm-muted)" }}>
        <div className="lm-wrap lm-section">
          <div className="lm-sec-head">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
              <div className="lm-label">Why Lumo</div>
              <h2 className="lm-h2">Why not just ChatGPT or Claude?</h2>
              <p className="lm-body-lg">You can paste anything into a chat. But a conversation is a thread, not a tool.</p>
            </div>
            <div className="lm-toggle" role="group" aria-label="Compare">
              <button className={mode === "chat" ? "is-on" : ""} aria-pressed={mode === "chat"} onClick={() => setMode("chat")}>A chat thread</button>
              <button className={mode === "lumo" ? "is-on" : ""} aria-pressed={mode === "lumo"} onClick={() => setMode("lumo")}>Lumo</button>
            </div>
          </div>
          <div key={mode} className="lm-grid4">
            {cards.map(([t, b], i) => (
              <div key={t} className={`lm-anim lm-why-card ${mode === "lumo" ? "is-lumo" : ""}`} style={delay(i * 80)}>
                <strong>{t}</strong>
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="lm-wrap lm-section">
        <div className="lm-sec-head">
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
            <div className="lm-label">Example output</div>
            <h2 className="lm-h2">Watch the whole thing play out.</h2>
            <p className="lm-body-lg">The real product, walking through a real decision. Pause, skip ahead, or step through it yourself.</p>
          </div>
          <a href="/app" style={{ fontSize: 16, fontWeight: 500, textDecoration: "none" }}>Try it with your own decision</a>
        </div>
        <ProductReplay />
      </section>

      <section className="lm-wrap lm-section lm-split">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="lm-label">One of the drafts</div>
          <h2 className="lm-h2">Judge it by what it writes.</h2>
          <p className="lm-body-lg">This is the message to engineering from that same decision. Specific names, specific scope, one clear ask.</p>
        </div>
        <Reveal className="lm-card" delayMs={100}>
          <div className="lm-mono lm-caption" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 16 }}>
            <span>#eng-v2 / slack</span>
            <span>example</span>
          </div>
          <div className="lm-msg">
            <p>Decision on v2: it ships on the current date to existing customers. SSO comes out of v2 scope and gets its own release.</p>
            <p>Monday&apos;s sprint planning covers v2 hardening and the onboarding fix only. Nothing else changes in v2.</p>
            <p>Marco, can you size SSO as a standalone track by Wednesday? I need a date I trust before I give one to sales.</p>
          </div>
        </Reveal>
      </section>

      <div className="lm-wrap">
        <Reveal className="lm-ctaband">
          <h2 className="lm-h2">Stop drafting the same thing seven ways.</h2>
          <p style={{ margin: 0, fontSize: 19, opacity: 0.92 }}>Bring the call you&apos;re sitting on. Leave with the words.</p>
          <a className="lm-btn-dark" href="/app">Start a decision</a>
        </Reveal>
      </div>

      <footer className="lm-footer">
        <div className="lm-wrap lm-footer-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Wordmark />
            <div style={{ fontSize: 15, color: "#C9C3B8" }}>AI gives you speed. Lumo gives you clarity.</div>
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
