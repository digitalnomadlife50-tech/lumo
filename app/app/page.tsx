"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Pencil, Copy, Check, ChevronRight } from "lucide-react"

/* ─── TYPES ─── */
type View = "home" | "step1" | "step2" | "step3" | "step4" | "step5" | "step6" | "done"

const STEP_NAMES = [
  { key: "step1" as View, label: "What's happening" },
  { key: "step2" as View, label: "AI reading" },
  { key: "step3" as View, label: "Your options" },
  { key: "step4" as View, label: "Side by side" },
  { key: "step5" as View, label: "Your choice" },
  { key: "step6" as View, label: "Tell people" },
]

const URGENCY_OPTIONS = ["Next hour", "Today", "This week", "Next 2 weeks", "Longer"]

/* ─── MOCK DATA ─── */
const PAST_DECISIONS = [
  {
    id: 47,
    question: "Push launch date to Oct 29",
    choice: "Keeping full scope but delaying market entry by three weeks",
    closure: "What I was giving up: the version where marketing got their original date.",
    status: "Worked out" as const,
    date: "2 weeks ago",
    step: 6,
  },
  {
    id: 46,
    question: "Hire one senior engineer instead of two juniors",
    choice: "Speed vs. fresh perspective and team diversity",
    closure: "",
    status: "Pending" as const,
    date: "1 week ago",
    step: 4,
  },
  {
    id: 45,
    question: "End partnership with Acme Corp",
    choice: "Short-term revenue loss vs. technical freedom",
    closure: "The cost was real, but so was the ceiling they put on our roadmap.",
    status: "Mixed" as const,
    date: "3 days ago",
    step: 6,
  },
]

const AI_CARDS = [
  { label: "THE REAL QUESTION", text: "Whether to commit engineering resources to the platform migration now or after the Q4 launch.", note: "I noticed you mentioned \u201Cwe can\u2019t keep patching\u201D twice in your notes." },
  { label: "WHAT MATTERS HERE", text: "Technical debt is compounding. But the Q4 launch is the biggest revenue moment of the year.", note: "I noticed the sales team is already pre-selling features that depend on the old architecture." },
  { label: "WHO\u2019S AFFECTED", text: "Platform team (capacity), Product Marketing (launch messaging), Sales (pipeline promises), CTO (technical vision).", note: "I noticed Marcus was specifically called out in the Slack thread." },
  { label: "HOW PRESSING", text: "Engineering needs direction by next Monday. Sprint planning is blocked without this.", note: "I noticed the word \u201Curgent\u201D appeared three times in the ticket." },
]

const OPTIONS = [
  { name: "Migrate now, delay Q4 launch by 6 weeks", desc: "Full platform migration before any new feature work. Clean foundation, but the market window narrows.", keyMove: "Negotiate a revised launch date with marketing and brief the three enterprise prospects on the delay." },
  { name: "Ship Q4 on the old stack, migrate in Q1", desc: "Hit the revenue moment, accept more technical debt. Migration becomes a Q1 priority.", keyMove: "Get the CTO to publicly commit to Q1 migration so it doesn\u2019t slip to Q2." },
  { name: "Parallel track: skeleton migration + Q4 feature sprint", desc: "Split engineering 60/40. Ship a thinner Q4 release while starting migration foundations.", keyMove: "Hire one senior contractor for 8 weeks to absorb the migration architecture work." },
]

const AUDIENCES = [
  { key: "team", label: "Your team" },
  { key: "manager", label: "Your manager" },
  { key: "person", label: "A specific person" },
  { key: "xfn", label: "Cross-functional partners" },
  { key: "external", label: "Customers / external" },
  { key: "doc", label: "A status doc" },
]

const DRAFT_MESSAGES: Record<string, string> = {
  team: "Team, we\u2019re going with the parallel track. Engineering splits 60/40 between Q4 features and migration foundations. I know this is tighter than any of us wanted, but it\u2019s the path that doesn\u2019t force us to choose between shipping and our technical future. Sprint planning Monday will reflect the new allocation. Come with questions.",
  manager: "Marcus, wanted to give you a heads up before Monday. We\u2019re going parallel: 60% on Q4 deliverables, 40% on migration scaffolding. We\u2019ll hit the launch window, though with a thinner feature set than originally scoped. The tradeoff is we start Q1 with migration 40% done instead of 0%. I\u2019ll have the revised scope doc to you by Thursday.",
  xfn: "Quick update on the platform decision. We\u2019re pursuing a parallel approach: Q4 launch stays on track with a focused feature set, while we begin migration foundations in parallel. For Sales: the core features enterprise prospects need will ship on schedule. For Marketing: launch date holds, but we\u2019ll need to adjust the feature narrative. I\u2019ll schedule a 30-min alignment call this week.",
  external: "We\u2019re on track for our Q4 release. The team has been focused on ensuring the features most critical to your workflow are prioritized. You\u2019ll see the updated roadmap in our next sync.",
  doc: "Decision: Parallel track (60/40 split)\nDate: Today\nOwner: You\nContext: Platform migration vs. Q4 launch timing\nChoice: Split engineering resources 60% Q4 features, 40% migration foundations\nNext actions: Revised sprint plan Monday, scope doc Thursday, contractor search this week\nReview date: End of Q1",
  person: "Hey, wanted to loop you in on the platform decision before it\u2019s announced Monday. We\u2019re splitting the team 60/40 between Q4 and migration. I know this affects your project directly. Let\u2019s find 20 minutes this week to walk through what changes for your workstream.",
}

/* ─── MAIN COMPONENT ─── */
export default function ProductApp() {
  const [view, setView] = useState<View>("home")
  const [situation, setSituation] = useState("")
  const [urgency, setUrgency] = useState("")
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [reasoning, setReasoning] = useState("")
  const [confidence, setConfidence] = useState(7)
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [closureLine, setClosureLine] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [decisionNum] = useState(48)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const navigate = useCallback((v: View) => {
    setView(v)
    window.scrollTo({ top: 0 })
  }, [])

  const handleCopy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }, [])

  const toggleAudience = useCallback((key: string) => {
    setSelectedAudiences(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [situation])

  const currentStepIndex = STEP_NAMES.findIndex(s => s.key === view)

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-canvas)" }}>
      {/* === HEADER === */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, borderBottom: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-canvas)",
        padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => navigate("home")} style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>lumo</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent-primary)", marginBottom: 8 }} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--positive)" }} />
            <span className="text-mono" style={{ color: "var(--text-tertiary)", fontSize: 12 }}>ai connected</span>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>JD</span>
          </div>
        </div>
      </header>

      {/* === CONTENT === */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "96px 32px 160px", minHeight: "100vh" }}>
        <div className="step-enter" key={view}>

          {/* ─── HOME ─── */}
          {view === "home" && (
            <>
              <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 16 }}>GOOD MORNING, JORDAN</p>
              <h1 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.08, color: "var(--text-primary)", marginBottom: 12 }}>
                {"What\u2019s the call?"}
              </h1>
              <p className="text-body-lg" style={{ marginBottom: 40 }}>Think it through. Get the words right. Move on.</p>

              <button className="btn-primary" onClick={() => navigate("step1")} style={{ fontSize: "1.0625rem", padding: "1rem 2rem", marginBottom: 96 }}>
                {"Start a decision \u2192"}
              </button>

              {/* In Motion */}
              {PAST_DECISIONS.filter(d => d.status === "Pending").length > 0 && (
                <div style={{ marginBottom: 64 }}>
                  <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 16 }}>IN MOTION</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {PAST_DECISIONS.filter(d => d.status === "Pending").map(d => (
                      <button
                        key={d.id}
                        className="lumo-card"
                        onClick={() => navigate(`step${d.step}` as View)}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px",
                          cursor: "pointer", border: "1px solid var(--border-default)", textAlign: "left", width: "100%",
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{d.question}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                            <span className="text-mono" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Step {d.step} of 6</span>
                            <div style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: "var(--bg-muted)", overflow: "hidden" }}>
                              <div style={{ width: `${(d.step / 6) * 100}%`, height: "100%", backgroundColor: "var(--accent-primary)", borderRadius: 2 }} />
                            </div>
                          </div>
                        </div>
                        <ChevronRight style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Decisions */}
              <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 16 }}>RECENT DECISIONS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PAST_DECISIONS.map(d => (
                  <button
                    key={d.id}
                    className="lumo-card"
                    onClick={() => navigate(d.step === 6 ? "done" : `step${d.step}` as View)}
                    style={{
                      padding: "24px", cursor: "pointer", border: "1px solid var(--border-default)",
                      textAlign: "left", width: "100%",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>{d.question}</p>
                        <p className="text-body" style={{ fontSize: 14, marginBottom: 0 }}>{d.choice}</p>
                        {d.closure && (
                          <p className="signature-italic" style={{ marginTop: 14 }}>{d.closure}</p>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                          <span className="text-mono" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{d.date}</span>
                          <span className={`pill ${d.status === "Worked out" ? "pill-positive" : d.status === "Pending" ? "pill-caution" : "pill-risk"}`} style={{ fontSize: 12, padding: "2px 10px" }}>
                            {d.status}
                          </span>
                        </div>
                      </div>
                      <span className="text-mono" style={{ color: "var(--text-tertiary)", fontSize: 14, flexShrink: 0, marginLeft: 16 }}>{"\u2116"}{d.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ─── STEP 1: What's happening ─── */}
          {view === "step1" && (
            <>
              <div style={{ marginBottom: 64 }}>
                <PathIndicator current={0} />
              </div>
              <h1 className="text-heading-lg" style={{ marginBottom: 16 }}>{"What\u2019s happening?"}</h1>
              <p className="text-body-lg" style={{ marginBottom: 40 }}>Tell me the situation. Paste anything relevant.</p>

              <textarea
                ref={textareaRef}
                className="lumo-textarea"
                style={{ minHeight: 200, maxHeight: 240 }}
                placeholder="What's the situation? Paste context here..."
                value={situation}
                onChange={e => setSituation(e.target.value)}
              />
              <button
                className="btn-text"
                style={{
                  marginTop: 12,
                  color: "var(--accent-primary)",
                  opacity: 0.8,
                  fontWeight: 400,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  transition: "opacity 150ms ease-out, text-decoration 150ms ease-out",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.textDecoration = "underline" }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.textDecoration = "none" }}
              >
                + Add context (Slack thread, ticket, doc snippet, anything)
              </button>

              <div style={{ marginTop: 48 }}>
                <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 16 }}>WHEN DOES THIS NEED TO BE DECIDED?</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {URGENCY_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setUrgency(opt)}
                      style={{
                        cursor: "pointer",
                        border: urgency === opt ? "none" : "1px solid var(--border-default)",
                        borderRadius: 9999,
                        backgroundColor: urgency === opt ? "var(--accent-primary)" : "transparent",
                        color: urgency === opt ? "var(--text-on-dark)" : "var(--text-primary)",
                        fontWeight: 500,
                        fontSize: 14,
                        fontFamily: "inherit",
                        padding: "8px 16px",
                        transition: "all 150ms ease-out",
                        lineHeight: 1.4,
                      }}
                      onMouseEnter={e => {
                        if (urgency !== opt) {
                          e.currentTarget.style.backgroundColor = "var(--bg-muted)"
                          e.currentTarget.style.borderColor = "var(--text-tertiary)"
                        }
                      }}
                      onMouseLeave={e => {
                        if (urgency !== opt) {
                          e.currentTarget.style.backgroundColor = "transparent"
                          e.currentTarget.style.borderColor = "var(--border-default)"
                        }
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 2: AI Reading ─── */}
          {view === "step2" && (
            <>
              <PathIndicator current={1} />
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>{"Here\u2019s what I\u2019m reading."}</h1>
              <p className="text-body-lg" style={{ marginBottom: 32 }}>I read it back this way. Tweak anything that{"'"}s off.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {AI_CARDS.map(card => (
                  <div
                    key={card.label}
                    className="lumo-card group"
                    style={{ padding: 24, position: "relative" }}
                    onMouseEnter={e => {
                      const pencil = e.currentTarget.querySelector("[data-pencil]") as HTMLElement
                      if (pencil) pencil.style.opacity = "1"
                    }}
                    onMouseLeave={e => {
                      const pencil = e.currentTarget.querySelector("[data-pencil]") as HTMLElement
                      if (pencil) pencil.style.opacity = "0.3"
                    }}
                  >
                    <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 10 }}>{card.label}</p>
                    <p style={{ fontWeight: 600, fontSize: 18, color: "var(--text-primary)", lineHeight: 1.35, letterSpacing: "-0.01em", marginBottom: 8 }}>{card.text}</p>
                    <p className="signature-italic" style={{ marginTop: 0 }}>{card.note}</p>
                    <button
                      data-pencil
                      style={{
                        position: "absolute", top: 20, right: 20,
                        background: "none", border: "none", cursor: "pointer",
                        opacity: 0.3, padding: 4,
                        transition: "opacity 150ms ease-out",
                      }}
                      aria-label="Edit"
                    >
                      <Pencil style={{ width: 14, height: 14, color: "var(--text-tertiary)" }} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
                <button
                  className="btn-text"
                  style={{
                    color: "var(--accent-primary)",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline" }}
                  onMouseLeave={e => { e.currentTarget.style.textDecoration = "none" }}
                >
                  See what I originally said
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 3: Your options ─── */}
          {view === "step3" && (
            <>
              <PathIndicator current={2} />
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>Your options.</h1>
              <p className="text-body-lg" style={{ marginBottom: 32 }}>{"Here are the paths I see. There\u2019s at least one you didn\u2019t write down."}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {OPTIONS.map((opt, i) => (
                  <div key={i} className="lumo-card" style={{ padding: 24 }}>
                    <span className="text-mono" style={{ color: "var(--accent-primary)", fontSize: 16, fontWeight: 700 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 style={{ fontWeight: 600, fontSize: 18, color: "var(--text-primary)", margin: "10px 0 6px", letterSpacing: "-0.01em" }}>{opt.name}</h3>
                    <p className="text-body" style={{ marginBottom: 12 }}>{opt.desc}</p>
                    <div style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "var(--accent-primary-soft)" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-primary)" }}>The key move: </span>
                      <span style={{ fontSize: 13, color: "var(--accent-primary)" }}>{opt.keyMove}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── STEP 4: Side by side ─── */}
          {view === "step4" && (
            <>
              <PathIndicator current={3} />
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>Side by side.</h1>
              <p className="text-body-lg" style={{ marginBottom: 32 }}>{"Each path costs something. Here\u2019s what each one costs."}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {OPTIONS.map((opt, i) => {
                  const pros = [
                    ["Clean technical foundation for 2025", "No more patching legacy systems", "Engineering morale improves"],
                    ["Hit Q4 revenue targets", "No disruption to sales pipeline", "Marketing keeps their launch date"],
                    ["Partial migration progress by Q1", "Revenue window preserved (thinner)", "Contractor absorbs architecture work"],
                  ][i]
                  const cons = [
                    ["Miss Q4 revenue window", "Three enterprise prospects may churn", "Marketing team loses launch momentum"],
                    ["Technical debt compounds through Q1", "Platform migration slips to Q2 or later", "Senior engineers may leave"],
                    ["Neither track gets full resources", "Contractor onboarding takes 2 weeks", "Thinner Q4 feature set"],
                  ][i]
                  const affected = [
                    ["Marcus (VP Eng) \u2014 must defend the delay", "Sales team \u2014 pipeline at risk", "Marketing \u2014 lose launch date"],
                    ["Platform team \u2014 morale risk", "CTO \u2014 technical vision delayed", "Future hires \u2014 legacy stack repels talent"],
                    ["Contractor \u2014 needs fast onboarding", "Product Marketing \u2014 thinner story", "Engineering \u2014 context switching cost"],
                  ][i]

                  return (
                    <div key={i} className="lumo-card" style={{ padding: 24 }}>
                      <h3 style={{ fontWeight: 600, fontSize: 17, color: "var(--text-primary)", marginBottom: 20, letterSpacing: "-0.01em" }}>{opt.name}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                        <div>
                          <p className="text-eyebrow" style={{ color: "var(--positive)", marginBottom: 10 }}>WHAT GETS BETTER</p>
                          {pros.map((p, j) => <p key={j} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 6 }}>{p}</p>)}
                        </div>
                        <div>
                          <p className="text-eyebrow" style={{ color: "var(--risk)", marginBottom: 10 }}>WHAT GETS WORSE</p>
                          {cons.map((c, j) => <p key={j} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 6 }}>{c}</p>)}
                        </div>
                        <div>
                          <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 10 }}>{"WHO\u2019S AFFECTED"}</p>
                          {affected.map((a, j) => <p key={j} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 6 }}>{a}</p>)}
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedOption(i); navigate("step5") }}
                        className="btn-primary"
                        style={{ marginTop: 20, fontSize: 14, padding: "10px 20px" }}
                      >
                        {"I\u2019m going with this one"}
                      </button>
                    </div>
                  )
                })}
              </div>
              <button className="btn-text" style={{ marginTop: 16, color: "var(--text-tertiary)" }}>{"Wait, this isn\u2019t the right question"}</button>
            </>
          )}

          {/* ─── STEP 5: Your choice ─── */}
          {view === "step5" && (
            <>
              <PathIndicator current={4} />
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>Your choice.</h1>
              {selectedOption !== null && (
                <p className="text-body-lg" style={{ marginBottom: 32 }}>
                  You chose: <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{OPTIONS[selectedOption].name}</span>
                </p>
              )}

              <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 12 }}>WHY THIS ONE</p>
              <textarea
                className="lumo-textarea"
                style={{ minHeight: 120 }}
                placeholder="Why does this feel right? What tipped it?"
                value={reasoning}
                onChange={e => setReasoning(e.target.value)}
              />

              <div style={{ marginTop: 40 }}>
                <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 16 }}>HOW CONFIDENT?</p>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={confidence}
                    onChange={e => setConfidence(Number(e.target.value))}
                    style={{
                      flex: 1, height: 2, appearance: "none", WebkitAppearance: "none",
                      background: "var(--border-default)", outline: "none", cursor: "pointer",
                      accentColor: "var(--accent-primary)",
                    }}
                  />
                  <span className="text-mono" style={{ fontSize: 28, color: "var(--accent-primary)", fontWeight: 400, minWidth: 80, textAlign: "right" }}>
                    {confidence} / 10
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 6: Tell people ─── */}
          {view === "step6" && (
            <>
              <PathIndicator current={5} />
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>Tell people.</h1>
              <p className="text-body-lg" style={{ marginBottom: 32 }}>Who needs to know? Select your audiences and get tailored drafts.</p>

              {/* Audience picker */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 40 }}>
                {AUDIENCES.map(a => (
                  <button
                    key={a.key}
                    onClick={() => toggleAudience(a.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 18px", borderRadius: "var(--radius)",
                      border: "1.5px solid",
                      borderColor: selectedAudiences.includes(a.key) ? "var(--accent-primary)" : "var(--border-default)",
                      backgroundColor: selectedAudiences.includes(a.key) ? "var(--accent-primary-soft)" : "var(--bg-surface)",
                      cursor: "pointer", transition: "all 150ms ease-out",
                      textAlign: "left", width: "100%",
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 4,
                      border: "2px solid",
                      borderColor: selectedAudiences.includes(a.key) ? "var(--accent-primary)" : "var(--border-default)",
                      backgroundColor: selectedAudiences.includes(a.key) ? "var(--accent-primary)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 150ms ease-out",
                    }}>
                      {selectedAudiences.includes(a.key) && <Check style={{ width: 12, height: 12, color: "white" }} />}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: 15, color: "var(--text-primary)" }}>{a.label}</span>
                  </button>
                ))}
              </div>

              {/* Draft messages */}
              {selectedAudiences.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {selectedAudiences.map(key => {
                    const audience = AUDIENCES.find(a => a.key === key)
                    const msg = DRAFT_MESSAGES[key] || ""
                    return (
                      <div key={key} className="lumo-card" style={{ padding: 24, position: "relative" }}>
                        <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 12 }}>
                          FOR {audience?.label.toUpperCase()}
                        </p>
                        <div style={{ padding: "16px 0 16px 20px", borderLeft: "2px solid var(--border-default)", fontSize: 15, lineHeight: 1.65, color: "var(--text-primary)" }}>
                          {msg}
                        </div>
                        <button
                          onClick={() => handleCopy(key, msg)}
                          style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", padding: 4 }}
                          aria-label="Copy message"
                        >
                          {copiedKey === key
                            ? <Check style={{ width: 16, height: 16, color: "var(--positive)" }} />
                            : <Copy style={{ width: 16, height: 16, color: "var(--text-tertiary)" }} />
                          }
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Closure line */}
              {selectedAudiences.length > 0 && (
                <div style={{ marginTop: 48 }}>
                  <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 8 }}>{"WHAT YOU\u2019RE GIVING UP"}</p>
                  <p className="text-caption" style={{ marginBottom: 12 }}>One sentence on what you are giving up by choosing this. One sentence, or skip.</p>
                  <input
                    type="text"
                    className="lumo-input"
                    placeholder="The version where..."
                    value={closureLine}
                    onChange={e => setClosureLine(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          {/* ─── DONE ─── */}
          {view === "done" && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <span className="text-mono" style={{ fontSize: 48, color: "var(--text-tertiary)", display: "block", marginBottom: 24 }}>{"\u2116"}{decisionNum}</span>
              <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 16 }}>Saved.</h1>
              <p className="signature-italic" style={{ maxWidth: 400, margin: "0 auto 48px", borderLeft: "none", paddingLeft: 0, textAlign: "center", fontSize: 19 }}>
                You thought it through. The words are yours now.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
                <button className="btn-text" onClick={() => navigate("home")} style={{ color: "var(--accent-primary)" }}>
                  {"Back to your decisions \u2192"}
                </button>
                <button className="btn-text" onClick={() => {
                  setSituation(""); setUrgency(""); setSelectedOption(null); setReasoning("")
                  setConfidence(7); setSelectedAudiences([]); setClosureLine("")
                  navigate("step1")
                }} style={{ color: "var(--text-tertiary)" }}>
                  Start another decision
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* === ACTION ZONE === */}
      {view !== "home" && view !== "done" && (
        <div className="action-zone">
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              className="btn-secondary"
              style={{ fontSize: 14, padding: "10px 20px" }}
              onClick={() => {
                const idx = currentStepIndex
                if (idx <= 0) navigate("home")
                else navigate(STEP_NAMES[idx - 1].key)
              }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              {currentStepIndex <= 0 ? "Take me back" : "Take me back"}
            </button>
            <button
              className="btn-primary"
              style={{ fontSize: 14, padding: "10px 24px" }}
              onClick={() => {
                const idx = currentStepIndex
                if (idx < STEP_NAMES.length - 1) navigate(STEP_NAMES[idx + 1].key)
                else navigate("done")
              }}
            >
              {view === "step1" && "Show me what you got"}
              {view === "step2" && "This looks right"}
              {view === "step3" && "Compare what each costs"}
              {view === "step4" && "Choose one above"}
              {view === "step5" && "Now help me tell people"}
              {view === "step6" && "Done, save it"}
              <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── PATH INDICATOR ─── */
function PathIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40, flexWrap: "wrap" }}>
      {STEP_NAMES.map((step, i) => (
        <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: i < current ? "var(--text-primary)" : i === current ? "var(--accent-primary)" : "var(--border-default)",
              transition: "background-color 150ms ease-out",
            }} />
            <span style={{
              fontSize: 13, fontWeight: i === current ? 600 : 400,
              color: i < current ? "var(--text-primary)" : i === current ? "var(--accent-primary)" : "var(--text-tertiary)",
              whiteSpace: "nowrap",
            }}>
              {step.label}
            </span>
          </div>
          {i < STEP_NAMES.length - 1 && (
            <span style={{ width: 16, height: 1, backgroundColor: "var(--border-default)", margin: "0 4px", flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  )
}
