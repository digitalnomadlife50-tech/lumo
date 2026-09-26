"use client"

import { useMemo } from "react"
import type { DecisionKind, ResultRating, Stakes } from "@/lib/demo/types"

export type MapPoint = {
  number: number
  title: string
  kind: DecisionKind
  stakes: Stakes
  gutConfidence: number
  finalConfidence: number
  result: ResultRating
  gutCall: string
  finalCall: string
  outcome: string
  lesson: string
}

const ROW_LABEL: Record<DecisionKind, string> = {
  hiring: "Hiring",
  vendor: "Vendors",
  scope: "Scope cuts",
  people: "Team calls",
  strategy: "Strategy",
  timing: "Dates you promise",
}

/** Drives verb agreement in the generated headline, so it reads correctly whichever row lands last. */
const PLURAL: Record<DecisionKind, boolean> = {
  hiring: false,
  vendor: true,
  scope: true,
  people: true,
  strategy: false,
  timing: true,
}

const ORDER: DecisionKind[] = ["hiring", "vendor", "scope", "people", "strategy", "timing"]

const GREEN = "#4A7A5C"
const RED = "#A04A38"
const GRAY = "#8C8780"
const TRACK = "#F2EDE2"
const TICK = "#E5DECF"
const CENTER = 150
const HALF = 150
/** Within this many px of center there is no direction worth claiming, so the bar reads neutral. */
const NEUTRAL_BAND = 20

const ACTIONS: Record<DecisionKind, { eyebrow: string; rule: string; trigger: string }> = {
  timing: {
    eyebrow: "What to do about dates",
    rule: "Ask Marco for his worst case before you give anyone a date.",
    trigger: "Next time you put a date into Lumo, it stops you and asks whether you did.",
  },
  hiring: {
    eyebrow: "What to do about hiring",
    rule: "Have the person they will work with interview them first.",
    trigger: "Lumo raises this the next time you open a role.",
  },
  vendor: {
    eyebrow: "What to do about vendors",
    rule: "Get the exit terms in writing before you sign.",
    trigger: "Lumo raises this the next time you add a vendor.",
  },
  scope: {
    eyebrow: "What to do about scope cuts",
    rule: "Name what you are not shipping before you cut it.",
    trigger: "Lumo raises this the next time you cut scope.",
  },
  people: {
    eyebrow: "What to do about team calls",
    rule: "Ask the person affected before you decide for them.",
    trigger: "Lumo raises this the next time you make a team call.",
  },
  strategy: {
    eyebrow: "What to do about strategy",
    rule: "Write down what would change your mind before you commit.",
    trigger: "Lumo raises this the next time you commit to a strategy.",
  },
}

type Row = {
  kind: DecisionKind
  label: string
  plural: boolean
  n: number
  better: number
  asExpected: number
  worse: number
  /** (worse - better) / n, so -1 is every call better and +1 is every call worse. */
  net: number
  end: number
  color: string
  outcome: string
}

function outcomeText(kind: DecisionKind, worse: number, n: number) {
  if (worse === 0) return "None went worse"
  if (kind === "timing") return `${worse} of ${n} ran late`
  return `${worse} of ${n} went worse`
}

function buildRows(points: MapPoint[]): Row[] {
  return ORDER.map((kind) => {
    const set = points.filter((p) => p.kind === kind)
    const better = set.filter((p) => p.result === "better").length
    const asExpected = set.filter((p) => p.result === "as-expected").length
    const worse = set.filter((p) => p.result === "worse").length
    const n = set.length
    const net = n === 0 ? 0 : (worse - better) / n
    const end = CENTER + net * HALF
    const color = Math.abs(end - CENTER) < NEUTRAL_BAND ? GRAY : end < CENTER ? GREEN : RED
    return {
      kind,
      label: ROW_LABEL[kind],
      plural: PLURAL[kind],
      n,
      better,
      asExpected,
      worse,
      net,
      end,
      color,
      outcome: outcomeText(kind, worse, n),
    }
  })
    .filter((r) => r.n > 0)
    .sort((a, b) => a.net - b.net || b.n - a.n)
}

export function JudgmentMap({ points }: { points: MapPoint[] }) {
  const rows = useMemo(() => buildRows(points), [points])

  if (rows.length === 0) return null

  const strongest = rows[0]
  const weakest = rows[rows.length - 1]
  const headline =
    rows.length < 2
      ? "Your decisions, grouped by type."
      : `${strongest.label} went well. ${weakest.label} ${weakest.plural ? "are" : "is"} where you keep getting it wrong.`
  const action = ACTIONS[weakest.kind]

  return (
    <div className="lm-cal">
      <div className="lm-cal-head">
        <div className="lm-cal-label">The map</div>
        <h2 className="lm-cal-h2">{headline}</h2>
        <p className="lm-cal-intro">
          Your {points.length} decisions, grouped by type. The further a bar runs right, the more often that kind of
          decision turned out worse than you thought it would.
        </p>
      </div>

      <p className="lm-cal-legend">Left means better than you thought. Right means worse.</p>

      <div className="lm-cal-table">
        <div className="lm-cal-row is-head" aria-hidden="true">
          <div className="lm-cal-type">Type</div>
          <div className="lm-cal-head-bar">
            <span>Better than you thought</span>
            <span>Worse</span>
          </div>
          <div className="lm-cal-outcome">What happened</div>
        </div>

        {rows.map((row) => (
          <div key={row.kind} className="lm-cal-row">
            <div className="lm-cal-type">{row.label}</div>
            <div className="lm-cal-bar">
              <svg viewBox="0 0 300 22" preserveAspectRatio="none" aria-hidden="true">
                <rect x="0" y="8" width="300" height="6" fill={TRACK} />
                <rect x="149.5" y="4" width="1" height="14" fill={TICK} />
                <rect
                  x={Math.min(CENTER, row.end)}
                  y="8"
                  width={Math.abs(row.end - CENTER)}
                  height="6"
                  fill={row.color}
                />
              </svg>
              <span className="lm-cal-dot" style={{ left: `${(row.end / 300) * 100}%`, background: row.color }} />
            </div>
            <div className="lm-cal-outcome">{row.outcome}</div>
          </div>
        ))}
      </div>

      <div className="lm-cal-action">
        <img src="/illustrations/loop-rule.svg" alt="" width={34} height={34} className="lm-cal-action-art" />
        <div className="lm-cal-action-copy">
          <div className="lm-cal-action-eyebrow">{action.eyebrow}</div>
          <p className="lm-cal-action-rule">{action.rule}</p>
          <p className="lm-cal-action-trigger">{action.trigger}</p>
        </div>
      </div>
    </div>
  )
}
