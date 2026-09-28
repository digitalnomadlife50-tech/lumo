"use client"

import { useMemo } from "react"
import type { DecisionKind, ResultRating, Stakes } from "@/lib/demo/types"
import { useDict } from "@/lib/i18n"
import { fill } from "@/lib/i18n/get-dictionary"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"

type MapDict = Dictionary["judgmentMap"]

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

function outcomeText(kind: DecisionKind, worse: number, n: number, t: MapDict) {
  if (worse === 0) return t.outcomes.none
  if (kind === "timing") return fill(t.outcomes.ranLate, { worse, n })
  return fill(t.outcomes.wentWorse, { worse, n })
}

function buildRows(points: MapPoint[], t: MapDict): Row[] {
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
      label: t.rowLabels[kind],
      plural: PLURAL[kind],
      n,
      better,
      asExpected,
      worse,
      net,
      end,
      color,
      outcome: outcomeText(kind, worse, n, t),
    }
  })
    .filter((r) => r.n > 0)
    .sort((a, b) => a.net - b.net || b.n - a.n)
}

export function JudgmentMap({ points }: { points: MapPoint[] }) {
  const t = useDict().judgmentMap
  const rows = useMemo(() => buildRows(points, t), [points, t])

  if (rows.length === 0) return null

  const strongest = rows[0]
  const weakest = rows[rows.length - 1]
  const headline =
    rows.length < 2
      ? t.headlineSingle
      : fill(t.headline, {
          strongest: strongest.label,
          weakest: weakest.label,
          verb: weakest.plural ? t.headlineVerb.plural : t.headlineVerb.singular,
        })
  const action = t.actions[weakest.kind]

  return (
    <div className="lm-cal">
      <div className="lm-cal-head">
        <div className="lm-cal-label">{t.label}</div>
        <h2 className="lm-cal-h2">{headline}</h2>
        <p className="lm-cal-intro">{fill(t.intro, { count: points.length })}</p>
      </div>

      <p className="lm-cal-legend">{t.legend}</p>

      <div className="lm-cal-table">
        <div className="lm-cal-row is-head" aria-hidden="true">
          <div className="lm-cal-type">{t.colType}</div>
          <div className="lm-cal-head-bar">
            <span>{t.colBetter}</span>
            <span>{t.colWorse}</span>
          </div>
          <div className="lm-cal-outcome">{t.colOutcome}</div>
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
