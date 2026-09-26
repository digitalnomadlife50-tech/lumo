"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import type { DecisionKind, ResultRating, Stakes } from "@/lib/demo/types"
import { usePrefersReducedMotion } from "./ui"

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

const KINDS: { id: DecisionKind; label: string; color: string }[] = [
  { id: "timing", label: "Dates and deadlines", color: "#E2683F" },
  { id: "scope", label: "Scope", color: "#E0A32E" },
  { id: "people", label: "People", color: "#3F9E6F" },
  { id: "hiring", label: "Hiring", color: "#3E86C8" },
  { id: "vendor", label: "Vendor", color: "#8E5BB0" },
  { id: "strategy", label: "Strategy", color: "#C0405E" },
]
const KIND_COLOR: Record<DecisionKind, string> = Object.fromEntries(KINDS.map((k) => [k.id, k.color])) as Record<DecisionKind, string>

const CONFS = [1, 2, 3, 4, 5]
const ROWS: ResultRating[] = ["better", "as-expected", "worse"]

/** Matches the wording the recent-call cards already use, so the map reads in the same voice. */
const ROW_LABEL: Record<ResultRating, string> = {
  better: "Better than expected",
  "as-expected": "As expected",
  worse: "Worse than expected",
}
const ROW_LABEL_SHORT: Record<ResultRating, string> = {
  better: "Better",
  "as-expected": "As expected",
  worse: "Worse",
}

function useNarrowChart() {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setNarrow(mq.matches)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return narrow
}

export function JudgmentMap({
  points,
  autoReplay = false,
  variant = "full",
}: {
  points: MapPoint[]
  autoReplay?: boolean
  variant?: "full" | "replay"
}) {
  const reduced = usePrefersReducedMotion()
  const narrow = useNarrowChart()
  const [activeKinds, setActiveKinds] = useState<Set<DecisionKind>>(new Set())
  const [selected, setSelected] = useState<number | null>(null)
  const [visible, setVisible] = useState(points.length)
  const [playing, setPlaying] = useState(false)
  const raf = useRef<number | null>(null)

  const ordered = useMemo(() => [...points].sort((a, b) => a.number - b.number), [points])
  const filtered = useMemo(
    () => (activeKinds.size === 0 ? ordered : ordered.filter((p) => activeKinds.has(p.kind))),
    [ordered, activeKinds],
  )

  useEffect(() => {
    setVisible(filtered.length)
  }, [filtered.length])

  useEffect(() => {
    if (!autoReplay || reduced || ordered.length === 0) return
    startReplay()
    return stopReplay
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoReplay, reduced, ordered.length])

  function stopReplay() {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = null
    setPlaying(false)
  }

  function startReplay() {
    stopReplay()
    if (reduced) {
      setVisible(filtered.length)
      return
    }
    setPlaying(true)
    setVisible(0)
    const start = performance.now()
    const duration = 8000
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setVisible(Math.round(t * filtered.length))
      if (t < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        setVisible(filtered.length)
        setPlaying(false)
      }
    }
    raf.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => stopReplay(), [])

  useEffect(() => {
    if (selected == null || activeKinds.size === 0) return
    const point = ordered.find((p) => p.number === selected)
    if (point && !activeKinds.has(point.kind)) setSelected(null)
  }, [activeKinds, ordered, selected])

  const toggleKind = (k: DecisionKind) => {
    setActiveKinds((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  const selectedPoint = selected != null ? ordered.find((p) => p.number === selected) ?? null : null

  const kindCounts = useMemo(() => {
    const counts = Object.fromEntries(KINDS.map((k) => [k.id, 0])) as Record<DecisionKind, number>
    for (const p of ordered) counts[p.kind] += 1
    return counts
  }, [ordered])

  /** One bucket per confidence level and outcome, so every decision keeps its own dot. */
  const cells = useMemo(() => {
    const m = new Map<string, MapPoint[]>()
    for (const p of filtered) {
      const c = Math.min(5, Math.max(1, p.finalConfidence))
      const key = `${c}|${p.result}`
      const list = m.get(key)
      if (list) list.push(p)
      else m.set(key, [p])
    }
    return m
  }, [filtered])

  /** Position in the replay order, so dots fade in without the grid reflowing. */
  const orderIndex = useMemo(() => {
    const m = new Map<number, number>()
    filtered.forEach((p, i) => m.set(p.number, i))
    return m
  }, [filtered])

  /** The pattern, read off the data rather than asserted. */
  const insight = useMemo(() => {
    const byConf = new Map<number, MapPoint[]>()
    for (const p of ordered) {
      const c = Math.min(5, Math.max(1, p.finalConfidence))
      const list = byConf.get(c)
      if (list) list.push(p)
      else byConf.set(c, [p])
    }
    const confs = [...byConf.keys()].sort((a, b) => a - b)
    if (confs.length === 0) return null
    const top = confs[confs.length - 1]
    const topPts = byConf.get(top) ?? []
    const topWorse = topPts.filter((p) => p.result === "worse").length
    const allWorse = topPts.length > 1 && topWorse === topPts.length

    // The level where things most often went better, for contrast against the top.
    let best: { conf: number; better: number; total: number; rate: number } | null = null
    for (const c of confs) {
      const pts = byConf.get(c) ?? []
      if (pts.length < 3) continue
      const better = pts.filter((p) => p.result === "better").length
      const rate = better / pts.length
      if (!best || rate > best.rate) best = { conf: c, better, total: pts.length, rate }
    }

    const headline = allWorse
      ? "The more sure you were, the worse it went."
      : "Your confidence and your outcomes do not line up."
    const parts: string[] = [
      allWorse
        ? `All ${topPts.length} calls at ${top} of 5 landed worse than expected.`
        : `${topWorse} of ${topPts.length} calls at ${top} of 5 landed worse than expected.`,
    ]
    if (best && best.rate > 0.5 && best.conf !== top) {
      parts.push(`At ${best.conf} of 5, ${best.better} of ${best.total} landed better.`)
    }
    return { headline, support: parts.join(" ") }
  }, [ordered])

  const filtering = activeKinds.size > 0
  const matching = filtered.length
  const rowLabel = narrow ? ROW_LABEL_SHORT : ROW_LABEL

  return (
    <div className="lm-map">
      <div className="lm-map-chips" role="group" aria-label="Filter decisions by kind">
        {KINDS.map((k) => {
          const on = activeKinds.has(k.id)
          return (
            <button
              key={k.id}
              type="button"
              className={`lm-map-chip ${on ? "is-on" : ""} ${filtering && !on ? "is-dim" : ""}`}
              onClick={() => toggleKind(k.id)}
              aria-pressed={on}
            >
              <i style={{ background: k.color }} aria-hidden="true" />
              {k.label}
              <span className="lm-map-chip-n">{kindCounts[k.id]}</span>
            </button>
          )
        })}
      </div>

      {filtering ? (
        <div className="lm-map-filter" role="status" aria-live="polite">
          <span className="lm-mono lm-caption" style={{ fontSize: 12 }}>
            Showing {matching} of {ordered.length} decisions
          </span>
          <button type="button" className="lm-map-clear" onClick={() => setActiveKinds(new Set())}>
            Show all
          </button>
        </div>
      ) : null}

      <div className="lm-map-frame">
        {insight ? (
          <div className="lm-map-insight">
            <p className="lm-map-insight-h">{insight.headline}</p>
            <p className="lm-map-insight-p">{insight.support}</p>
          </div>
        ) : null}

        <div
          className="lm-map-grid"
          role="group"
          aria-label="Decisions by how sure you were and how they turned out"
        >
          <div className="lm-map-corner" aria-hidden="true" />
          {CONFS.map((c) => (
            <div key={c} className="lm-map-colhead" aria-hidden="true">
              {c}
            </div>
          ))}

          {ROWS.map((r) => (
            <Fragment key={r}>
              <div className={`lm-map-rowlabel is-${r}`}>{rowLabel[r]}</div>
              {CONFS.map((c) => {
                const cell = cells.get(`${c}|${r}`) ?? []
                return (
                  <div key={c} className={`lm-map-cell is-${r}`}>
                    {cell.map((p) => {
                      const idx = orderIndex.get(p.number) ?? 0
                      const hidden = idx >= visible
                      const isSel = selected === p.number
                      return (
                        <button
                          key={p.number}
                          type="button"
                          className={`lm-map-dot ${p.stakes === "one-way" ? "is-oneway" : ""} ${
                            hidden ? "is-hidden" : ""
                          } ${isSel ? "is-sel" : ""}`}
                          style={{ background: KIND_COLOR[p.kind] }}
                          onClick={() => setSelected((s) => (s === p.number ? null : p.number))}
                          onFocus={() => setSelected(p.number)}
                          aria-pressed={isSel}
                          aria-label={`No.${p.number}, ${p.title}. ${ROW_LABEL[p.result]} at ${p.finalConfidence} of 5.`}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </Fragment>
          ))}

          <div className="lm-map-axis-title">How sure you were</div>
        </div>

        {selectedPoint ? (
          <div className="lm-map-card" role="status">
            <div className="lm-map-card-head">
              <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>
                No.{selectedPoint.number}
              </div>
              <div className="lm-map-card-title">{selectedPoint.title}</div>
            </div>
            <div className="lm-map-card-body">
              <p className="lm-caption">
                Your first instinct was {shortCall(selectedPoint.gutCall)} at {selectedPoint.gutConfidence} of 5. You
                chose {shortCall(selectedPoint.finalCall)} at {selectedPoint.finalConfidence} of 5.
              </p>
              <p className="lm-caption" style={{ color: "var(--lm-text-2)" }}>
                It turned out {ROW_LABEL[selectedPoint.result].toLowerCase()}. {selectedPoint.outcome}
              </p>
              {selectedPoint.lesson ? <div className="lm-map-lesson">{selectedPoint.lesson}</div> : null}
            </div>
          </div>
        ) : null}

        <p className="lm-sr">
          {ordered.length} decisions. {insight ? `${insight.headline} ${insight.support}` : ""}
        </p>
      </div>

      <div className="lm-map-controls">
        <button type="button" className="lm-map-play" onClick={() => (playing ? stopReplay() : startReplay())}>
          {playing ? "Pause" : "Replay"}
        </button>
        {variant === "full" ? (
          <>
            <input
              type="range"
              className="lm-map-slider"
              min={0}
              max={filtered.length}
              value={visible}
              aria-label="Decisions over time"
              onChange={(e) => {
                stopReplay()
                setVisible(Number(e.target.value))
              }}
            />
            <span className="lm-mono lm-caption" style={{ fontSize: 12, minWidth: 64, textAlign: "right" }}>
              {visible} of {filtered.length}
            </span>
          </>
        ) : (
          <span className="lm-mono lm-caption" style={{ fontSize: 12 }}>
            {filtering ? `${filtered.length} of ${ordered.length} decisions shown.` : `All ${ordered.length} decisions shown.`}
          </span>
        )}
      </div>
    </div>
  )
}

function shortCall(s: string) {
  const t = s.trim()
  return t.length > 28 ? `${t.slice(0, 27)}\u2026` : t
}
