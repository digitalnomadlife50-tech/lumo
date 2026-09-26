"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CURRENT_DECISION } from "@/lib/demo/current"
import { DEMO_DECISIONS } from "@/lib/demo/decisions"
import { usePrefersReducedMotion } from "./ui"
import { JudgmentMap, type MapPoint } from "./judgment-map"

export function demoMapPoints(): MapPoint[] {
  return DEMO_DECISIONS.filter((d) => d.outcome).map((d) => ({
    number: d.number,
    title: d.title,
    kind: d.kind,
    stakes: d.stakes,
    gutConfidence: d.gut.confidence,
    finalConfidence: d.final.confidence,
    result: d.outcome.result,
    gutCall: d.gut.option,
    finalCall: d.final.option,
    outcome: d.outcome.whatHappened,
    lesson: d.outcome.lesson,
  }))
}

const CH_DURATION = 9500

const CHAPTERS = [
  { id: "situation", label: "The situation" },
  { id: "gut", label: "The gut call" },
  { id: "agents", label: "The work" },
  { id: "gap", label: "The gap" },
  { id: "forward", label: "Play it forward" },
  { id: "memory", label: "Brought back" },
  { id: "decision", label: "The call" },
  { id: "drafts", label: "The messages" },
  { id: "map", label: "On the record" },
] as const

export function LiveDemo() {
  const reduced = usePrefersReducedMotion()
  const d = CURRENT_DECISION
  const points = useMemo(demoMapPoints, [])
  const [chapter, setChapter] = useState(0)
  const [playing, setPlaying] = useState(!reduced)
  const [progress, setProgress] = useState(0)
  const raf = useRef<number | null>(null)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  useEffect(() => {
    if (!playing) return
    startRef.current = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / CH_DURATION)
      setProgress(t)
      if (t >= 1) {
        setChapter((c) => (c + 1) % CHAPTERS.length)
        setProgress(0)
        startRef.current = performance.now()
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [playing, chapter])

  const go = (i: number) => {
    setChapter((i + CHAPTERS.length) % CHAPTERS.length)
    setProgress(0)
    startRef.current = performance.now()
  }

  const cur = CHAPTERS[chapter].id

  return (
    <div className="lm-demo">
      <div className="lm-demo-bar">
        <span className="lm-mono lm-caption" style={{ fontSize: 12 }}>lumo / No.{d.number}, replaying</span>
        <span className="lm-mono lm-caption" style={{ fontSize: 12 }}>no API calls, this one already happened</span>
      </div>

      <div className="lm-demo-stage" aria-live="polite">
        <div key={cur} className="lm-fade-swap lm-demo-scene">
          {cur === "situation" && <SituationScene d={d} />}
          {cur === "gut" && <GutScene d={d} />}
          {cur === "agents" && <AgentsScene d={d} />}
          {cur === "gap" && <GapScene d={d} />}
          {cur === "forward" && <ForwardScene d={d} />}
          {cur === "memory" && <MemoryScene d={d} />}
          {cur === "decision" && <DecisionScene d={d} />}
          {cur === "drafts" && <DraftsScene d={d} />}
          {cur === "map" && (
            <div className="lm-demo-map">
              <div className="lm-label">On the record</div>
              <p className="lm-demo-lead">This call joins 40 others. The map is where the patterns show.</p>
              <JudgmentMap points={points} autoReplay />
            </div>
          )}
        </div>
      </div>

      <div className="lm-demo-controls">
        <button type="button" className="lm-demo-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "Pause" : "Play"}
        </button>
        <div className="lm-demo-dots" role="tablist" aria-label="Chapters">
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === chapter}
              className={`lm-demo-dot ${i === chapter ? "is-on" : ""}`}
              onClick={() => go(i)}
              title={c.label}
            >
              <span className="lm-demo-dot-fill" style={{ transform: `scaleX(${i < chapter ? 1 : i === chapter ? progress : 0})` }} />
              <span className="sr-only">{c.label}</span>
            </button>
          ))}
        </div>
        <span className="lm-mono lm-caption lm-demo-chlabel" style={{ fontSize: 12 }}>{CHAPTERS[chapter].label}</span>
      </div>
    </div>
  )
}

type D = typeof CURRENT_DECISION

function SituationScene({ d }: { d: D }) {
  return (
    <div className="lm-demo-col">
      <div className="lm-label">What&apos;s happening</div>
      <h3 className="lm-demo-q">{d.question}</h3>
      <div className="lm-demo-sources">
        {d.sources.map((s) => (
          <div key={s.id} className="lm-demo-source">
            <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>{s.label}</div>
            {s.lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function GutScene({ d }: { d: D }) {
  const opt = d.options.find((o) => o.letter === d.gut.option)
  return (
    <div className="lm-demo-col">
      <div className="lm-label">Before the work, your gut</div>
      <p className="lm-demo-lead">Lumo asks first, so your instinct is on record before it shows you anything.</p>
      <div className="lm-demo-gut">
        <div>
          <div className="lm-caption">Leaning toward</div>
          <div className="lm-demo-gut-opt">{opt?.label}</div>
        </div>
        <div className="lm-demo-gut-meta">
          <div>
            <div className="lm-caption">Confidence</div>
            <div className="lm-demo-conf">{"\u25CF".repeat(d.gut.confidence)}<span>{"\u25CB".repeat(5 - d.gut.confidence)}</span> {d.gut.confidence}/5</div>
          </div>
          <div>
            <div className="lm-caption">What&apos;s nagging</div>
            <div style={{ fontSize: 15 }}>{d.gut.worry}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentsScene({ d }: { d: D }) {
  const rows = [
    ["Went and looked", d.findings.research],
    ["The outside view", d.findings.outsideView],
    ["Ran it forward and it failed", d.findings.premortem],
  ]
  return (
    <div className="lm-demo-col">
      <div className="lm-label">While you waited, Lumo worked</div>
      <div className="lm-demo-agents">
        {rows.map(([t, b], i) => (
          <div key={i} className="lm-demo-agent" style={{ animationDelay: `${i * 160}ms` }}>
            <div className="lm-caption">{t}</div>
            <p>{b}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function GapScene({ d }: { d: D }) {
  return (
    <div className="lm-demo-col lm-demo-center">
      <div className="lm-label">The gap</div>
      <p className="lm-demo-gap">{d.gap}</p>
    </div>
  )
}

function ForwardScene({ d }: { d: D }) {
  return (
    <div className="lm-demo-col">
      <div className="lm-label">Play each path forward</div>
      <div className="lm-demo-forward">
        {d.findings.playItForward.map((col) => {
          const opt = d.options.find((o) => o.letter === col.option)
          const chosen = col.option === d.final.option
          return (
            <div key={col.option} className={`lm-demo-track ${chosen ? "is-chosen" : ""}`}>
              <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>Path {col.option}{chosen ? ", chosen" : ""}</div>
              <div className="lm-demo-track-name">{opt?.label}</div>
              <ul>
                {col.beats.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MemoryScene({ d }: { d: D }) {
  const r = d.resurfaced
  return (
    <div className="lm-demo-col lm-demo-center">
      <div className="lm-label">Lumo brought one back</div>
      <div className="lm-demo-memory">
        <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>No.{r.decisionNumber}</div>
        <div className="lm-demo-memory-title">{r.title}</div>
        <p className="lm-demo-memory-out">{r.outcome}</p>
        <div className="lm-demo-memory-lesson">{r.lesson}</div>
        <div className="lm-demo-memory-ifthen">{r.ifThen}</div>
      </div>
    </div>
  )
}

function DecisionScene({ d }: { d: D }) {
  const opt = d.options.find((o) => o.letter === d.final.option)
  return (
    <div className="lm-demo-col">
      <div className="lm-label">The call</div>
      <div className="lm-demo-decision">
        <div className="lm-demo-decision-opt">{opt?.label}</div>
        <p className="lm-demo-lead">{d.final.why}</p>
        <div className="lm-demo-decision-meta">
          <div><div className="lm-caption">Confidence</div><div>{d.final.confidence}/5</div></div>
          <div><div className="lm-caption">Giving up</div><div>{d.final.gaveUp}</div></div>
          <div><div className="lm-caption">Revisit</div><div>{d.tripwire}</div></div>
        </div>
      </div>
    </div>
  )
}

function DraftsScene({ d }: { d: D }) {
  const [tab, setTab] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTab((x) => (x + 1) % d.drafts.length), 2200)
    return () => clearInterval(t)
  }, [d.drafts.length])
  const draft = d.drafts[tab]
  return (
    <div className="lm-demo-col">
      <div className="lm-label">One call, {d.drafts.length} messages</div>
      <div className="lm-demo-tabs">
        {d.drafts.map((dr, i) => (
          <button key={dr.audience} type="button" className={`lm-tab ${i === tab ? "is-on" : ""}`} onClick={() => setTab(i)}>
            {dr.audience}
          </button>
        ))}
      </div>
      <div key={tab} className="lm-fade-swap lm-demo-draft">
        <div className="lm-mono lm-caption" style={{ fontSize: 12, marginBottom: 10 }}>{draft.audience} / {draft.channel}</div>
        <p>{draft.body}</p>
      </div>
    </div>
  )
}
