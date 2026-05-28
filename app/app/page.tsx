"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowRight, ArrowLeft, Copy, Check, ChevronRight, X, ClipboardCopy } from "lucide-react"

/* ─── TYPES ─── */
type View = "home" | "step1" | "analyzing" | "step2" | "step3" | "step4" | "step5" | "loading" | "step6" | "done"

interface AIOutput {
  claritySummary: string
  messages: {
    engineering: string
    design: string
    leadership: string
  }
}

type ErrorCode = "RATE_LIMITED" | "ANTHROPIC_RATE_LIMITED" | "QUOTA_EXCEEDED" | "SERVER_ERROR" | "TIMEOUT" | "PARSE_ERROR" | "INVALID_RESPONSE" | null

interface AnalysisResult {
  realQuestion: string
  whatMatters: string
  whoIsAffected: string
  howPressing: string
  options: Array<{
    name: string
    description: string
    cost: string
  }>
  observations: string[]
}

interface SessionDecision {
  id: number
  question: string
  step: number
  status: "Pending" | "Done"
  decisionNum: number
}

/* ─── STATIC DATA ─── */
const STEP_NAMES = [
  { key: "step1" as View, label: "What's happening" },
  { key: "step2" as View, label: "AI reading" },
  { key: "step3" as View, label: "Your options" },
  { key: "step4" as View, label: "Side by side" },
  { key: "step5" as View, label: "Your choice" },
  { key: "step6" as View, label: "Tell people" },
]

const URGENCY_OPTIONS = ["Next hour", "Today", "This week", "Next 2 weeks", "Longer"]

/* ─── MOCK HARDCODED HISTORY (same for every visitor) ─── */
const MOCK_RECENT: SessionDecision[] = [
  { id: 1, question: "Choosing between Mixpanel and Amplitude for product analytics", step: 6, status: "Done", decisionNum: 42 },
  { id: 2, question: "Whether to deprecate the legacy notification system", step: 6, status: "Done", decisionNum: 38 },
  { id: 3, question: "Should we delay launch to fix the onboarding bug", step: 6, status: "Done", decisionNum: 35 },
]

const MOCK_USER = { name: "Sam K.", initials: "SK" }

/* ─── EXAMPLE OUTPUT (static, no API call) ─── */
const EXAMPLE_OUTPUT: AIOutput = {
  claritySummary: "The real decision isn\u2019t \u2018ship vs delay.\u2019 It\u2019s whether the half-feature creates more support burden than a delayed launch. Given the support team\u2019s current load and the deadline\u2019s softness, the two-week delay is the higher-leverage choice.",
  messages: {
    engineering: "Heads up, leaning toward pushing the launch two weeks instead of the cut-down version we discussed. The half-feature path would mean rebuilding the navigation logic twice and supporting two notification states. Two weeks of cleaner scope is worth more than hitting Tuesday with debt we\u2019d carry for a quarter. Want to walk through what slips and what doesn\u2019t?",
    design: "Want your read on something. The cut-down version we sketched would ship users into a state where the second action is hidden behind a settings drawer. I\u2019m worried that creates the exact discovery problem we just fixed in onboarding. Could we look at the cut-down flow together before we commit? Thinking we may push two weeks instead.",
    leadership: "Recommendation: push the launch two weeks for the full scope rather than ship the cut-down version Tuesday. The half-feature path creates support load that would cost us 2\u20133 quarter points across the next two cycles. Two weeks gets us a cleaner launch and avoids the debt. Need your sign-off to move the date and notify stakeholders. Can we sync on this Thursday?",
  },
}

/* ─── MAIN COMPONENT ─── */
export default function ProductApp() {
  const [view, setView] = useState<View>("home")
  const [situation, setSituation] = useState("")
  const [urgency, setUrgency] = useState("")
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [chosenDirection, setChosenDirection] = useState("")
  const [reasoning, setReasoning] = useState("")
  const [confidence, setConfidence] = useState(7)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [decisionNum] = useState(() => Math.floor(Math.random() * 900) + 100)
  const [aiOutput, setAiOutput] = useState<AIOutput | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiErrorCode, setAiErrorCode] = useState<ErrorCode>(null)
  const [loadingText, setLoadingText] = useState(0)
  const [loadingSlowWarning, setLoadingSlowWarning] = useState(false)
  const [activeTab, setActiveTab] = useState<"engineering" | "design" | "leadership">("engineering")
  const [isExampleMode, setIsExampleMode] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [analyzingText, setAnalyzingText] = useState(0)
  const [sectionsVisible, setSectionsVisible] = useState<number[]>([])
  // Session-level decisions (resets on page refresh, NOT persisted)
  const [sessionDecisions, setSessionDecisions] = useState<SessionDecision[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const navigate = useCallback((v: View) => {
    setView(v)
    window.scrollTo({ top: 0 })
  }, [])

  const handleCopy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement("textarea")
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    })
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }, [])

  // Copy entire decision (all three messages + clarity summary)
  const handleCopyAll = useCallback(() => {
    if (!aiOutput) return
    const formatted = [
      `DECISION CLARITY`,
      `───────────────`,
      aiOutput.claritySummary,
      ``,
      `FOR ENGINEERING`,
      `──────────────���`,
      aiOutput.messages.engineering,
      ``,
      `FOR DESIGN`,
      `───────────────`,
      aiOutput.messages.design,
      ``,
      `FOR LEADERSHIP`,
      `───────────────`,
      aiOutput.messages.leadership,
    ].join("\n")
    handleCopy("all", formatted)
  }, [aiOutput, handleCopy])

  const resetDecision = useCallback(() => {
    setSituation("")
    setUrgency("")
    setSelectedOption(null)
    setChosenDirection("")
    setReasoning("")
    setConfidence(7)
    setCopiedKey(null)
    setAiOutput(null)
    setAiError(null)
    setAiErrorCode(null)
    setLoadingSlowWarning(false)
    setIsExampleMode(false)
    setActiveTab("engineering")
    setAnalysis(null)
    setAnalyzingText(0)
  }, [])

  // Analyze the user's situation after step 1
  const handleAnalyze = async () => {
    if (!situation.trim() || !urgency) return

    setAnalyzingText(0)
    setAiError(null)
    setAiErrorCode(null)
    navigate("analyzing")

    // Rotate analyzing text
    const textInterval = setInterval(() => {
      setAnalyzingText(prev => (prev + 1) % 3)
    }, 2500)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, urgency }),
      })

      const data = await response.json()
      clearInterval(textInterval)

      if (!data.success) {
        setAiError(data.error)
        setAiErrorCode(data.errorCode ?? "SERVER_ERROR")
        navigate("step1")
        return
      }

      setAnalysis(data.analysis)
      navigate("step2")
    } catch (err) {
      clearInterval(textInterval)
      const msg = err instanceof Error ? err.message : "Analysis failed"
      setAiError(msg)
      navigate("step1")
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [situation])
  useEffect(() => {
    if (!showAbout) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowAbout(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showAbout])

  // Staggered fade-in for step 2 sections
  useEffect(() => {
    if (view === "step2" && analysis) {
      setSectionsVisible([])
      const timers = [0, 250, 500, 750, 1000].map((delay, index) => {
        return setTimeout(() => {
          setSectionsVisible(prev => [...prev, index])
        }, delay)
      })
      return () => timers.forEach(clearTimeout)
    }
  }, [view, analysis])

  const currentStepIndex = STEP_NAMES.findIndex(s => s.key === view)

  const LOADING_TEXTS = [
    "thinking through the tradeoffs...",
    "drafting your messages...",
    "almost there...",
  ]

  useEffect(() => {
    if (view !== "loading") return
    const interval = setInterval(() => setLoadingText(prev => (prev + 1) % 3), 2500)
    return () => clearInterval(interval)
  }, [view])

  useEffect(() => {
    if (view !== "loading") { setLoadingSlowWarning(false); return }
    const slowTimer = setTimeout(() => setLoadingSlowWarning(true), 12000)
    const cancelTimer = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort()
      setAiError("This is taking too long. Lumo will retry, or you can see an example while you wait.")
      setAiErrorCode("TIMEOUT")
      navigate("step5")
    }, 25000)
    return () => { clearTimeout(slowTimer); clearTimeout(cancelTimer) }
  }, [view, navigate])

  const showExample = useCallback(() => {
    setIsExampleMode(true)
    setAiOutput(EXAMPLE_OUTPUT)
    setActiveTab("engineering")
    navigate("step6")
  }, [navigate])

  const handleGenerate = async () => {
    // Validate nothing is empty
    if (!situation || !urgency || !chosenDirection || !reasoning || !confidence) {
      console.warn("MISSING FIELDS:", {
        situation: !!situation,
        urgency: !!urgency,
        chosenDirection: !!chosenDirection,
        reasoning: !!reasoning,
        confidence: !!confidence,
      })
    }

    setAiError(null)
    setAiErrorCode(null)
    setLoadingText(0)
    setLoadingSlowWarning(false)

    const controller = new AbortController()
    abortRef.current = controller
    navigate("loading")

    const requestBody = {
      situation,
      urgency,
      chosenDirection,
      reasoning,
      confidence,
    }

    try {
      const response = await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!data.success) {
        setAiErrorCode(data.errorCode ?? "SERVER_ERROR")
        throw new Error(data.error)
      }

      setAiOutput(data)
      setIsExampleMode(false)
      setSessionDecisions(prev => [{
        id: Date.now(),
        question: situation.slice(0, 80) || chosenDirection,
        step: 6,
        status: "Done",
        decisionNum,
      }, ...prev])
      navigate("step6")
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      const msg = err instanceof Error ? err.message : "Something went wrong on our end. Try again, or see an example of Lumo\u2019s output instead."
      setAiError(msg)
      navigate("step5")
    }
  }

  // All decisions shown on home = session decisions first, then hardcoded mock
  const allDecisions = [...sessionDecisions, ...MOCK_RECENT]
  const inMotion = allDecisions.filter(d => d.status === "Pending")
  const recentDone = allDecisions.filter(d => d.status === "Done").slice(0, 5)

  /* ─────────────────────────────────────────────────────────────── RENDER ─── */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-canvas)" }}>

      {/* === ABOUT MODAL === */}
      {showAbout && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            backgroundColor: "rgba(31,27,23,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px 16px",
          }}
          onClick={() => setShowAbout(false)}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius)",
              border: "1px solid var(--border-default)",
              padding: "40px", maxWidth: 540, width: "100%", position: "relative",
              boxShadow: "0 8px 40px rgba(31,27,23,0.12)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAbout(false)}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "none", border: "none", cursor: "pointer",
                padding: 8, color: "var(--text-tertiary)", borderRadius: "var(--radius)",
                minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center",
              }}
              aria-label="Close"
            >
              <X style={{ width: 18, height: 18 }} />
            </button>

            <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 16 }}>ABOUT LUMO</p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 20 }}>
              Lumo is a tool for IC product managers who need to think through complex decisions and communicate them clearly. AI gives you speed. Lumo gives you clarity.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 20 }}>
              This is a demo. The output is generated by Claude in real time based on your inputs. No data is saved between sessions.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 32 }}>
              Built by Terrance Range in a weekend with Claude, v0, and Vercel.
            </p>

            <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 24 }}>
              <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 12 }}>THE STACK</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["Frontend", "Next.js 16, React 19, Tailwind CSS v4"],
                  ["AI", "Claude 3.5 Sonnet via Anthropic API"],
                  ["Design", "Custom design system in CSS, v0 for scaffolding"],
                  ["Deploy", "Vercel"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", gap: 12, fontSize: 14 }}>
                    <span style={{ color: "var(--text-tertiary)", minWidth: 80 }}>{label}</span>
                    <span style={{ color: "var(--text-primary)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <a
                href="https://linkedin.com/in/terrancerange"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: 14, padding: "10px 20px", minHeight: 44 }}
              >
                Connect on LinkedIn
                <ArrowRight style={{ width: 14, height: 14 }} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* === HEADER === */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, borderBottom: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-canvas)",
        padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Left: wordmark */}
        <button
          onClick={() => { resetDecision(); navigate("home") }}
          style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>lumo</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent-primary)", marginBottom: 8 }} />
        </button>

        {/* Right: demo badge + user identity + about */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Demo badge */}
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
            color: "var(--accent-primary)", backgroundColor: "var(--accent-primary-soft)",
            padding: "4px 10px", borderRadius: 9999, textTransform: "uppercase",
          }}>
            Demo
          </span>

          {/* About link */}
          <button
            onClick={() => setShowAbout(true)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "4px 0",
              fontSize: 13, color: "var(--text-tertiary)", fontFamily: "inherit",
              fontWeight: 500, minHeight: 44, display: "flex", alignItems: "center",
            }}
          >
            What is this?
          </button>

          {/* User avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            backgroundColor: "var(--accent-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--bg-canvas)", letterSpacing: "0.04em" }}>
              {MOCK_USER.initials}
            </span>
          </div>
        </div>
      </header>

      {/* === CONTENT === */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "96px 24px 160px", minHeight: "100vh" }}>
        <div className="step-enter">

          {/* ─── HOME ─── */}
          {view === "home" && (
            <>
              {/* User greeting */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  backgroundColor: "var(--accent-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--bg-canvas)", letterSpacing: "0.04em" }}>
                    {MOCK_USER.initials}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{MOCK_USER.name}</p>
                  <p className="text-mono" style={{ color: "var(--text-tertiary)", fontSize: 12 }}>{allDecisions.length} decisions</p>
                </div>
              </div>

              <h1 style={{ fontSize: "clamp(2.25rem, 4vw, 3.25rem)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.08, color: "var(--text-primary)", marginBottom: 10 }}>
                {"What\u2019s the call?"}
              </h1>
              <p className="text-body-lg" style={{ marginBottom: 36 }}>Think it through. Get the words right. Move on.</p>

              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 64 }}>
                <button className="btn-primary" onClick={() => navigate("step1")} style={{ fontSize: "1rem", padding: "0.875rem 1.75rem" }}>
                  Start a decision
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
                <button
                  onClick={showExample}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    fontSize: 13, color: "var(--text-tertiary)", textDecoration: "underline",
                    fontFamily: "inherit", minHeight: 44, display: "flex", alignItems: "center",
                  }}
                >
                  see example output
                </button>
              </div>

              {/* In motion (only if there are pending session decisions) */}
              {inMotion.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 14 }}>IN MOTION</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {inMotion.map(d => (
                      <button
                        key={d.id}
                        className="lumo-card"
                        onClick={() => navigate(`step${d.step}` as View)}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "18px 20px", cursor: "pointer", border: "1px solid var(--border-default)",
                          textAlign: "left", width: "100%",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.question}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                            <span className="text-mono" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Step {d.step} of 6</span>
                            <div style={{ width: 40, height: 3, borderRadius: 2, backgroundColor: "var(--bg-muted)", overflow: "hidden" }}>
                              <div style={{ width: `${(d.step / 6) * 100}%`, height: "100%", backgroundColor: "var(--accent-primary)", borderRadius: 2 }} />
                            </div>
                          </div>
                        </div>
                        <ChevronRight style={{ width: 15, height: 15, color: "var(--text-tertiary)", flexShrink: 0, marginLeft: 12 }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent decisions */}
              <div>
                <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 14 }}>RECENT DECISIONS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recentDone.map(d => (
                    <div
                      key={d.id}
                      className="lumo-card"
                      style={{ padding: "18px 20px" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <p style={{ fontWeight: 500, fontSize: 15, color: "var(--text-primary)", lineHeight: 1.4 }}>{d.question}</p>
                        <span className="text-mono" style={{ color: "var(--text-tertiary)", fontSize: 13, flexShrink: 0, marginTop: 2 }}>
                          {"\u2116"}{d.decisionNum}
                        </span>
                      </div>
                      <p className="text-mono" style={{ fontSize: 12, color: "var(--positive)", marginTop: 6 }}>Done</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 1: What's happening ─── */}
          {view === "step1" && (
            <>
              <div style={{ marginBottom: 56 }}>
                <PathIndicator current={0} />
              </div>
              <h1 className="text-heading-lg" style={{ marginBottom: 14 }}>{"What\u2019s happening?"}</h1>
              <p className="text-body-lg" style={{ marginBottom: 36 }}>Tell me the situation. Paste anything relevant.</p>

              <textarea
                ref={textareaRef}
                className="lumo-textarea"
                style={{ minHeight: 200, maxHeight: 400 }}
                placeholder="What's the situation? Paste context here..."
                value={situation}
                onChange={e => setSituation(e.target.value)}
              />

              <div style={{ marginTop: 44 }}>
                <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 14 }}>WHEN DOES THIS NEED TO BE DECIDED?</p>
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
                        fontWeight: 500, fontSize: 14, fontFamily: "inherit",
                        padding: "10px 18px", minHeight: 44,
                        transition: "all 150ms ease-out",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error display for analyze API failures */}
              {aiError && aiErrorCode === "QUOTA_EXCEEDED" && (
                <div style={{ marginTop: 32, padding: 28, borderRadius: 16, backgroundColor: "var(--surface)", border: "1px solid var(--border-default)" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                    Lumo is busier than usual right now.
                  </h3>
                  <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 24 }}>
                    Try again in a few minutes, or see what Lumo produces when you bring it a real decision.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <button
                      onClick={() => { setAiError(null); setAiErrorCode(null); showExample() }}
                      className="btn-primary"
                      style={{ fontSize: 14, padding: "10px 20px", minHeight: 44 }}
                    >
                      See an example
                      <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      onClick={() => { setAiError(null); setAiErrorCode(null); handleAnalyze() }}
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: "10px 0",
                        fontSize: 14, color: "var(--text-secondary)", fontFamily: "inherit",
                        minHeight: 44,
                      }}
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {aiError && aiErrorCode !== "QUOTA_EXCEEDED" && (
                <div style={{ marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: "var(--risk-soft, rgba(255,90,90,0.1))", border: "1px solid var(--risk, #E74C3C)" }}>
                  <p style={{ color: "var(--risk, #E74C3C)", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Something went wrong</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{aiError}</p>
                </div>
              )}
            </>
          )}

          {/* ─── ANALYZING: Loading between step 1 and step 2 ─── */}
          {view === "analyzing" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center" }}>
              {/* Persimmon dots animation */}
              <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--accent-primary)",
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <style>{`
                @keyframes pulse {
                  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                  40% { opacity: 1; transform: scale(1); }
                }
              `}</style>
              <p className="text-body-lg" style={{ color: "var(--text-secondary)" }}>
                {["reading your situation...", "identifying the tradeoffs...", "mapping the options..."][analyzingText]}
              </p>
            </div>
          )}

          {/* ─── STEP 2: AI Reading ─── */}
          {view === "step2" && analysis && (
            <>
              <PathIndicator current={1} />
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>{"Here\u2019s what I\u2019m reading."}</h1>
              <p className="text-body-lg" style={{ marginBottom: 32 }}>Does this look right?</p>

              <style>{`
                .analysis-section {
                  opacity: 0;
                  transform: translateY(12px);
                  transition: opacity 0.4s ease, transform 0.4s ease;
                }
                .analysis-section.visible {
                  opacity: 1;
                  transform: translateY(0);
                }
              `}</style>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* THE REAL QUESTION */}
                <div className={`lumo-card analysis-section${sectionsVisible.includes(0) ? " visible" : ""}`} style={{ padding: 24 }}>
                  <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 10 }}>THE REAL QUESTION</p>
                  <p style={{ fontWeight: 600, fontSize: 17, color: "var(--text-primary)", lineHeight: 1.35, letterSpacing: "-0.01em" }}>{analysis.realQuestion}</p>
                </div>

                {/* WHAT MATTERS HERE */}
                <div className={`lumo-card analysis-section${sectionsVisible.includes(1) ? " visible" : ""}`} style={{ padding: 24 }}>
                  <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 10 }}>WHAT MATTERS HERE</p>
                  <p style={{ fontWeight: 600, fontSize: 17, color: "var(--text-primary)", lineHeight: 1.35, letterSpacing: "-0.01em" }}>{analysis.whatMatters}</p>
                </div>

                {/* WHO'S AFFECTED */}
                <div className={`lumo-card analysis-section${sectionsVisible.includes(2) ? " visible" : ""}`} style={{ padding: 24 }}>
                  <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 10 }}>{"WHO\u2019S AFFECTED"}</p>
                  <p style={{ fontWeight: 600, fontSize: 17, color: "var(--text-primary)", lineHeight: 1.35, letterSpacing: "-0.01em" }}>{analysis.whoIsAffected}</p>
                </div>

                {/* HOW PRESSING */}
                <div className={`lumo-card analysis-section${sectionsVisible.includes(3) ? " visible" : ""}`} style={{ padding: 24 }}>
                  <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 10 }}>HOW PRESSING</p>
                  <p style={{ fontWeight: 600, fontSize: 17, color: "var(--text-primary)", lineHeight: 1.35, letterSpacing: "-0.01em" }}>{analysis.howPressing}</p>
                </div>

                {/* OBSERVATIONS */}
                {analysis.observations && analysis.observations.length > 0 && (
                  <div className={`lumo-card analysis-section${sectionsVisible.includes(4) ? " visible" : ""}`} style={{ padding: 24, background: "var(--accent-primary-soft)" }}>
                    <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 10 }}>OBSERVATIONS</p>
                    {analysis.observations.map((obs, i) => (
                      <p key={i} className="signature-italic" style={{ marginBottom: i < analysis.observations.length - 1 ? 8 : 0 }}>{obs}</p>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ──��� STEP 3: Your options ─── */}
          {view === "step3" && analysis && (
            <>
              <PathIndicator current={2} />
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>Your options.</h1>
              <p className="text-body-lg" style={{ marginBottom: 32 }}>{"Here are the paths I see. There\u2019s at least one you didn\u2019t write down."}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {analysis.options.map((opt, i) => (
                  <div key={i} className="lumo-card" style={{ padding: "20px 20px 24px" }}>
                    <span className="text-mono" style={{ color: "var(--accent-primary)", fontSize: 13, fontWeight: 600 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 style={{ fontWeight: 600, fontSize: "clamp(18px, 4vw, 20px)", color: "var(--text-primary)", margin: "8px 0 8px", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{opt.name}</h3>
                    <p style={{ fontWeight: 400, fontSize: "clamp(15px, 3.5vw, 16px)", color: "#4A4D52", lineHeight: 1.55, marginBottom: 0 }}>{opt.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── STEP 4: Side by side ─── */}
          {view === "step4" && analysis && (
            <>
              <PathIndicator current={3} />
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>Side by side.</h1>
              <p className="text-body-lg" style={{ marginBottom: 32 }}>{"Each path costs something. Here\u2019s what each one costs."}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {analysis.options.map((opt, i) => (
                  <div key={i} className="lumo-card" style={{ padding: "20px 20px 24px" }}>
                    <h3 style={{ fontWeight: 600, fontSize: "clamp(18px, 4vw, 20px)", color: "var(--text-primary)", marginBottom: 10, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{opt.name}</h3>
                    <p style={{ fontWeight: 400, fontSize: "clamp(15px, 3.5vw, 16px)", color: "#4A4D52", lineHeight: 1.55, marginBottom: 16 }}>{opt.description}</p>
                    <div style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "var(--risk-soft, rgba(255,90,90,0.1))" }}>
                      <p className="text-eyebrow" style={{ color: "var(--risk)", marginBottom: 6 }}>THE COST</p>
                      <p style={{ fontWeight: 400, fontSize: 14, color: "#4A4D52", lineHeight: 1.5 }}>{opt.cost}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedOption(i); setChosenDirection(opt.name); navigate("step5") }}
                      className="btn-primary"
                      style={{ marginTop: 20, fontSize: 14, padding: "10px 20px", minHeight: 48, width: "100%" }}
                    >
                      {"I\u2019m going with this one"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── STEP 5: Your choice ─── */}
          {view === "step5" && (
            <>
              <PathIndicator current={4} />
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>Your choice.</h1>
              <p className="text-body-lg" style={{ marginBottom: 36 }}>What are you going with? Write it in your own words.</p>

              <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 12 }}>THE DIRECTION YOU&apos;RE CHOOSING</p>
              <textarea
                className="lumo-textarea"
                style={{ minHeight: 80 }}
                placeholder="e.g. Deprecate the legacy digest and move to personalized push notifications"
                value={chosenDirection}
                onChange={e => setChosenDirection(e.target.value)}
              />

              <div style={{ marginTop: 32 }}>
                <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 12 }}>WHY THIS ONE</p>
                <textarea
                  className="lumo-textarea"
                  style={{ minHeight: 120 }}
                  placeholder="Why does this feel right? What tipped it? Include any specific numbers or constraints."
                  value={reasoning}
                  onChange={e => setReasoning(e.target.value)}
                />
              </div>

              <div style={{ marginTop: 40 }}>
                <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 16 }}>HOW CONFIDENT?</p>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <input
                    type="range" min={1} max={10} value={confidence}
                    onChange={e => setConfidence(Number(e.target.value))}
                    style={{
                      flex: 1, height: 2, appearance: "none", WebkitAppearance: "none",
                      background: "var(--border-default)", outline: "none", cursor: "pointer",
                      accentColor: "var(--accent-primary)",
                    }}
                  />
                  <span className="text-mono" style={{ fontSize: 26, color: "var(--accent-primary)", fontWeight: 400, minWidth: 72, textAlign: "right" }}>
                    {confidence} / 10
                  </span>
                </div>
              </div>

              {/* Error state */}
              {aiError && (
                <div className="lumo-card" style={{ marginTop: 32, padding: 20, borderColor: "var(--risk)", backgroundColor: "rgba(160, 74, 56, 0.05)" }}>
                  <p style={{ color: "var(--text-primary)", fontSize: 15, marginBottom: 16 }}>{aiError}</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {aiErrorCode !== "RATE_LIMITED" && (
                      <button onClick={handleGenerate} className="btn-secondary" style={{ fontSize: 14, padding: "8px 18px", minHeight: 44 }}>
                        Try again
                      </button>
                    )}
                    <button
                      onClick={showExample}
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                        fontSize: 14, color: "var(--accent-primary)", textDecoration: "underline",
                        fontFamily: "inherit", minHeight: 44, display: "flex", alignItems: "center",
                      }}
                    >
                      see an example of Lumo&apos;s output instead
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── LOADING ─── */}
          {view === "loading" && (
            <div style={{ textAlign: "center", paddingTop: 120 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: "50%",
                    backgroundColor: "var(--accent-primary)",
                    animation: "pulseDot 1.5s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 20, color: "var(--text-secondary)", fontStyle: "italic", fontFamily: "var(--font-serif-italic, Georgia, serif)" }}>
                {LOADING_TEXTS[loadingText]}
              </p>
              {loadingSlowWarning && (
                <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginTop: 20 }}>
                  Still thinking. Real decisions take a minute sometimes.
                </p>
              )}
              <style>{`
                @keyframes pulseDot {
                  0%, 100% { opacity: 0.3; transform: scale(0.8); }
                  50% { opacity: 1; transform: scale(1); }
                }
              `}</style>
            </div>
          )}

          {/* ─── STEP 6: AI Output ─── */}
          {view === "step6" && aiOutput && (
            <>
              {/* Example mode banner */}
              {isExampleMode && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                  padding: "12px 20px", marginBottom: 32,
                  backgroundColor: "var(--accent-primary-soft)",
                  borderRadius: "var(--radius)",
                  border: "1px solid rgba(226, 104, 71, 0.2)",
                }}>
                  <span style={{ fontSize: 14, color: "var(--accent-primary)", fontWeight: 500 }}>
                    This is an example.
                  </span>
                  <button
                    onClick={() => { resetDecision(); navigate("step1") }}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                      fontSize: 14, color: "var(--accent-primary)", fontWeight: 600,
                      fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                      minHeight: 44,
                    }}
                  >
                    Start your own decision <ArrowRight style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              )}

              {!isExampleMode && <PathIndicator current={5} />}

              {/* Clarity Summary */}
              <div className="signature-italic" style={{ fontSize: 18, lineHeight: 1.65, marginBottom: 44, maxWidth: 580 }}>
                {aiOutput.claritySummary}
              </div>

              {/* Tab navigation */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--border-default)", marginBottom: 24, overflowX: "auto" }}>
                {(["engineering", "design", "leadership"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "12px 20px", minHeight: 44, fontSize: 14, fontWeight: 500,
                      color: activeTab === tab ? "var(--accent-primary)" : "var(--text-secondary)",
                      background: "none", border: "none",
                      borderBottom: activeTab === tab ? "2px solid var(--accent-primary)" : "2px solid transparent",
                      cursor: "pointer", transition: "all 150ms ease-out",
                      textTransform: "capitalize", marginBottom: -1, fontFamily: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Message card */}
              <div className="lumo-card" style={{ padding: "24px 24px 20px" }}>
                <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 12 }}>
                  FOR {activeTab.toUpperCase()} PARTNERS
                </p>
                <div style={{
                  padding: "14px 0 14px 18px",
                  borderLeft: "2px solid var(--border-default)",
                  fontSize: 15, lineHeight: 1.65, color: "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                }}>
                  {aiOutput.messages[activeTab]}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <button
                    onClick={() => handleCopy(activeTab, aiOutput.messages[activeTab])}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: "6px 10px",
                      display: "flex", alignItems: "center", gap: 6, minHeight: 44,
                      borderRadius: "var(--radius)",
                    }}
                    aria-label="Copy message"
                  >
                    {copiedKey === activeTab ? (
                      <>
                        <Check style={{ width: 15, height: 15, color: "var(--positive)" }} />
                        <span style={{ fontSize: 13, color: "var(--positive)", fontWeight: 500 }}>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy style={{ width: 15, height: 15, color: "var(--text-tertiary)" }} />
                        <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>Copy message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Copy entire decision */}
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={handleCopyAll}
                  className="btn-secondary"
                  style={{ width: "100%", fontSize: 14, padding: "12px 20px", minHeight: 44, justifyContent: "center" }}
                >
                  {copiedKey === "all" ? (
                    <>
                      <Check style={{ width: 15, height: 15 }} />
                      Copied all three messages
                    </>
                  ) : (
                    <>
                      <ClipboardCopy style={{ width: 15, height: 15 }} />
                      Copy entire decision
                    </>
                  )}
                </button>
              </div>

              {/* CTAs */}
              <div style={{ textAlign: "center", marginTop: 52 }}>
                <button
                  className="btn-secondary"
                  onClick={() => { resetDecision(); navigate("step1") }}
                  style={{ fontSize: 14, padding: "12px 24px", minHeight: 44 }}
                >
                  Start a new decision
                </button>
                <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-tertiary)" }}>
                  <button
                    onClick={() => setShowAbout(true)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                      fontSize: 13, color: "var(--text-tertiary)", textDecoration: "underline",
                      fontFamily: "inherit",
                    }}
                  >
                    see how this was built
                  </button>
                  {" \u2192"}
                </p>
              </div>

              <div style={{ textAlign: "center", marginTop: 40 }}>
                <span className="text-mono" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                  Decision {"\u2116"}{decisionNum}
                </span>
              </div>

              <p style={{
                textAlign: "center",
                marginTop: 40,
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "#8B8B8E",
              }}>
                the decision was always yours. lumo just helped you say it.
              </p>
            </>
          )}

        </div>
      </main>

      {/* === ACTION ZONE === */}
      {view !== "home" && view !== "loading" && view !== "step6" && (
        <div className="action-zone">
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              className="btn-secondary"
              style={{ fontSize: 14, padding: "10px 18px", minHeight: 44 }}
              onClick={() => {
                if (currentStepIndex <= 0) navigate("home")
                else navigate(STEP_NAMES[currentStepIndex - 1].key)
              }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              Back
            </button>
            <button
              className="btn-primary"
              style={{ fontSize: 14, padding: "10px 22px", minHeight: 44 }}
              onClick={() => {
                if (view === "step1") { handleAnalyze(); return }
                if (view === "step5") { handleGenerate(); return }
                if (currentStepIndex < STEP_NAMES.length - 1) navigate(STEP_NAMES[currentStepIndex + 1].key)
              }}
            >
              {view === "step1" && "Show me what you got"}
              {view === "step2" && "This looks right"}
              {view === "step3" && "Compare what each costs"}
              {view === "step4" && "Choose one above"}
              {view === "step5" && "Now help me tell people"}
              <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
            {view === "step2" && (
              <button
                onClick={() => { resetDecision(); navigate("step1") }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 14, color: "var(--text-tertiary)", fontFamily: "inherit",
                  padding: "8px 0", marginTop: 8,
                }}
              >
                Not quite — start over
              </button>
            )}
          </div>
        </div>
      )}

      {/* === FOOTER === */}
      <footer style={{
        borderTop: "1px solid var(--border-default)",
        padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
      }}>
        <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>built by</span>
        <a
          href="https://linkedin.com/in/terrancerange"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, textDecoration: "underline" }}
        >
          Terrance Range
        </a>
      </footer>

    </div>
  )
}

/* ─── PATH INDICATOR ─── */
function PathIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36, flexWrap: "wrap", rowGap: 8 }}>
      {STEP_NAMES.map((step, i) => (
        <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              backgroundColor: i < current ? "var(--text-primary)" : i === current ? "var(--accent-primary)" : "var(--border-default)",
              transition: "background-color 150ms ease-out", flexShrink: 0,
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
            <span style={{ margin: "0 7px", color: "var(--border-default)", fontSize: 11 }}>/</span>
          )}
        </div>
      ))}
    </div>
  )
}
