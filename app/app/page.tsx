"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowRight, ArrowLeft, Copy, Check, ChevronRight, X } from "lucide-react"
import { AIDebugPanel } from "@/components/ai-debug-panel"
import { SHOW_DEBUG_PANEL, isAIDiagnostics, type AIDiagnostics } from "@/lib/ai-debug-config"

/* ─── TYPES ─── */
type View = "home" | "step1" | "analyzing" | "step2" | "step3" | "step4" | "step5" | "loading" | "step6" | "done"

type DraftChannel = "email" | "slack" | "dm"

interface AudienceDraft {
  audience: string
  channel: DraftChannel
  subject: string
  body: string
}

interface AIOutput {
  claritySummary: string
  executionTeam: string
  drafts: AudienceDraft[]
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
  id: string
  question: string
  step: number
  status: "Pending" | "Done"
  decisionNum: number
  situation: string
  urgency: string
  chosenDirection: string
  reasoning: string
  confidence: number
  whatGivingUp: string
  claritySummary: string
  executionTeam: string
  drafts: AudienceDraft[]
  copiedAudiences: string[]
  analysis?: AnalysisResult | null
}

const DECISIONS_STORAGE_KEY = "lumo-decisions-v1"

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

const EXAMPLE_OUTPUT: AIOutput = {
  claritySummary: "The example decision is to ship the core release on schedule and give enterprise SSO its own committed date.",
  executionTeam: "Engineering",
  drafts: [
    { audience: "Engineering", channel: "slack", subject: "", body: "Ship v2 on schedule. SSO moves to its own release with a committed date. Please confirm the scope and owner for the SSO work." },
    { audience: "Your VP", channel: "email", subject: "Decision: ship v2 on schedule", body: "The call is to ship v2 on time and give enterprise SSO its own release date. This keeps the fix moving for 40 waiting customers. I am watching whether the three prospects read the date as a no. Dana will speak with them this week. Confidence is 4 of 5." },
    { audience: "Sales", channel: "slack", subject: "", body: "V2 ships on schedule. For the three prospects waiting on SSO, share the written release date once it is confirmed. Please send me any customer concerns this week." },
    { audience: "Support", channel: "slack", subject: "", body: "V2 ships on schedule. SSO will have a separate release date. If customers ask, explain that the fix is shipping now and the SSO date will be shared in writing." },
  ],
}

/* ─── MAIN COMPONENT ─── */
export default function ProductApp() {
  const [view, setView] = useState<View>("home")
  const [situation, setSituation] = useState("")
  const [urgency, setUrgency] = useState("")
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [chosenDirection, setChosenDirection] = useState("")
  const [reasoning, setReasoning] = useState("")
  const [whatGivingUp, setWhatGivingUp] = useState("")
  const [confidence, setConfidence] = useState(3)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [copiedAudiences, setCopiedAudiences] = useState<string[]>([])
  const [decisionNum, setDecisionNum] = useState(1)
  const [currentDecisionId, setCurrentDecisionId] = useState<string | null>(null)
  const [aiOutput, setAiOutput] = useState<AIOutput | null>(null)
  const [rewritingAudience, setRewritingAudience] = useState<string | null>(null)
  const [rewriteError, setRewriteError] = useState<string | null>(null)
  const [rewriteDiagnostics, setRewriteDiagnostics] = useState<AIDiagnostics | null>(null)
  const [audienceInput, setAudienceInput] = useState("")
  const [showAddAudience, setShowAddAudience] = useState(false)
  const [previousDrafts, setPreviousDrafts] = useState<Record<string, AudienceDraft>>({})
  const [aiStatus, setAiStatus] = useState<"ready" | "connected" | "unavailable">("ready")
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiErrorCode, setAiErrorCode] = useState<ErrorCode>(null)
  const [aiErrorDetails, setAiErrorDetails] = useState<AIDiagnostics | null>(null)
  const [loadingText, setLoadingText] = useState(0)
  const [loadingSlowWarning, setLoadingSlowWarning] = useState(false)
  const [activeTab, setActiveTab] = useState("")
  const [isExampleMode, setIsExampleMode] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [analyzingText, setAnalyzingText] = useState(0)
  const [sectionsVisible, setSectionsVisible] = useState<number[]>([])
  const [isHoldingCommit, setIsHoldingCommit] = useState(false)
  const [sessionDecisions, setSessionDecisions] = useState<SessionDecision[]>([])
  const decisionsLoadedRef = useRef(false)
  const holdCommitTimerRef = useRef<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const navigate = useCallback((v: View) => {
    setView(v)
    window.scrollTo({ top: 0 })
  }, [])

  const updateSavedDecision = useCallback((updates: Partial<SessionDecision>) => {
    if (!currentDecisionId) return
    setSessionDecisions((previous) => previous.map((decision) =>
      decision.id === currentDecisionId ? { ...decision, ...updates } : decision,
    ))
  }, [currentDecisionId])

  const handleCopy = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const element = document.createElement("textarea")
      element.value = text
      element.setAttribute("readonly", "")
      element.style.position = "fixed"
      element.style.opacity = "0"
      document.body.appendChild(element)
      element.select()
      const copied = document.execCommand("copy")
      document.body.removeChild(element)
      if (!copied) {
        setRewriteError("Clipboard access was blocked. Select and copy the draft text instead.")
        return
      }
    }
    const audience = key === "all" ? null : key
    if (audience) {
      setCopiedAudiences((previous) => previous.includes(audience) ? previous : [...previous, audience])
      updateSavedDecision({ copiedAudiences: [...copiedAudiences.filter((item) => item !== audience), audience] })
    }
    setCopiedKey(key)
    window.setTimeout(() => setCopiedKey(null), 1500)
  }, [copiedAudiences, updateSavedDecision])

  const resetDecision = useCallback(() => {
    setSituation("")
    setUrgency("")
    setSelectedOption(null)
    setChosenDirection("")
    setReasoning("")
    setWhatGivingUp("")
    setConfidence(3)
    setCopiedKey(null)
    setCopiedAudiences([])
    setAiOutput(null)
    setCurrentDecisionId(null)
    setRewriteError(null)
    setRewriteDiagnostics(null)
    setRewritingAudience(null)
    setAudienceInput("")
    setShowAddAudience(false)
    setPreviousDrafts({})
    setAiError(null)
    setAiErrorCode(null)
    setAiErrorDetails(null)
    setLoadingSlowWarning(false)
    setIsExampleMode(false)
    setActiveTab("")
    setAnalysis(null)
    setAnalyzingText(0)
  }, [])

  // Analyze the user's situation after step 1
  const handleAnalyze = async () => {
    if (!situation.trim() || !urgency) return

    setAnalyzingText(0)
    setAiError(null)
    setAiErrorCode(null)
    setAiErrorDetails(null)
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
        setAiStatus("unavailable")
        setAiError(data.error)
        setAiErrorCode(data.errorCode ?? "SERVER_ERROR")
        setAiErrorDetails(isAIDiagnostics(data.diagnostics) ? data.diagnostics : null)
        navigate("step1")
        return
      }

      setAiStatus("connected")
      setAnalysis(data.analysis)
      navigate("step2")
    } catch (err) {
      clearInterval(textInterval)
      setAiStatus("unavailable")
      const msg = err instanceof Error ? err.message : "Analysis failed"
      setAiError(msg)
      navigate("step1")
    }
  }

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DECISIONS_STORAGE_KEY)
      const parsed: unknown = stored ? JSON.parse(stored) : []
      if (Array.isArray(parsed)) {
        setSessionDecisions(parsed.filter((decision): decision is SessionDecision =>
          Boolean(decision && typeof decision.id === "string" && typeof decision.question === "string" && typeof decision.decisionNum === "number" && (decision.status === "Pending" || decision.status === "Done") && Array.isArray(decision.drafts)),
        ))
      }
    } catch {
      setSessionDecisions([])
    } finally {
      decisionsLoadedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (!decisionsLoadedRef.current) return
    try {
      window.localStorage.setItem(DECISIONS_STORAGE_KEY, JSON.stringify(sessionDecisions))
    } catch {
      setRewriteError("This browser could not save the latest decision changes.")
    }
  }, [sessionDecisions])

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
    setActiveTab(EXAMPLE_OUTPUT.drafts[0].audience)
    setCopiedAudiences([])
    navigate("step6")
  }, [navigate])

  const handleGenerate = async () => {
    if (!situation.trim() || !urgency || !chosenDirection.trim() || !reasoning.trim() || !whatGivingUp.trim()) {
      setAiError("Complete the situation, timing, choice, reasoning, and what you are giving up before drafting messages.")
      return
    }

    setAiError(null)
    setAiErrorCode(null)
    setAiErrorDetails(null)
    setRewriteError(null)
    setRewriteDiagnostics(null)
    setLoadingText(0)
    setLoadingSlowWarning(false)

    const controller = new AbortController()
    abortRef.current = controller
    navigate("loading")

    const requestBody = { situation, urgency, chosenDirection, reasoning, confidence, whatGivingUp, analysis }
    let failureDetails: AIDiagnostics | null = null

    try {
      const response = await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(requestBody),
      })
      const data = await response.json()
      if (!data.success) {
        setAiStatus("unavailable")
        setAiErrorCode(data.errorCode ?? "SERVER_ERROR")
        failureDetails = isAIDiagnostics(data.diagnostics) ? data.diagnostics : null
        throw new Error(data.error)
      }

      const generated = data as AIOutput
      const nextDecisionNum = Math.max(0, ...sessionDecisions.map((decision) => decision.decisionNum)) + 1
      const id = crypto.randomUUID()
      const savedDecision: SessionDecision = {
        id,
        question: chosenDirection.trim(),
        step: 6,
        status: "Pending",
        decisionNum: nextDecisionNum,
        situation,
        urgency,
        chosenDirection,
        reasoning,
        confidence,
        whatGivingUp,
        claritySummary: generated.claritySummary,
        executionTeam: generated.executionTeam,
        drafts: generated.drafts,
        copiedAudiences: [],
        analysis,
      }
      setDecisionNum(nextDecisionNum)
      setCurrentDecisionId(id)
      setSessionDecisions((previous) => [savedDecision, ...previous])
      setAiOutput(generated)
      setActiveTab(generated.drafts[0]?.audience ?? "")
      setCopiedAudiences([])
      setPreviousDrafts({})
      setAiStatus("connected")
      setIsExampleMode(false)
      navigate("step6")
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      setAiStatus("unavailable")
      const msg = err instanceof Error ? err.message : "Something went wrong on our end. Try again."
      setAiError(msg)
      setAiErrorDetails(failureDetails)
      navigate("step5")
    }
  }

  const rewriteDraft = async (instruction: "shorter" | "more-direct" | "add-audience", requestedAudience?: string) => {
    if (!aiOutput) return
    const isAddAudience = instruction === "add-audience"
    const sourceDraft = isAddAudience
      ? { audience: requestedAudience?.trim() ?? "", channel: "slack" as const, subject: "", body: "" }
      : aiOutput.drafts.find((draft) => draft.audience === activeTab)
    if (!sourceDraft) return

    const targetAudience = isAddAudience ? sourceDraft.audience : sourceDraft.audience
    setRewriteError(null)
    setRewriteDiagnostics(null)
    setRewritingAudience(targetAudience)
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: sourceDraft,
          context: {
            situation, urgency, chosenDirection, reasoning, confidence, whatGivingUp,
            claritySummary: aiOutput.claritySummary,
            affectedAudiences: analysis?.whoIsAffected ?? "",
          },
          instruction,
          audience: requestedAudience,
        }),
      })
      const data = await response.json()
      if (!data.success) {
        setAiStatus("unavailable")
        setRewriteDiagnostics(isAIDiagnostics(data.diagnostics) ? data.diagnostics : null)
        throw new Error(data.error ?? "The draft could not be rewritten.")
      }

      const rewritten = data.draft as AudienceDraft
      let updatedDrafts: AudienceDraft[]
      if (isAddAudience) {
        updatedDrafts = [...aiOutput.drafts, rewritten]
        setActiveTab(rewritten.audience)
        setAudienceInput("")
        setShowAddAudience(false)
      } else {
        setPreviousDrafts((previous) => ({ ...previous, [sourceDraft.audience]: sourceDraft }))
        updatedDrafts = aiOutput.drafts.map((draft) => draft.audience === sourceDraft.audience ? rewritten : draft)
      }
      setAiOutput({ ...aiOutput, drafts: updatedDrafts })
      updateSavedDecision({ drafts: updatedDrafts })
      setAiStatus("connected")
    } catch (error) {
      setRewriteError(error instanceof Error ? error.message : "The draft could not be rewritten. Try again.")
    } finally {
      setRewritingAudience(null)
    }
  }

  const updateDraft = (audience: string, updates: Partial<AudienceDraft>) => {
    if (!aiOutput) return
    const updatedDrafts = aiOutput.drafts.map((draft) => draft.audience === audience ? { ...draft, ...updates } : draft)
    setAiOutput({ ...aiOutput, drafts: updatedDrafts })
    updateSavedDecision({ drafts: updatedDrafts })
  }

  const undoDraft = () => {
    const previous = previousDrafts[activeTab]
    if (!previous || !aiOutput) return
    const updatedDrafts = aiOutput.drafts.map((draft) => draft.audience === activeTab ? previous : draft)
    setAiOutput({ ...aiOutput, drafts: updatedDrafts })
    updateSavedDecision({ drafts: updatedDrafts })
    setPreviousDrafts((items) => {
      const next = { ...items }
      delete next[activeTab]
      return next
    })
  }

  const startCommitHold = () => {
    if (holdCommitTimerRef.current !== null) window.clearTimeout(holdCommitTimerRef.current)
    setIsHoldingCommit(true)
    holdCommitTimerRef.current = window.setTimeout(() => {
      holdCommitTimerRef.current = null
      setIsHoldingCommit(false)
      void handleGenerate()
    }, 800)
  }

  const cancelCommitHold = () => {
    if (holdCommitTimerRef.current !== null) window.clearTimeout(holdCommitTimerRef.current)
    holdCommitTimerRef.current = null
    setIsHoldingCommit(false)
  }

  const fileDecision = () => {
    if (!currentDecisionId || isExampleMode) return
    updateSavedDecision({ status: "Done" })
    navigate("done")
  }

  const openDecision = (decision: SessionDecision) => {
    setSituation(decision.situation)
    setUrgency(decision.urgency)
    setChosenDirection(decision.chosenDirection)
    setReasoning(decision.reasoning)
    setWhatGivingUp(decision.whatGivingUp)
    setConfidence(decision.confidence)
    setDecisionNum(decision.decisionNum)
    setCurrentDecisionId(decision.id)
    setAiOutput({ claritySummary: decision.claritySummary, executionTeam: decision.executionTeam, drafts: decision.drafts })
    setAnalysis(decision.analysis ?? null)
    setCopiedAudiences(decision.copiedAudiences ?? [])
    setActiveTab(decision.drafts[0]?.audience ?? "")
    setIsExampleMode(false)
    navigate("step6")
  }

  const allDecisions = [...sessionDecisions].sort((left, right) => right.decisionNum - left.decisionNum)
  const inMotion = allDecisions.filter((decision) => decision.status === "Pending")
  const recentDone = allDecisions.filter((decision) => decision.status === "Done").slice(0, 5)
  const activeDraft = aiOutput?.drafts.find((draft) => draft.audience === activeTab) ?? aiOutput?.drafts[0] ?? null

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
          <span aria-live="polite" style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
            color: aiStatus === "unavailable" ? "var(--risk)" : "var(--positive)",
            backgroundColor: aiStatus === "unavailable" ? "rgba(160, 74, 56, 0.1)" : "rgba(74, 122, 92, 0.1)",
            padding: "4px 10px", borderRadius: 9999, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span
              className={aiStatus === "connected" ? "anim-pulse" : undefined}
              style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                backgroundColor: aiStatus === "unavailable" ? "var(--caution)" : "var(--positive)",
              }}
            />
            <span className="hide-on-mobile">
              {aiStatus === "unavailable" ? "AI unavailable" : aiStatus === "connected" ? "AI connected" : "AI ready"}
            </span>
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
              L
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
                    L
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>Your workspace</p>
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
                        onClick={() => openDecision(d)}
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
                  {SHOW_DEBUG_PANEL && <AIDebugPanel diagnostics={aiErrorDetails} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <button
                      onClick={() => { setAiError(null); setAiErrorCode(null); setAiErrorDetails(null); showExample() }}
                      className="btn-primary"
                      style={{ fontSize: 14, padding: "10px 20px", minHeight: 44 }}
                    >
                      See an example
                      <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      onClick={() => { setAiError(null); setAiErrorCode(null); setAiErrorDetails(null); handleAnalyze() }}
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
                  {SHOW_DEBUG_PANEL && <AIDebugPanel diagnostics={aiErrorDetails} />}
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

              <div style={{ marginTop: 32 }}>
                <label htmlFor="what-giving-up" className="text-eyebrow" style={{ color: "var(--text-tertiary)", display: "block", marginBottom: 12 }}>WHAT ARE YOU GIVING UP?</label>
                <textarea
                  id="what-giving-up"
                  className="lumo-textarea"
                  style={{ minHeight: 88 }}
                  placeholder="Name the tradeoff you are accepting, in your own words."
                  value={whatGivingUp}
                  onChange={(event) => setWhatGivingUp(event.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: 40 }}>
                <p className="text-eyebrow" style={{ color: "var(--text-tertiary)", marginBottom: 16 }}>HOW CONFIDENT?</p>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <input
                    type="range" min={1} max={5} value={confidence}
                    onChange={e => setConfidence(Number(e.target.value))}
                    style={{
                      flex: 1, height: 2, appearance: "none", WebkitAppearance: "none",
                      background: "var(--border-default)", outline: "none", cursor: "pointer",
                      accentColor: "var(--accent-primary)",
                    }}
                  />
                  <span className="text-mono" style={{ fontSize: 26, color: "var(--accent-primary)", fontWeight: 400, minWidth: 72, textAlign: "right" }}>
                    {confidence} / 5
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  aria-label="Hold to commit this decision. You can also use Draft messages now below."
                  onPointerDown={startCommitHold}
                  onPointerUp={cancelCommitHold}
                  onPointerLeave={cancelCommitHold}
                  onPointerCancel={cancelCommitHold}
                  onClick={(event) => { if (event.detail === 0) void handleGenerate() }}
                  style={{ minHeight: 44, width: "100%", borderColor: isHoldingCommit ? "var(--accent-primary)" : undefined, color: isHoldingCommit ? "var(--accent-primary)" : undefined }}
                >
                  {isHoldingCommit ? "Keep holding to commit" : "Hold to commit"}
                </button>
                <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-tertiary)", textAlign: "center" }}>You can also use the instant action below.</p>
              </div>

              {/* Error state */}
              {aiError && (
                <div className="lumo-card" style={{ marginTop: 32, padding: 20, borderColor: "var(--risk)", backgroundColor: "rgba(160, 74, 56, 0.05)" }}>
                  <p style={{ color: "var(--text-primary)", fontSize: 15, marginBottom: 16 }}>{aiError}</p>
                  {SHOW_DEBUG_PANEL && <AIDebugPanel diagnostics={aiErrorDetails} />}
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

          {/* ─── STEP 6: Tell people ─── */}
          {view === "step6" && aiOutput && activeDraft && (
            <>
              {isExampleMode && (
                <div role="note" style={{ padding: "12px 16px", marginBottom: 28, borderRadius: "var(--radius)", backgroundColor: "var(--accent-primary-soft)", color: "var(--accent-primary)", fontSize: 14 }}>
                  Example drafts only. Start a decision to generate messages from your own input.
                </div>
              )}
              {!isExampleMode && <PathIndicator current={5} />}
              <h1 className="text-heading-lg" style={{ marginBottom: 8 }}>Tell people.</h1>
              <p className="text-body-lg" style={{ marginBottom: 28 }}>One decision, written for each audience. Edit, copy, send.</p>

              <section className="lumo-card" aria-label="Decision summary" style={{ padding: 20, marginBottom: 32 }}>
                <p className="text-eyebrow" style={{ color: "var(--accent-primary)", marginBottom: 8 }}>THE CALL</p>
                <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--text-primary)" }}>{aiOutput.claritySummary}</p>
              </section>

              <div role="tablist" aria-label="Message audiences" style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid var(--border-default)", marginBottom: 0 }}>
                {aiOutput.drafts.map((draft) => {
                  const selected = draft.audience === activeDraft.audience
                  const copied = copiedAudiences.includes(draft.audience)
                  return (
                    <button
                      key={draft.audience}
                      id={`audience-tab-${encodeURIComponent(draft.audience)}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls="audience-draft-panel"
                      onClick={() => setActiveTab(draft.audience)}
                      style={{
                        padding: "12px 16px", minHeight: 48, flexShrink: 0,
                        color: selected ? "var(--accent-primary)" : "var(--text-secondary)",
                        background: "none", border: 0,
                        borderBottom: selected ? "2px solid var(--accent-primary)" : "2px solid transparent",
                        marginBottom: -1, cursor: "pointer", fontFamily: "inherit", fontSize: 14,
                        fontWeight: selected ? 600 : 500, whiteSpace: "nowrap",
                        transition: "color 180ms ease-out, border-color 180ms ease-out",
                      }}
                    >
                      {draft.audience}{copied ? <span style={{ marginLeft: 7, color: "var(--positive)", fontSize: 11 }}>copied</span> : null}
                    </button>
                  )
                })}
              </div>

              <div
                key={activeDraft.audience}
                id="audience-draft-panel"
                role="tabpanel"
                aria-labelledby={`audience-tab-${encodeURIComponent(activeDraft.audience)}`}
                className="audience-draft-enter lumo-card"
                style={{ padding: "20px 20px 18px", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <p className="text-mono" style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                    {activeDraft.channel} <span aria-hidden="true">/</span> {activeDraft.body.trim() ? activeDraft.body.trim().split(/\s+/).length : 0} words
                  </p>
                  {rewritingAudience === activeDraft.audience && (
                    <span className="text-mono rewriting-status" role="status" aria-live="polite">rewriting</span>
                  )}
                </div>
                {activeDraft.channel === "email" && (
                  <label style={{ display: "block", marginBottom: 14 }}>
                    <span className="text-eyebrow" style={{ display: "block", marginBottom: 8 }}>SUBJECT</span>
                    <input
                      className="lumo-input"
                      aria-label="Email subject"
                      value={activeDraft.subject}
                      onChange={(event) => updateDraft(activeDraft.audience, { subject: event.target.value })}
                      disabled={isExampleMode || rewritingAudience === activeDraft.audience}
                    />
                  </label>
                )}
                <label style={{ display: "block" }}>
                  <span className="text-eyebrow" style={{ display: "block", marginBottom: 8 }}>MESSAGE</span>
                  <textarea
                    className="lumo-textarea"
                    aria-label={`${activeDraft.audience} message`}
                    value={activeDraft.body}
                    onChange={(event) => updateDraft(activeDraft.audience, { body: event.target.value })}
                    style={{ minHeight: 220, fontSize: 15, lineHeight: 1.65, resize: "vertical" }}
                    disabled={isExampleMode || rewritingAudience === activeDraft.audience}
                  />
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 14 }}>
                  <button type="button" className="btn-secondary" disabled={isExampleMode || rewritingAudience !== null} onClick={() => void rewriteDraft("shorter")} style={{ minHeight: 40, padding: "8px 13px", fontSize: 13 }}>Shorter</button>
                  <button type="button" className="btn-secondary" disabled={isExampleMode || rewritingAudience !== null} onClick={() => void rewriteDraft("more-direct")} style={{ minHeight: 40, padding: "8px 13px", fontSize: 13 }}>More direct</button>
                  {previousDrafts[activeDraft.audience] && <button type="button" className="btn-text" onClick={undoDraft} style={{ minHeight: 40, padding: "8px 10px", fontSize: 13 }}>Undo</button>}
                  <button
                    type="button"
                    onClick={() => void handleCopy(activeDraft.audience, activeDraft.channel === "email" && activeDraft.subject ? `Subject: ${activeDraft.subject}\n\n${activeDraft.body}` : activeDraft.body)}
                    className="btn-secondary"
                    style={{ minHeight: 40, padding: "8px 14px", marginLeft: "auto", color: copiedKey === activeDraft.audience ? "var(--positive)" : undefined }}
                  >
                    {copiedKey === activeDraft.audience || copiedAudiences.includes(activeDraft.audience) ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    {copiedKey === activeDraft.audience ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <p className="text-mono" aria-live="polite" style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 14 }}>
                {copiedAudiences.filter((audience) => aiOutput.drafts.some((draft) => draft.audience === audience)).length} of {aiOutput.drafts.length} copied
              </p>

              {rewriteError && (
                <div className="lumo-card" role="alert" style={{ marginTop: 20, padding: 18, borderColor: "var(--risk)" }}>
                  <p style={{ color: "var(--risk)", fontSize: 14, marginBottom: rewriteDiagnostics ? 14 : 0 }}>{rewriteError}</p>
                  {SHOW_DEBUG_PANEL && <AIDebugPanel diagnostics={rewriteDiagnostics} />}
                </div>
              )}

              {!isExampleMode && (
                <div style={{ marginTop: 22 }}>
                  {!showAddAudience ? (
                    <button type="button" className="btn-text" onClick={() => setShowAddAudience(true)} style={{ minHeight: 44 }}>+ Add audience</button>
                  ) : (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault()
                        const audience = audienceInput.trim()
                        if (audience && !aiOutput.drafts.some((draft) => draft.audience.toLowerCase() === audience.toLowerCase())) void rewriteDraft("add-audience", audience)
                      }}
                      style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
                    >
                      <label htmlFor="new-audience" className="sr-only">Audience name</label>
                      <input id="new-audience" className="lumo-input" placeholder="e.g. Design lead or Legal" value={audienceInput} onChange={(event) => setAudienceInput(event.target.value)} maxLength={100} style={{ flex: "1 1 220px", width: "auto" }} />
                      <button type="submit" className="btn-primary" disabled={!audienceInput.trim() || rewritingAudience !== null} style={{ minHeight: 44, padding: "10px 16px", fontSize: 13 }}>Generate draft</button>
                      <button type="button" className="btn-text" onClick={() => { setShowAddAudience(false); setAudienceInput("") }} style={{ minHeight: 44 }}>Cancel</button>
                    </form>
                  )}
                </div>
              )}

              {!isExampleMode && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border-default)" }}>
                  <button type="button" className="btn-primary" onClick={fileDecision} style={{ minHeight: 48, padding: "12px 22px" }}>File this decision <ArrowRight aria-hidden="true" /></button>
                </div>
              )}
            </>
          )}

          {/* ─── COMPLETION ─── */}
          {view === "done" && currentDecisionId && (
            <section aria-labelledby="completion-title" style={{ maxWidth: 620, margin: "24px auto 0" }}>
              <p
                className="text-mono completion-number"
                aria-label={`Decision number ${decisionNum}`}
                style={{ fontSize: "clamp(4rem, 10vw, 6rem)", lineHeight: 1, letterSpacing: "-0.06em", color: "var(--accent-primary)" }}
              >
                No.{decisionNum}
              </p>
              <h1 id="completion-title" className="text-heading-lg" style={{ marginTop: 12, marginBottom: 24 }}>Filed.</h1>
              <div className="lumo-card" style={{ padding: 24 }}>
                <div style={{ display: "grid", gap: 20 }}>
                  <div>
                    <p className="text-eyebrow" style={{ marginBottom: 8 }}>THE CALL</p>
                    <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--text-primary)" }}>{chosenDirection}</p>
                  </div>
                  <div>
                    <p className="text-eyebrow" style={{ marginBottom: 8 }}>CONFIDENCE</p>
                    <p className="text-mono" style={{ fontSize: 15, color: "var(--text-primary)" }}>{confidence} of 5</p>
                  </div>
                  <div>
                    <p className="text-eyebrow" style={{ marginBottom: 8 }}>MESSAGES PREPARED FOR</p>
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)" }}>{aiOutput?.drafts.map((draft) => draft.audience).join(", ")}</p>
                  </div>
                </div>
              </div>
              <p className="signature-italic" style={{ marginTop: 28 }}>
                {`You gave up ${whatGivingUp.trim().replace(/[.!?]+$/, "")}. It's on record, so the next time someone asks why, the answer is here.`}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 36 }}>
                <button type="button" className="btn-secondary" onClick={() => { resetDecision(); navigate("home") }} style={{ minHeight: 46 }}>Back to home</button>
                <button type="button" className="btn-primary" onClick={() => navigate("step6")} style={{ minHeight: 46 }}>Review the drafts</button>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* === ACTION ZONE === */}
      {view !== "home" && view !== "loading" && view !== "step6" && view !== "done" && (
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
              {view === "step5" && "Draft messages now"}
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
