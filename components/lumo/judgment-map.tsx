"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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

const ROWS: ResultRating[] = ["better", "as-expected", "worse"]
const ROW_LABEL: Record<ResultRating, string> = { better: "Better", "as-expected": "As expected", worse: "Worse" }

type Geo = { W: number; H: number; PAD: { left: number; right: number; top: number; bottom: number } }

/**
 * Two geometries. The narrow one keeps the axis labels at a readable size on a
 * phone: the SVG scales to its container, so a shorter viewBox means a larger
 * effective font. The left gutter is wide enough for "As expected" in both.
 */
const FULL: Geo = { W: 660, H: 400, PAD: { left: 96, right: 28, top: 34, bottom: 88 } }
const NARROW: Geo = { W: 420, H: 360, PAD: { left: 96, right: 16, top: 30, bottom: 80 } }

/** The zone label, the tick numbers, and the axis title each get their own row below the plot. */
const ZONE_LABEL_DY = 22
const TICK_DY = 46
const AXIS_TITLE_DY = 68

function xFor(conf: number, g: Geo) {
  const t = (Math.min(5, Math.max(1, conf)) - 1) / 4
  return g.PAD.left + t * (g.W - g.PAD.left - g.PAD.right)
}
function yFor(result: ResultRating, g: Geo) {
  const i = ROWS.indexOf(result)
  const t = i / (ROWS.length - 1)
  return g.PAD.top + t * (g.H - g.PAD.top - g.PAD.bottom)
}
/** Deterministic jitter so points at the same cell don't stack. */
function jitter(seed: number, spread: number) {
  const s = Math.sin(seed * 12.9898) * 43758.5453
  return (s - Math.floor(s) - 0.5) * spread
}

function useNarrowChart() {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 559px)")
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
  const g = narrow ? NARROW : FULL
  const [activeKinds, setActiveKinds] = useState<Set<DecisionKind>>(new Set())
  const [selected, setSelected] = useState<number | null>(null)
  const [visible, setVisible] = useState(points.length)
  const [playing, setPlaying] = useState(false)
  const raf = useRef<number | null>(null)

  const ordered = useMemo(() => [...points].sort((a, b) => a.number - b.number), [points])

  useEffect(() => {
    setVisible(points.length)
  }, [points.length])

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
      setVisible(ordered.length)
      return
    }
    setPlaying(true)
    setVisible(0)
    const start = performance.now()
    const duration = 8000
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setVisible(Math.round(t * ordered.length))
      if (t < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        setVisible(ordered.length)
        setPlaying(false)
      }
    }
    raf.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => stopReplay(), [])

  const toggleKind = (k: DecisionKind) => {
    setActiveKinds((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  const selectedPoint = selected != null ? ordered.find((p) => p.number === selected) ?? null : null
  const shown = ordered.slice(0, visible)
  const bandPad = (g.H - g.PAD.top - g.PAD.bottom) * 0.08

  return (
    <div className="lm-map">
      <div className="lm-map-chips" role="group" aria-label="Filter by kind">
        {KINDS.map((k) => {
          const on = activeKinds.size === 0 || activeKinds.has(k.id)
          return (
            <button
              key={k.id}
              type="button"
              className={`lm-map-chip ${activeKinds.has(k.id) ? "is-on" : ""}`}
              style={{ opacity: on ? 1 : 0.5 }}
              onClick={() => toggleKind(k.id)}
              aria-pressed={activeKinds.has(k.id)}
            >
              <i style={{ background: k.color }} aria-hidden="true" />
              {k.label}
            </button>
          )
        })}
      </div>

      <div className="lm-map-frame">
        <svg viewBox={`0 0 ${g.W} ${g.H}`} className="lm-map-svg" role="img" aria-label="Your decisions by confidence and how they turned out">
          {/* calibration band, bottom-left to top-right */}
          <defs>
            <linearGradient id="lm-band" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--lm-accent-soft)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--lm-accent-soft)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <polygon
            points={`${xFor(1, g)},${yFor("worse", g) + bandPad} ${xFor(2.2, g)},${yFor("worse", g) + bandPad} ${xFor(5, g)},${yFor("better", g) - bandPad} ${xFor(3.8, g)},${yFor("better", g) - bandPad}`}
            fill="url(#lm-band)"
          />
          <text x={xFor(1.4, g)} y={yFor("better", g) - 6} className="lm-map-zone">Underconfident</text>
          <text x={xFor(4.6, g)} y={yFor("worse", g) + ZONE_LABEL_DY} className="lm-map-zone" textAnchor="end">Overconfident</text>

          {/* y gridlines + labels. Labels sit in the left gutter, right-aligned, so they never overlap the plot. */}
          {ROWS.map((r) => (
            <g key={r}>
              <line x1={g.PAD.left} y1={yFor(r, g)} x2={g.W - g.PAD.right} y2={yFor(r, g)} className="lm-map-grid" />
              <text x={g.PAD.left - 10} y={yFor(r, g) + 5} className="lm-map-axis" textAnchor="end">{ROW_LABEL[r]}</text>
            </g>
          ))}

          {/* x labels */}
          {[1, 2, 3, 4, 5].map((c) => (
            <text key={c} x={xFor(c, g)} y={g.H - g.PAD.bottom + TICK_DY} className="lm-map-axis" textAnchor="middle">{c}</text>
          ))}
          <text x={(g.PAD.left + g.W - g.PAD.right) / 2} y={g.H - g.PAD.bottom + AXIS_TITLE_DY} className="lm-map-axis" textAnchor="middle">Confidence at the time</text>

          {/* points */}
          {shown.map((p, i) => {
            const dimmed = activeKinds.size > 0 && !activeKinds.has(p.kind)
            const jx = jitter(p.number, 26)
            const jy = jitter(p.number * 3.1, 20)
            const cx = xFor(p.finalConfidence, g) + jx
            const cy = yFor(p.result, g) + jy
            const r = p.stakes === "one-way" ? 9 : 6
            const isSel = selected === p.number
            return (
              <g
                key={p.number}
                className="lm-map-pt"
                style={{ opacity: dimmed ? 0.15 : 1, animationDelay: `${Math.min(i, 40) * 16}ms` }}
                onMouseEnter={() => setSelected(p.number)}
                onMouseLeave={() => setSelected((s) => (s === p.number ? null : s))}
                onClick={() => setSelected((s) => (s === p.number ? null : p.number))}
                tabIndex={0}
                role="button"
                aria-label={`No.${p.number}, ${p.title}`}
                onFocus={() => setSelected(p.number)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? r + 2 : r}
                  fill={KIND_COLOR[p.kind]}
                  opacity={isSel ? 1 : 0.92}
                  stroke="var(--lm-surface)"
                  strokeWidth={1.5}
                />
              </g>
            )
          })}

          {/* selected point overlay: drawn on top, with its first-instinct -> final drift so lines never stack */}
          {selectedPoint
            ? (() => {
                const jx = jitter(selectedPoint.number, 26)
                const jy = jitter(selectedPoint.number * 3.1, 20)
                const cy = yFor(selectedPoint.result, g) + jy
                const cx = xFor(selectedPoint.finalConfidence, g) + jx
                const gx = xFor(selectedPoint.gutConfidence, g) + jx
                const color = KIND_COLOR[selectedPoint.kind]
                const r = (selectedPoint.stakes === "one-way" ? 9 : 6) + 2
                const drift = selectedPoint.gutConfidence !== selectedPoint.finalConfidence
                return (
                  <g className="lm-map-drift" aria-hidden="true">
                    {drift ? (
                      <>
                        <line x1={gx} y1={cy} x2={cx} y2={cy} stroke={color} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.7} />
                        <circle cx={gx} cy={cy} r={5} fill="var(--lm-surface)" stroke={color} strokeWidth={1.5} />
                      </>
                    ) : null}
                    <circle cx={cx} cy={cy} r={r} fill={color} opacity={1} stroke="var(--lm-surface)" strokeWidth={1.5} />
                  </g>
                )
              })()
            : null}
        </svg>

        {selectedPoint ? (
          <div className="lm-map-card" role="status">
            <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>No.{selectedPoint.number}</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4, lineHeight: 1.35 }}>{selectedPoint.title}</div>
            <div className="lm-caption" style={{ marginTop: 8 }}>
              Your first instinct was {shortCall(selectedPoint.gutCall)} at {selectedPoint.gutConfidence} of 5. You chose {shortCall(selectedPoint.finalCall)} at {selectedPoint.finalConfidence} of 5.
            </div>
            <div className="lm-caption" style={{ marginTop: 6, color: "var(--lm-text-2)" }}>
              It turned out {ROW_LABEL[selectedPoint.result].toLowerCase()}. {selectedPoint.outcome}
            </div>
            {selectedPoint.lesson ? (
              <div className="lm-map-lesson">{selectedPoint.lesson}</div>
            ) : null}
          </div>
        ) : null}
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
              max={ordered.length}
              value={visible}
              aria-label="Decisions over time"
              onChange={(e) => {
                stopReplay()
                setVisible(Number(e.target.value))
              }}
            />
            <span className="lm-mono lm-caption" style={{ fontSize: 12, minWidth: 64, textAlign: "right" }}>
              {visible} of {ordered.length}
            </span>
          </>
        ) : (
          <span className="lm-mono lm-caption" style={{ fontSize: 12 }}>
            All {ordered.length} decisions shown.
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

export function EmptyJudgmentMap({ remaining }: { remaining: number }) {
  const narrow = useNarrowChart()
  const g = narrow ? NARROW : FULL
  return (
    <div className="lm-map lm-map-empty">
      <div className="lm-map-frame" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 260 }}>
        <svg viewBox={`0 0 ${g.W} ${g.H}`} className="lm-map-svg" aria-hidden="true">
          {ROWS.map((r) => (
            <g key={r}>
              <line x1={g.PAD.left} y1={yFor(r, g)} x2={g.W - g.PAD.right} y2={yFor(r, g)} className="lm-map-grid" />
              <text x={g.PAD.left - 10} y={yFor(r, g) + 5} className="lm-map-axis" textAnchor="end">{ROW_LABEL[r]}</text>
            </g>
          ))}
          {[1, 2, 3, 4, 5].map((c) => (
            <text key={c} x={xFor(c, g)} y={g.H - g.PAD.bottom + TICK_DY} className="lm-map-axis" textAnchor="middle">{c}</text>
          ))}
        </svg>
      </div>
      <p className="lm-caption" style={{ marginTop: 12, maxWidth: 420 }}>
        Your map fills in as you record how decisions turn out. {remaining > 0 ? `${remaining} more with an outcome and the patterns start to show.` : ""}
      </p>
    </div>
  )
}
