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
  { id: "timing", label: "Timing", color: "#E26847" },
  { id: "scope", label: "Scope", color: "#C49144" },
  { id: "people", label: "People", color: "#4A7A5C" },
  { id: "hiring", label: "Hiring", color: "#7FA68C" },
  { id: "vendor", label: "Vendor", color: "#9C8563" },
  { id: "strategy", label: "Strategy", color: "#B06A4E" },
]
const KIND_COLOR: Record<DecisionKind, string> = Object.fromEntries(KINDS.map((k) => [k.id, k.color])) as Record<DecisionKind, string>

const W = 660
const H = 400
const PAD = { left: 64, right: 28, top: 28, bottom: 56 }
const ROWS: ResultRating[] = ["better", "as-expected", "worse"]
const ROW_LABEL: Record<ResultRating, string> = { better: "Better", "as-expected": "As expected", worse: "Worse" }

function xFor(conf: number) {
  const t = (Math.min(5, Math.max(1, conf)) - 1) / 4
  return PAD.left + t * (W - PAD.left - PAD.right)
}
function yFor(result: ResultRating) {
  const i = ROWS.indexOf(result)
  const t = i / (ROWS.length - 1)
  return PAD.top + t * (H - PAD.top - PAD.bottom)
}
/** Deterministic jitter so points at the same cell don't stack. */
function jitter(seed: number, spread: number) {
  const s = Math.sin(seed * 12.9898) * 43758.5453
  return (s - Math.floor(s) - 0.5) * spread
}

export function JudgmentMap({ points, autoReplay = false }: { points: MapPoint[]; autoReplay?: boolean }) {
  const reduced = usePrefersReducedMotion()
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
        <svg viewBox={`0 0 ${W} ${H}`} className="lm-map-svg" role="img" aria-label="Your decisions by confidence and how they turned out">
          {/* calibration band, bottom-left to top-right */}
          <defs>
            <linearGradient id="lm-band" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--lm-accent-soft)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--lm-accent-soft)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <polygon
            points={`${xFor(1)},${yFor("worse") + 34} ${xFor(2.2)},${yFor("worse") + 34} ${xFor(5)},${yFor("better") - 34} ${xFor(3.8)},${yFor("better") - 34}`}
            fill="url(#lm-band)"
          />
          <text x={xFor(1.4)} y={yFor("better") - 6} className="lm-map-zone">Underconfident</text>
          <text x={xFor(4.6)} y={yFor("worse") + 30} className="lm-map-zone" textAnchor="end">Overconfident</text>

          {/* y gridlines + labels */}
          {ROWS.map((r) => (
            <g key={r}>
              <line x1={PAD.left} y1={yFor(r)} x2={W - PAD.right} y2={yFor(r)} className="lm-map-grid" />
              <text x={PAD.left - 12} y={yFor(r) + 4} className="lm-map-axis" textAnchor="end">{ROW_LABEL[r]}</text>
            </g>
          ))}

          {/* x labels */}
          {[1, 2, 3, 4, 5].map((c) => (
            <text key={c} x={xFor(c)} y={H - PAD.bottom + 24} className="lm-map-axis" textAnchor="middle">{c}</text>
          ))}
          <text x={(PAD.left + W - PAD.right) / 2} y={H - 12} className="lm-map-axis" textAnchor="middle">Confidence at the time</text>

          {/* points */}
          {shown.map((p, i) => {
            const dimmed = activeKinds.size > 0 && !activeKinds.has(p.kind)
            const jx = jitter(p.number, 26)
            const jy = jitter(p.number * 3.1, 20)
            const cx = xFor(p.finalConfidence) + jx
            const cy = yFor(p.result) + jy
            const r = p.stakes === "one-way" ? 9 : 6
            const drift = p.gutConfidence !== p.finalConfidence
            const gx = xFor(p.gutConfidence) + jx
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
                {drift ? <line x1={gx} y1={cy} x2={cx} y2={cy} stroke={KIND_COLOR[p.kind]} strokeWidth={1} opacity={0.4} /> : null}
                <circle cx={cx} cy={cy} r={isSel ? r + 2 : r} fill={KIND_COLOR[p.kind]} opacity={isSel ? 1 : 0.82} />
              </g>
            )
          })}
        </svg>

        {selectedPoint ? (
          <div className="lm-map-card" role="status">
            <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>No.{selectedPoint.number}</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4, lineHeight: 1.35 }}>{selectedPoint.title}</div>
            <div className="lm-caption" style={{ marginTop: 8 }}>
              Gut said {shortCall(selectedPoint.gutCall)} at {selectedPoint.gutConfidence}. Chose {shortCall(selectedPoint.finalCall)} at {selectedPoint.finalConfidence}.
            </div>
            <div className="lm-caption" style={{ marginTop: 6, color: "var(--lm-text-2)" }}>
              Turned out {ROW_LABEL[selectedPoint.result].toLowerCase()}. {selectedPoint.outcome}
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
      </div>
    </div>
  )
}

function shortCall(s: string) {
  const t = s.trim()
  return t.length > 28 ? `${t.slice(0, 27)}\u2026` : t
}

export function EmptyJudgmentMap({ remaining }: { remaining: number }) {
  return (
    <div className="lm-map lm-map-empty">
      <div className="lm-map-frame" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 260 }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="lm-map-svg" aria-hidden="true">
          {ROWS.map((r) => (
            <g key={r}>
              <line x1={PAD.left} y1={yFor(r)} x2={W - PAD.right} y2={yFor(r)} className="lm-map-grid" />
              <text x={PAD.left - 12} y={yFor(r) + 4} className="lm-map-axis" textAnchor="end">{ROW_LABEL[r]}</text>
            </g>
          ))}
          {[1, 2, 3, 4, 5].map((c) => (
            <text key={c} x={xFor(c)} y={H - PAD.bottom + 24} className="lm-map-axis" textAnchor="middle">{c}</text>
          ))}
        </svg>
      </div>
      <p className="lm-caption" style={{ marginTop: 12, maxWidth: 420 }}>
        Your map fills in as you record how decisions turn out. {remaining > 0 ? `${remaining} more with an outcome and the patterns start to show.` : ""}
      </p>
    </div>
  )
}
