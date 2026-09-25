"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Check, X } from "lucide-react"
import { useInView } from "@/hooks/useInView"

const PROBLEMS = [
  {
    num: "01",
    title: "Judgment under speed pressure.",
    body: "Four prototypes by lunch. You have thirty minutes to decide which one matters. AI doesn't help with the deciding.",
  },
  {
    num: "02",
    title: "The alignment tax got bigger.",
    body: "Everyone has AI. Everyone's pitching their own ideas. You're the one who has to converge people without breaking them.",
  },
  {
    num: "03",
    title: "The artifact factory.",
    body: "One call means seven different messages for your team, your VP, sales, support, the doc. Generic AI drafts won't land. You need ones that know your context.",
  },
]

const DILEMMAS = [
  "Ship v2 now or wait for enterprise SSO.",
  "Cut the roadmap or cut the timeline.",
  "Tell the VP the launch slips, or push the team past burnout.",
  "Keep the legacy flag or force the migration.",
  "Give sales the demo date or protect the sprint.",
  "Escalate the outage or let support hold the line.",
]

const AUDIENCES = [
  { name: "Executives", detail: "Call, cost, risk, confidence." },
  { name: "Engineering", detail: "Scope, owners, next steps." },
  { name: "Sales", detail: "What to tell the customer." },
  { name: "Support", detail: "What changed, what to say." },
]

const STEPS = [
  { num: "01", name: "What's happening", desc: "Paste the situation. Slack threads, tickets, notes, anything relevant." },
  { num: "02", name: "Here's what I'm reading", desc: "Lumo reads it back structured. Tweak anything that's off." },
  { num: "03", name: "Your options", desc: "Paths you see and at least one you didn't write down." },
  { num: "04", name: "Side by side", desc: "Each path costs something. See what each one costs." },
  { num: "05", name: "Your choice", desc: "Commit to a path. Say why. Rate your confidence." },
  { num: "06", name: "Tell people", desc: "Tailored drafts for every audience. Copy and send." },
]

const COMPARE_LEFT = [
  "Blank canvas problem. You stare at an empty chat.",
  "No audience-tailored output. One draft for everyone.",
  "No decision history. Every conversation disappears.",
  "You have to know what to ask.",
]

const COMPARE_RIGHT = [
  "Structured flow. You answer questions, not prompts.",
  "Audience-tailored drafts. Different words for different people.",
  "Every decision preserved. Searchable, reviewable.",
  "Knows what to ask. Built for the shape of a PM decision.",
]

function FadeUpGroup({ children, className }: { children: React.ReactNode[]; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div key={i} className={inView ? "anim-fade-up" : undefined} style={inView ? { animationDelay: `${i * 120}ms` } : { opacity: 0 }}>
          {child}
        </div>
      ))}
    </div>
  )
}

function HeroExamplePanel() {
  const [layer, setLayer] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setLayer((prev) => (prev + 1) % 3), 12000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        position: "relative",
        marginTop: 64,
        height: 520,
        borderRadius: 16,
        border: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-surface)",
        padding: "2rem",
        boxShadow: "0 24px 48px rgba(31, 27, 23, 0.08)",
        overflow: "hidden",
      }}
      className="hero-panel"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#E5DECF" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#E5DECF" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#E5DECF" }} />
        <span style={{ flex: 1 }} />
        <span className="text-mono" style={{ color: "var(--text-tertiary)", fontSize: 11 }}>example</span>
      </div>

      {/* Layer 0: raw Slack + ticket lines */}
      <div
        key={`layer-0-${layer === 0}`}
        className={layer === 0 ? "anim-fade-up" : undefined}
        style={{ position: "absolute", inset: "76px 32px 32px 32px", display: layer === 0 ? "block" : "none" }}
      >
        <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 16 }}>WHAT&apos;S HAPPENING</p>
        <div className="text-mono" style={{ display: "flex", flexDirection: "column", gap: 10, color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
          <p>#launch-v2: dana — sso still not scoped, prospects asking</p>
          <p>ABC-412 · open · sso enterprise config · assignee: raj</p>
          <p>#eng-planning: raj — sprint starts monday, need a call by friday</p>
          <p>ticket ABC-419 · blocked on decision</p>
        </div>
      </div>

      {/* Layer 1: Step 2 fields + I noticed line */}
      <div
        key={`layer-1-${layer === 1}`}
        className={layer === 1 ? "anim-fade-up" : undefined}
        style={{ position: "absolute", inset: "76px 32px 32px 32px", display: layer === 1 ? "block" : "none" }}
      >
        <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 16 }}>{"HERE\u2019S WHAT I\u2019M READING"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { label: "THE REAL QUESTION", text: "Ship v2 this quarter or delay for the enterprise launch." },
            { label: "WHAT MATTERS HERE", text: "Revenue timing versus product quality." },
            { label: "WHO\u2019S AFFECTED", text: "Engineering, sales, marketing, three prospects." },
            { label: "HOW PRESSING", text: "Decision needed by Friday." },
          ].map((card) => (
            <div key={card.label} style={{ padding: 16, borderRadius: 12, border: "1px solid var(--border-default)", backgroundColor: "var(--bg-canvas)" }}>
              <span className="text-eyebrow" style={{ color: "var(--accent-primary)", fontSize: 10 }}>{card.label}</span>
              <p style={{ marginTop: 6, fontWeight: 600, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.4 }}>{card.text}</p>
            </div>
          ))}
        </div>
        <p className="signature-italic" style={{ marginTop: 20, fontSize: 14 }}>
          {"I noticed the sales team already told two prospects a date. That constraint isn\u2019t written down anywhere else."}
        </p>
      </div>

      {/* Layer 2: audience tabs + drafted email */}
      <div
        key={`layer-2-${layer === 2}`}
        className={layer === 2 ? "anim-fade-up" : undefined}
        style={{ position: "absolute", inset: "76px 32px 32px 32px", display: layer === 2 ? "block" : "none" }}
      >
        <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 16 }}>TELL PEOPLE</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["Your VP", "Engineering", "Sales", "Support"].map((name, i) => (
            <span
              key={name}
              style={{
                fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 9999,
                border: i === 0 ? "1px solid var(--accent-primary)" : "1px solid var(--border-default)",
                color: i === 0 ? "var(--accent-primary)" : "var(--text-secondary)",
                backgroundColor: i === 0 ? "var(--accent-primary-soft)" : "transparent",
              }}
            >
              {name}
            </span>
          ))}
        </div>
        <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--border-default)", backgroundColor: "var(--bg-canvas)" }}>
          <p className="text-mono" style={{ color: "var(--text-tertiary)", fontSize: 11, marginBottom: 8 }}>Decision: ship v2 on schedule</p>
          <p className="text-body" style={{ fontSize: 14, lineHeight: 1.6 }}>
            The call is to ship v2 on time and give enterprise SSO its own release date. This keeps the fix moving for 40 waiting customers. Confidence is 4 of 5.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function MarketingPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* === NAV === */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 72,
          borderBottom: "1px solid var(--border-default)",
          backgroundColor: "rgba(250, 247, 240, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 80px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="nav-inner">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>lumo</span>
              <span className="anim-pulse" style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "var(--accent-primary)", display: "inline-block", marginBottom: 10 }} />
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-on-accent)",
              padding: "3px 8px",
              borderRadius: 4,
            }}>demo</span>
          </Link>

          <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Product", "How it works", "Why Lumo"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="nav-link">{item}</a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/app" className="btn-primary" style={{ padding: "0.625rem 1.25rem", fontSize: 14 }}>Try Lumo</Link>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="section-pad" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ maxWidth: 840 }}>
          <div className="pill pill-persimmon" style={{ marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent-primary)" }} />
            {"Built for product managers in the AI era"}
          </div>

          <h1 className="text-display" style={{ marginBottom: 24 }}>
            The decisions are yours.<br />The words for them are here.
          </h1>

          <p className="text-body-lg" style={{ maxWidth: 640, marginBottom: 40, lineHeight: 1.6 }}>
            {"AI didn\u2019t replace your judgment. It just made you the only one with time to use it. Lumo helps you think through hard calls and walk out with the messages you need to ship them across your org."}
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/app" className="btn-primary" style={{ fontSize: "1.0625rem", padding: "1rem 2rem" }}>
              Try Lumo free
              <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
            <a href="#how-it-works" className="btn-secondary" style={{ fontSize: "1.0625rem", padding: "1rem 2rem" }}>
              See how it works
            </a>
          </div>
        </div>

        <HeroExamplePanel />
      </section>

      {/* === DILEMMA MARQUEE STRIP === */}
      <section style={{ borderTop: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-muted)", padding: "24px 0", overflow: "hidden" }}>
        <div className="marquee-track anim-marquee">
          {[...DILEMMAS, ...DILEMMAS].map((line, i) => (
            <span key={i} className="text-mono" style={{ whiteSpace: "nowrap", padding: "0 32px", color: "var(--text-tertiary)", fontSize: 13 }}>
              {line}
            </span>
          ))}
        </div>
      </section>

      {/* === PROBLEM === */}
      <section id="product" className="section-pad" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 16 }}>THE PROBLEM</p>
        <h2 className="text-section-hero" style={{ marginBottom: 16 }}>{"The job changed. Your tools didn\u2019t."}</h2>
        <p className="text-body-lg" style={{ maxWidth: 640, marginBottom: 64 }}>
          {"AI took the grunt work. What\u2019s left is the work that actually requires you, and nobody\u2019s built a tool for that yet."}
        </p>

        <FadeUpGroup className="grid-problems">
          {PROBLEMS.map((p) => (
            <div key={p.num}>
              <span className="text-mono" style={{ color: "var(--accent-primary)", fontSize: 20, fontWeight: 700 }}>{p.num}</span>
              <h3 style={{ fontWeight: 600, fontSize: 20, letterSpacing: "-0.01em", color: "var(--text-primary)", margin: "12px 0 8px" }}>{p.title}</h3>
              <p className="text-body" style={{ lineHeight: 1.65 }}>{p.body}</p>
            </div>
          ))}
        </FadeUpGroup>
      </section>

      {/* === AUDIENCE FAN-OUT === */}
      <section className="section-pad" style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 0 }}>
        <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 16 }}>ONE DECISION, MANY AUDIENCES</p>
        <h2 className="text-section-hero" style={{ marginBottom: 64, maxWidth: 640 }}>{"Every audience gets its own draft, from the same call."}</h2>

        <FadeUpGroup className="grid-audiences">
          {AUDIENCES.map((a) => (
            <div key={a.name} className="lumo-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, fontSize: 17, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>{a.name}</h3>
              <p className="text-body" style={{ fontSize: 14 }}>{a.detail}</p>
            </div>
          ))}
        </FadeUpGroup>
      </section>

      {/* === HOW IT WORKS === */}
      <section id="how-it-works" style={{ backgroundColor: "var(--bg-muted)" }} className="section-pad">
        <div style={{ maxWidth: 1280, margin: "0 auto" }} className="section-inner">
          <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 16 }}>THE PRODUCT</p>
          <h2 className="text-section-hero" style={{ marginBottom: 16 }}>Six steps. About fifteen minutes.</h2>
          <p className="text-body-lg" style={{ maxWidth: 640, marginBottom: 64 }}>
            The decision is yours. The clarity is shared.
          </p>

          <FadeUpGroup className="grid-steps">
            {STEPS.map((s) => (
              <div key={s.num} className="lumo-card" style={{ padding: 28 }}>
                <span className="text-eyebrow" style={{ color: "var(--accent-primary)" }}>STEP {s.num}</span>
                <h3 style={{ fontWeight: 600, fontSize: 20, color: "var(--text-primary)", margin: "12px 0 8px", letterSpacing: "-0.01em" }}>{s.name}</h3>
                <p className="text-body">{s.desc}</p>
              </div>
            ))}
          </FadeUpGroup>
        </div>
      </section>

      {/* === WHY LUMO === */}
      <section id="why-lumo" className="section-pad" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 16 }}>WHY LUMO</p>
        <h2 className="text-section-hero" style={{ marginBottom: 16 }}>Why not just ChatGPT or Claude?</h2>
        <p className="text-body-lg" style={{ maxWidth: 640, marginBottom: 64 }}>
          {"You can paste anything into ChatGPT. But conversation isn\u2019t a tool. It\u2019s just a thread. Lumo is built specifically for the shape of a PM\u2019s decision."}
        </p>

        <FadeUpGroup className="grid-compare">
          <div style={{ padding: 32, borderRadius: "var(--radius)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)" }}>
            <p style={{ fontWeight: 600, fontSize: 18, color: "var(--text-primary)", marginBottom: 24, letterSpacing: "-0.01em" }}>ChatGPT / Claude</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {COMPARE_LEFT.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <X style={{ width: 18, height: 18, color: "var(--risk)", marginTop: 2, flexShrink: 0 }} />
                  <span className="text-body">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 32, borderRadius: "var(--radius)", border: "2px solid var(--accent-primary)", backgroundColor: "var(--bg-surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
              <span style={{ fontWeight: 600, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Lumo</span>
              <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--accent-primary)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {COMPARE_RIGHT.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Check style={{ width: 18, height: 18, color: "var(--positive)", marginTop: 2, flexShrink: 0 }} />
                  <span className="text-body">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUpGroup>
      </section>

      {/* === CLOSING CTA === */}
      <section style={{ backgroundColor: "var(--bg-dark)", textAlign: "center" }} className="section-pad">
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px" }}>
          <h2 className="text-section-hero" style={{ color: "var(--text-on-dark)", marginBottom: 16 }}>
            Stop drafting the same thing seven ways.
          </h2>
          <p style={{ fontSize: 18, color: "rgba(250, 247, 240, 0.65)", marginBottom: 40, lineHeight: 1.55 }}>
            Lumo is a working demo. Walk through a real decision and see what it produces.
          </p>
          <Link href="/app" className="btn-primary" style={{ fontSize: "1.125rem", padding: "1rem 2.5rem" }}>
            Try it now
            <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
          <div style={{ marginTop: 24 }}>
            <a href="#how-it-works" style={{ fontSize: 14, color: "rgba(250, 247, 240, 0.5)" }}>{"or read more about the product \u2192"}</a>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer style={{ backgroundColor: "var(--bg-dark)", borderTop: "1px solid rgba(250, 247, 240, 0.08)", padding: "48px 20px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: "var(--text-on-dark)", letterSpacing: "-0.02em" }}>lumo</span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--accent-primary)", marginBottom: 8 }} />
          </div>

          <p style={{ fontSize: 14, color: "rgba(250, 247, 240, 0.5)", textAlign: "center" }}>
            AI gives you speed. lumo gives you clarity.
          </p>

          <a
            href="https://linkedin.com/in/terrancerange"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 14, color: "rgba(250, 247, 240, 0.5)" }}
          >
            built by Terrance Range
          </a>
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 24, marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(250, 247, 240, 0.25)" }}>{"\u00A9 2026 Terrance Range"}</p>
        </div>
      </footer>
    </div>
  )
}
