export type DecisionKind = "timing" | "scope" | "hiring" | "people" | "vendor" | "strategy"

export type Stakes = "one-way" | "two-way"

/** Was the reasoning sound, knowing what you knew then. */
export type Soundness = "yes" | "partly" | "no"

/** How it turned out. */
export type ResultRating = "better" | "as-expected" | "worse"

export interface GutCall {
  option: string
  confidence: number
  worry: string
}

export interface FinalCall {
  option: string
  confidence: number
  why: string
  gaveUp: string
}

export interface Outcome {
  whatHappened: string
  reasoningSound: Soundness
  result: ResultRating
  lesson: string
}

export interface DemoDecision {
  number: number
  date: string
  title: string
  kind: DecisionKind
  stakes: Stakes
  options: string[]
  gut: GutCall
  final: FinalCall
  audiencesTold: string[]
  tripwire: string
  revisitDate: string
  /** Was support affected by this decision, whether or not they were told. */
  supportAffected: boolean
  outcome: Outcome
}

export interface Stakeholder {
  name: string
  role: string
  note: string
}

export interface ConnectedSource {
  id: string
  label: string
}

export interface DemoPersona {
  name: string
  role: string
  company: string
  companyNote: string
  monthsUsing: number
  stakeholders: Stakeholder[]
  sources: ConnectedSource[]
}

export interface AgentFindings {
  research: string
  outsideView: string
  premortem: string
  /** One column of dated beats per option, keyed by option label. */
  playItForward: { option: string; beats: string[] }[]
}

export interface ResurfacedItem {
  decisionNumber: number
  title: string
  outcome: string
  lesson: string
  ifThen: string
}

export interface CurrentDraft {
  audience: string
  channel: "slack" | "email" | "dm"
  body: string
  pushback: { objection: string; response: string }
}

export interface CurrentDecision {
  number: number
  question: string
  kind: DecisionKind
  sources: { id: string; label: string; lines: string[] }[]
  options: { letter: string; label: string; summary: string; source: "user" | "lumo" }[]
  gut: GutCall
  findings: AgentFindings
  gap: string
  resurfaced: ResurfacedItem
  final: FinalCall
  tripwire: string
  revisitDate: string
  drafts: CurrentDraft[]
}

export interface IfThenPlan {
  id: string
  cueKind: DecisionKind
  cueKeywords: string[]
  text: string
}

export interface MonthlyBrief {
  month: string
  strongAt: string
  runsOff: string
  ifThen: string
  didntNotice: string
}
