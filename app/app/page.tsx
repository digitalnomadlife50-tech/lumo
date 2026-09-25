"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { AIDebugPanel } from "@/components/ai-debug-panel"
import { SHOW_DEBUG_PANEL, isAIDiagnostics, type AIDiagnostics } from "@/lib/ai-debug-config"
import {
  HomeScreen,
  Step1Screen,
  Step2Screen,
  Step3Screen,
  Step4Screen,
  Step5Screen,
  Step6Screen,
  CompleteScreen,
  type PastDecision,
  type ReadBack,
  type Option,
  type Comparison,
  type Draft,
  type DraftInProgress,
} from "@/components/lumo/screens"
import type { AiStatus } from "@/components/lumo/ui"

/* ─── TYPES ─── */
type View = "home" | "step1" | "step2" | "step3" | "step4" | "step5" | "step6" | "done"

const STEP_ORDER: View[] = ["step1", "step2", "step3", "step4", "step5", "step6", "done"]
const STEP_NUMBER: Record<View, number> = { home: 0, step1: 1, step2: 2, step3: 3, step4: 4, step5: 5, step6: 6, done: 7 }

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
  iNoticed: string
  options: Array<{
    name: string
    description: string
    cost: string
    costLevel: "low" | "medium" | "high"
    whoItHurts: string
    reversible: "yes" | "partly" | "no"
    risk: string
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
  analysis: AnalysisResult | null
  readBack: ReadBack | null
  revisitDate?: string
  decidedAtMs?: number
  startedAtMs?: number
}

interface SavedDraft {
  id: string
  number: number
  step: number
  situation: string
  urgency: string
  options: Option[]
  selectedOptionId: string | null
  reasoning: string
  whatGivingUp: string
  confidence: number
  analysis: AnalysisResult | null
  readBack: ReadBack | null
  noticed: string
  startedAtMs: number
}

const DECISIONS_STORAGE_KEY = "lumo-decisions-v1"
const DRAFT_STORAGE_KEY = "lumo-draft-v1"

/* ─── MAIN COMPONENT ─── */
export default function ProductApp() {
  const [view, setView] = useState<View>("home")
  const [homeInput, setHomeInput] = useState("")
  const [situation, setSituation] = useState("")
  const [urgency] = useState("Not specified")
  const [options, setOptions] = useState<Option[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [chosenDirection, setChosenDirection] = useState("")
  const [reasoning, setReasoning] = useState("")
  const [whatGivingUp, setWhatGivingUp] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [copiedAudiences, setCopiedAudiences] = useState<string[]>([])
  const [decisionNum, setDecisionNum] = useState<number | null>(null)
  const [currentDecisionId, setCurrentDecisionId] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [readBack, setReadBack] = useState<ReadBack | null>(null)
  const [noticed, setNoticed] = useState("")
  const [aiOutput, setAiOutput] = useState<AIOutput | null>(null)
  const [rewritingAudience, setRewritingAudience] = useState<string | null>(null)
  const [addingAudience, setAddingAudience] = useState(false)
  const [rewriteError, setRewriteError] = useState<string | undefined>(undefined)
  const [rewriteDiagnostics, setRewriteDiagnostics] = useState<AIDiagnostics | null>(null)
  const [previousDrafts, setPreviousDrafts] = useState<Record<string, AudienceDraft>>({})
  const [aiStatus, setAiStatus] = useState<AiStatus>("idle")
  const [aiError, setAiError] = useState<string | undefined>(undefined)
  const [aiErrorCode, setAiErrorCode] = useState<ErrorCode>(null)
  const [aiErrorDetails, setAiErrorDetails] = useState<AIDiagnostics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionDecisions, setSessionDecisions] = useState<SessionDecision[]>([])
  const [direction, setDirection] = useState<"fwd" | "back" | undefined>(undefined)
  const [draft, setDraft] = useState<SavedDraft | null>(null)
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null)
  const decisionsLoadedRef = useRef(false)
  const draftLoadedRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  const navigate = useCallback((v: View) => {
    setView((previous) => {
      const from = STEP_NUMBER[previous]
      const to = STEP_NUMBER[v]
      setDirection(to === from ? undefined : to > from ? "fwd" : "back")
      return v
    })
    window.scrollTo({ top: 0 })
  }, [])

  const jumpTo = useCallback((step: number) => {
    const target = STEP_ORDER[step]
    if (target) navigate(target)
  }, [navigate])

  const updateSavedDecision = useCallback((updates: Partial<SessionDecision>) => {
    if (!currentDecisionId) return
    setSessionDecisions((previous) => previous.map((decision) =>
      decision.id === currentDecisionId ? { ...decision, ...updates } : decision,
    ))
  }, [currentDecisionId])

  const resetDecision = useCallback(() => {
    setHomeInput("")
    setSituation("")
    setOptions([])
    setSelectedOptionId(null)
    setChosenDirection("")
    setReasoning("")
    setWhatGivingUp("")
    setConfidence(0)
    setCopiedAudiences([])
    setAiOutput(null)
    setCurrentDecisionId(null)
    setRewriteError(undefined)
    setRewriteDiagnostics(null)
    setRewritingAudience(null)
    setAddingAudience(false)
    setPreviousDrafts({})
    setAiError(undefined)
    setAiErrorCode(null)
    setAiErrorDetails(null)
    setAnalysis(null)
    setReadBack(null)
    setNoticed("")
    setIsAnalyzing(false)
    setIsGenerating(false)
  }, [])

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

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY)
      if (stored) setDraft(JSON.parse(stored) as SavedDraft)
    } catch {
      setDraft(null)
    } finally {
      draftLoadedRef.current = true
    }
  }, [])

  const nextDecisionNumber = Math.max(0, ...sessionDecisions.map((decision) => decision.decisionNum)) + 1

  useEffect(() => {
    if (!draftLoadedRef.current) return
    if (view === "home" || view === "done" || !situation.trim()) return
    const record: SavedDraft = {
      id: currentDecisionId ?? "draft",
      number: nextDecisionNumber,
      step: STEP_NUMBER[view],
      situation,
      urgency,
      options,
      selectedOptionId,
      reasoning,
      whatGivingUp,
      confidence,
      analysis,
      readBack,
      noticed,
      startedAtMs: startedAtMs ?? Date.now(),
    }
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(record))
    } catch {
      // best effort; ignore storage failures for the draft autosave
    }
  }, [view, situation, urgency, options, selectedOptionId, reasoning, whatGivingUp, confidence, analysis, readBack, noticed, currentDecisionId, nextDecisionNumber, startedAtMs])

  const resumeDraft = useCallback(() => {
    if (!draft) return
    setSituation(draft.situation)
    setOptions(draft.options)
    setSelectedOptionId(draft.selectedOptionId)
    setReasoning(draft.reasoning)
    setWhatGivingUp(draft.whatGivingUp)
    setConfidence(draft.confidence)
    setAnalysis(draft.analysis)
    setReadBack(draft.readBack)
    setNoticed(draft.noticed)
    setStartedAtMs(draft.startedAtMs)
    navigate(STEP_ORDER[Math.max(0, draft.step - 1)] ?? "step1")
  }, [draft, navigate])

  const discardDraft = useCallback(() => {
    setDraft(null)
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
      // ignore storage failures when discarding the draft
    }
  }, [])

  /* ─── Step 1 -> Step 2: analyze the situation ─── */
  const handleAnalyze = async () => {
    if (!situation.trim()) return
    setIsAnalyzing(true)
    setAiError(undefined)
    setAiErrorCode(null)
    setAiErrorDetails(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, urgency }),
      })
      const data = await response.json()

      if (!data.success) {
        setAiStatus("error")
        setAiError(data.error)
        setAiErrorCode(data.errorCode ?? "SERVER_ERROR")
        setAiErrorDetails(isAIDiagnostics(data.diagnostics) ? data.diagnostics : null)
        setIsAnalyzing(false)
        return
      }

      const result = data.analysis as AnalysisResult
      setAiStatus("ok")
      setAnalysis(result)
      setReadBack({ question: result.realQuestion, matters: result.whatMatters, affected: result.whoIsAffected, pressing: result.howPressing })
      setNoticed(result.iNoticed)
      setOptions(result.options.map((option, index) => ({ id: `lumo-${index}`, label: option.name, summary: option.description, source: "lumo" as const })))
      setIsAnalyzing(false)
      navigate("step2")
    } catch (err) {
      setAiStatus("error")
      setAiError(err instanceof Error ? err.message : "Analysis failed")
      setIsAnalyzing(false)
    }
  }

  const addOption = (label: string) => {
    setOptions((previous) => [...previous, { id: `user-${Date.now()}`, label, summary: "", source: "user" as const }])
  }

  const comparisons: Comparison[] = options.map((option) => {
    if (option.source === "lumo") {
      const index = Number(option.id.replace("lumo-", ""))
      const source = analysis?.options[index]
      if (source) {
        return { optionId: option.id, label: option.label, costLevel: source.costLevel, costSummary: source.cost, whoItHurts: source.whoItHurts, reversible: source.reversible, risk: source.risk }
      }
    }
    return { optionId: option.id, label: option.label, costLevel: "medium" as const, costSummary: "Not yet assessed for this option.", whoItHurts: "Not assessed.", reversible: "partly" as const, risk: "This option was added by hand, so Lumo hasn't weighed in on it." }
  })

  /* ─── Step 5 -> Step 6: draft messages ─── */
  const handleGenerate = async () => {
    const selected = options.find((option) => option.id === selectedOptionId)
    if (!selected || !reasoning.trim() || !whatGivingUp.trim() || !confidence) return

    const chosen = selected.label
    setChosenDirection(chosen)
    setAiError(undefined)
    setAiErrorCode(null)
    setAiErrorDetails(null)
    setRewriteError(undefined)
    setRewriteDiagnostics(null)
    setIsGenerating(true)
    navigate("step6")

    const controller = new AbortController()
    abortRef.current = controller

    const requestBody = {
      situation,
      urgency,
      chosenDirection: chosen,
      reasoning,
      confidence,
      whatGivingUp,
      analysis: readBack
        ? { realQuestion: readBack.question, whatMatters: readBack.matters, whoIsAffected: readBack.affected, howPressing: readBack.pressing }
        : undefined,
    }
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
        setAiStatus("error")
        setAiErrorCode(data.errorCode ?? "SERVER_ERROR")
        failureDetails = isAIDiagnostics(data.diagnostics) ? data.diagnostics : null
        throw new Error(data.error)
      }

      const generated = data as AIOutput
      const nextNum = Math.max(0, ...sessionDecisions.map((decision) => decision.decisionNum)) + 1
      const id = crypto.randomUUID()
      const savedDecision: SessionDecision = {
        id,
        question: chosen,
        step: 6,
        status: "Pending",
        decisionNum: nextNum,
        situation,
        urgency,
        chosenDirection: chosen,
        reasoning,
        confidence,
        whatGivingUp,
        claritySummary: generated.claritySummary,
        executionTeam: generated.executionTeam,
        drafts: generated.drafts,
        copiedAudiences: [],
        analysis,
        readBack,
      }
      setDecisionNum(nextNum)
      setCurrentDecisionId(id)
      setSessionDecisions((previous) => [savedDecision, ...previous])
      setAiOutput(generated)
      setPreviousDrafts({})
      setAiStatus("ok")
      setIsGenerating(false)
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      setAiStatus("error")
      setAiError(err instanceof Error ? err.message : "Something went wrong on our end. Try again.")
      setAiErrorDetails(failureDetails)
      setIsGenerating(false)
      navigate("step5")
    }
  }

  useEffect(() => {
    if (!isGenerating) return
    const cancelTimer = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort()
      setAiError("This is taking too long. Try again.")
      setAiErrorCode("TIMEOUT")
      setIsGenerating(false)
      navigate("step5")
    }, 25000)
    return () => clearTimeout(cancelTimer)
  }, [isGenerating, navigate])

  const rewriteDraft = async (mode: "shorter" | "more_direct", audienceId: string) => {
    if (!aiOutput) return
    const sourceDraft = aiOutput.drafts.find((draft) => draft.audience === audienceId)
    if (!sourceDraft) return
    const instruction = mode === "more_direct" ? "more-direct" : "shorter"

    setRewriteError(undefined)
    setRewriteDiagnostics(null)
    setRewritingAudience(audienceId)
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: sourceDraft,
          context: { situation, urgency, chosenDirection, reasoning, confidence, whatGivingUp, claritySummary: aiOutput.claritySummary, affectedAudiences: readBack?.affected ?? "" },
          instruction,
        }),
      })
      const data = await response.json()
      if (!data.success) {
        setAiStatus("error")
        setRewriteDiagnostics(isAIDiagnostics(data.diagnostics) ? data.diagnostics : null)
        throw new Error(data.error ?? "The draft could not be rewritten.")
      }
      const rewritten = data.draft as AudienceDraft
      setPreviousDrafts((previous) => ({ ...previous, [audienceId]: sourceDraft }))
      const updatedDrafts = aiOutput.drafts.map((draft) => draft.audience === audienceId ? rewritten : draft)
      setAiOutput({ ...aiOutput, drafts: updatedDrafts })
      updateSavedDecision({ drafts: updatedDrafts })
      setAiStatus("ok")
    } catch (error) {
      setRewriteError(error instanceof Error ? error.message : "The draft could not be rewritten. Try again.")
    } finally {
      setRewritingAudience(null)
    }
  }

  const addAudienceDraft = async (audienceName: string) => {
    if (!aiOutput || !audienceName.trim()) return
    if (aiOutput.drafts.some((draft) => draft.audience.toLowerCase() === audienceName.trim().toLowerCase())) return

    setRewriteError(undefined)
    setRewriteDiagnostics(null)
    setAddingAudience(true)
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: { audience: audienceName.trim(), channel: "slack", subject: "", body: "" },
          context: { situation, urgency, chosenDirection, reasoning, confidence, whatGivingUp, claritySummary: aiOutput.claritySummary, affectedAudiences: readBack?.affected ?? "" },
          instruction: "add-audience",
          audience: audienceName.trim(),
        }),
      })
      const data = await response.json()
      if (!data.success) {
        setAiStatus("error")
        setRewriteDiagnostics(isAIDiagnostics(data.diagnostics) ? data.diagnostics : null)
        throw new Error(data.error ?? "Could not draft a message for that audience.")
      }
      const rewritten = data.draft as AudienceDraft
      const updatedDrafts = [...aiOutput.drafts, rewritten]
      setAiOutput({ ...aiOutput, drafts: updatedDrafts })
      updateSavedDecision({ drafts: updatedDrafts })
      setAiStatus("ok")
    } catch (error) {
      setRewriteError(error instanceof Error ? error.message : "Could not draft a message for that audience.")
    } finally {
      setAddingAudience(false)
    }
  }

  const updateDraft = (audience: string, updates: Partial<AudienceDraft>) => {
    if (!aiOutput) return
    const updatedDrafts = aiOutput.drafts.map((draft) => draft.audience === audience ? { ...draft, ...updates } : draft)
    setAiOutput({ ...aiOutput, drafts: updatedDrafts })
    updateSavedDecision({ drafts: updatedDrafts })
  }

  const undoDraft = (audience: string) => {
    const previous = previousDrafts[audience]
    if (!previous || !aiOutput) return
    const updatedDrafts = aiOutput.drafts.map((draft) => draft.audience === audience ? previous : draft)
    setAiOutput({ ...aiOutput, drafts: updatedDrafts })
    updateSavedDecision({ drafts: updatedDrafts })
    setPreviousDrafts((items) => {
      const next = { ...items }
      delete next[audience]
      return next
    })
  }

  const fileDecision = () => {
    if (!currentDecisionId) return
    const revisitDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    updateSavedDecision({ status: "Done", revisitDate, decidedAtMs: Date.now() })
    discardDraft()
    navigate("done")
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return
      if (view === "step1" && situation.trim() && !isAnalyzing) { event.preventDefault(); void handleAnalyze() }
      else if (view === "step2" && readBack) { event.preventDefault(); navigate("step3") }
      else if (view === "step3" && options.length >= 2) { event.preventDefault(); navigate("step4") }
      else if (view === "step4") { event.preventDefault(); navigate("step5") }
      else if (view === "step5" && selectedOptionId && reasoning.trim() && whatGivingUp.trim() && confidence && !isGenerating) {
        event.preventDefault()
        void handleGenerate()
      } else if (view === "step6" && currentDecisionId) { event.preventDefault(); fileDecision() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const openDecision = (decision: SessionDecision) => {
    setSituation(decision.situation)
    setChosenDirection(decision.chosenDirection)
    setReasoning(decision.reasoning)
    setWhatGivingUp(decision.whatGivingUp)
    setConfidence(decision.confidence)
    setDecisionNum(decision.decisionNum)
    setCurrentDecisionId(decision.id)
    setAiOutput({ claritySummary: decision.claritySummary, executionTeam: decision.executionTeam, drafts: decision.drafts })
    setAnalysis(decision.analysis)
    setReadBack(decision.readBack)
    setNoticed(decision.analysis?.iNoticed ?? "")
    setOptions(decision.analysis ? decision.analysis.options.map((option, index) => ({ id: `lumo-${index}`, label: option.name, summary: option.description, source: "lumo" as const })) : [])
    setSelectedOptionId(null)
    setCopiedAudiences(decision.copiedAudiences ?? [])
    setPreviousDrafts({})
    navigate("step6")
  }

  const pastDecisions: PastDecision[] = [...sessionDecisions]
    .sort((left, right) => right.decisionNum - left.decisionNum)
    .map((decision) => ({ id: decision.id, number: decision.decisionNum, title: decision.question, choice: decision.chosenDirection, confidence: decision.confidence, gaveUp: decision.whatGivingUp, revisitDate: decision.revisitDate }))

  const draftInProgress: DraftInProgress | null = draft
    ? { id: draft.id, number: draft.number, title: draft.situation.slice(0, 80), step: draft.step }
    : null

  const drafts: Draft[] = (aiOutput?.drafts ?? []).map((draft) => ({ id: draft.audience, audience: draft.audience, channel: draft.channel, subject: draft.subject, body: draft.body }))

  /* ─────────────────────────────────────────────────────────────── RENDER ─── */
  if (view === "home") {
    return (
      <HomeScreen
        aiStatus={aiStatus}
        initials="L"
        value={homeInput}
        onChange={setHomeInput}
        onStart={() => { setStartedAtMs(Date.now()); setSituation(homeInput); navigate("step1") }}
        decisions={pastDecisions}
        draft={draftInProgress}
        onResume={resumeDraft}
        onDiscardDraft={discardDraft}
        onOpenDecision={(id) => {
          const decision = sessionDecisions.find((item) => item.id === id)
          if (decision) openDecision(decision)
        }}
      />
    )
  }

  if (view === "step1") {
    return (
      <>
        <Step1Screen
          aiStatus={aiStatus}
          initials="L"
          decisionNumber={nextDecisionNumber}
          text={situation}
          onChange={setSituation}
          onSubmit={handleAnalyze}
          loading={isAnalyzing}
          error={aiError}
          direction={direction}
        />
        {SHOW_DEBUG_PANEL && aiError ? (
          <div style={{ maxWidth: 784, margin: "0 auto", padding: "0 32px 32px" }}>
            <AIDebugPanel diagnostics={aiErrorDetails} />
          </div>
        ) : null}
      </>
    )
  }

  if (view === "step2") {
    return (
      <Step2Screen
        aiStatus={aiStatus}
        initials="L"
        decisionNumber={nextDecisionNumber}
        loading={isAnalyzing}
        readBack={readBack}
        noticed={noticed}
        onEditField={(key, value) => setReadBack((previous) => previous ? { ...previous, [key]: value } : previous)}
        onNext={() => navigate("step3")}
        onBack={() => navigate("step1")}
        direction={direction}
        onJump={jumpTo}
      />
    )
  }

  if (view === "step3") {
    return (
      <Step3Screen
        aiStatus={aiStatus}
        initials="L"
        decisionNumber={nextDecisionNumber}
        options={options}
        onAddOption={addOption}
        onNext={() => navigate("step4")}
        onBack={() => navigate("step2")}
        direction={direction}
        onJump={jumpTo}
      />
    )
  }

  if (view === "step4") {
    return (
      <Step4Screen
        aiStatus={aiStatus}
        initials="L"
        decisionNumber={nextDecisionNumber}
        comparisons={comparisons}
        onNext={() => navigate("step5")}
        onBack={() => navigate("step3")}
        direction={direction}
        onJump={jumpTo}
      />
    )
  }

  if (view === "step5") {
    return (
      <>
        <Step5Screen
          aiStatus={aiStatus}
          initials="L"
          decisionNumber={nextDecisionNumber}
          options={options}
          selectedId={selectedOptionId}
          onSelect={setSelectedOptionId}
          why={reasoning}
          onWhy={setReasoning}
          gaveUp={whatGivingUp}
          onGaveUp={setWhatGivingUp}
          confidence={confidence}
          onConfidence={setConfidence}
          onCommit={() => { void handleGenerate() }}
          onBack={() => navigate("step4")}
          direction={direction}
          onJump={jumpTo}
        />
        {aiError ? (
          <div style={{ maxWidth: 784, margin: "16px auto 0", padding: "0 32px" }}>
            <p style={{ color: "var(--lm-risk)", fontSize: 14 }}>{aiError}</p>
            {SHOW_DEBUG_PANEL && <AIDebugPanel diagnostics={aiErrorDetails} />}
          </div>
        ) : null}
      </>
    )
  }

  if (view === "step6") {
    return (
      <>
        <Step6Screen
          aiStatus={aiStatus}
          initials="L"
          decisionNumber={decisionNum ?? nextDecisionNumber}
          drafts={drafts}
          loading={isGenerating}
          onEditDraft={(id, body) => updateDraft(id, { body })}
          onRewrite={(id, mode) => { void rewriteDraft(mode, id) }}
          rewritingId={rewritingAudience}
          onUndo={undoDraft}
          canUndo={(id) => Boolean(previousDrafts[id])}
          onAddAudience={(audience) => { void addAudienceDraft(audience) }}
          addingAudience={addingAudience}
          onFinish={fileDecision}
          onBack={() => navigate("step5")}
          error={rewriteError}
        />
        {SHOW_DEBUG_PANEL && rewriteDiagnostics ? (
          <div style={{ maxWidth: 784, margin: "0 auto", padding: "0 32px 32px" }}>
            <AIDebugPanel diagnostics={rewriteDiagnostics} />
          </div>
        ) : null}
      </>
    )
  }

  if (view === "done" && currentDecisionId) {
    return (
      <CompleteScreen
        aiStatus={aiStatus}
        initials="L"
        decisionNumber={decisionNum ?? nextDecisionNumber}
        call={chosenDirection}
        confidence={confidence}
        audiences={aiOutput?.drafts.map((draft) => draft.audience) ?? []}
        gaveUp={whatGivingUp}
        onHome={() => { resetDecision(); navigate("home") }}
        onReview={() => navigate("step6")}
      />
    )
  }

  return (
    <HomeScreen
      aiStatus={aiStatus}
      initials="L"
      value={homeInput}
      onChange={setHomeInput}
      onStart={() => { setSituation(homeInput); navigate("step1") }}
      decisions={pastDecisions}
      onOpenDecision={(id) => {
        const decision = sessionDecisions.find((item) => item.id === id)
        if (decision) openDecision(decision)
      }}
    />
  )
}
