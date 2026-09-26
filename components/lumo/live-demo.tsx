"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { CURRENT_DECISION } from "@/lib/demo/current"
import { DEMO_DECISIONS } from "@/lib/demo/decisions"
import { usePrefersReducedMotion } from "./ui"
import { JudgmentMap, type MapPoint } from "./judgment-map"
import { ChevronLeft, ChevronRight, PenLine, Send, Telescope, TrendingUp, type LucideIcon } from "lucide-react"

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

const CH_DURATION = 8500

const PHASES: ReadonlyArray<{ name: string; desc: string; Icon: LucideIcon }> = [
  {
    name: "Before you decide",
    desc: "Write down your first instinct before you see anything.",
    Icon: PenLine,
  },
  {
    name: "While you decide",
    desc: "The research, the risks, and how each option plays out.",
    Icon: Telescope,
  },
  {
    name: "After you decide",
    desc: "One decision, a tailored update for each person or team.",
    Icon: Send,
  },
  {
    name: "Weeks later",
    desc: "Was the thinking sound, and did it work out? Lumo tracks both, because a good decision can still turn out badly.",
    Icon: TrendingUp,
  },
]

const CHAPTERS: ReadonlyArray<{ id: string; label: string; phase: number; hold?: number }> = [
  { id: "situation", label: "The situation", phase: 0 },
  { id: "instinct", label: "Your first instinct", phase: 0 },
  { id: "research", label: "The research", phase: 1 },
  { id: "gap", label: "Your instinct vs. the evidence", phase: 1, hold: 2 },
  { id: "forward", label: "How each option plays out", phase: 1 },
  { id: "memory", label: "A lesson from a past decision", phase: 1 },
  { id: "decision", label: "Your decision", phase: 2 },
  { id: "updates", label: "Updates for each team", phase: 2 },
  { id: "map", label: "Saved for review", phase: 3 },
] as const

const PEOPLE: Record<string, { name: string; role: string; avatar: string }> = {
  "Maya Chen": { name: "Maya Chen", role: "VP of Product", avatar: "/illustrations/avatar-maya.png" },
  "Marco Diaz": { name: "Marco Diaz", role: "Engineering lead", avatar: "/illustrations/avatar-marco.png" },
  "Dana Brooks": { name: "Dana Brooks", role: "Sales lead", avatar: "/illustrations/avatar-dana.png" },
  "Priya Shah": { name: "Priya Shah", role: "Support lead", avatar: "/illustrations/avatar-priya.png" },
}

function personFor(name: string) {
  if (PEOPLE[name]) return PEOPLE[name]
  const first = name.split(" ")[0]
  return Object.values(PEOPLE).find((p) => p.name.split(" ")[0] === first) ?? null
}

function parseSlackLine(line: string) {
  const match = /^([A-Z][a-z]+):\s*(.*)$/.exec(line)
  if (!match) return null
  const person = personFor(match[1])
  if (!person) return null
  return { person, text: match[2] }
}

export function LiveDemo() {
  const reduced = usePrefersReducedMotion()
  const d = CURRENT_DECISION
  const points = useMemo(() => demoMapPoints(), [])
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
    const dur = CH_DURATION * (CHAPTERS[chapter].hold ?? 1)
    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / dur)
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

  const dotsRef = useRef<HTMLDivElement>(null)

  const go = (i: number, opts?: { pause?: boolean; focus?: boolean }) => {
    const next = (i + CHAPTERS.length) % CHAPTERS.length
    setChapter(next)
    setProgress(0)
    startRef.current = performance.now()
    if (opts?.pause) setPlaying(false)
    if (opts?.focus) {
      const target = dotsRef.current?.children[next]
      if (target instanceof HTMLElement) target.focus()
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      go(chapter - 1, { focus: true })
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      go(chapter + 1, { focus: true })
    } else if (e.key === " " && !(e.target as HTMLElement).closest("button")) {
      e.preventDefault()
      setPlaying((p) => !p)
    }
  }

  const cur = CHAPTERS[chapter].id
  const phase = PHASES[CHAPTERS[chapter].phase]

  return (
    <div className="lm-demo">
      <div className="lm-demo-bar">
        <span className="lm-mono lm-caption" style={{ fontSize: 12 }}>lumo</span>
        <span className="lm-mono lm-caption" style={{ fontSize: 12 }}>Decision No.{d.number} · Sample data</span>
      </div>

      <div className="lm-demo-who">
        <img
          src="/illustrations/avatar-jordan.png"
          alt=""
          width={44}
          height={44}
          className="lm-demo-who-avatar"
        />
        <p>Jordan Ellis is a sample product manager. This is Jordan&apos;s 41st decision in Lumo.</p>
      </div>

      <div key={`ph-${CHAPTERS[chapter].phase}`} className="lm-demo-phase lm-fade-swap">
        <phase.Icon className="lm-demo-phase-icon" strokeWidth={1.5} aria-hidden="true" />
        <div className="lm-demo-phase-text">
          <span className="lm-demo-phase-name">{phase.name}</span>
          <span className="lm-demo-phase-desc">{phase.desc}</span>
        </div>
      </div>

      <div className="lm-demo-stage">
        <div key={cur} className="lm-fade-swap lm-demo-scene">
          {cur === "situation" && <SituationScene d={d} />}
          {cur === "instinct" && <InstinctScene d={d} />}
          {cur === "research" && <ResearchScene d={d} />}
          {cur === "gap" && <GapScene d={d} />}
          {cur === "forward" && <ForwardScene d={d} />}
          {cur === "memory" && <MemoryScene d={d} />}
          {cur === "decision" && <DecisionScene d={d} />}
          {cur === "updates" && <UpdatesScene d={d} />}
          {cur === "map" && (
            <div className="lm-demo-map">
              <div className="lm-label">Saved for review</div>
              <p className="lm-demo-lead">This decision joins 40 others. The map is where the patterns show.</p>
              <JudgmentMap points={points} autoReplay />
            </div>
          )}
        </div>
      </div>

      <div className="lm-demo-controls" onKeyDown={onKeyDown}>
        <div className="lm-demo-transport">
          <button type="button" className="lm-demo-step" onClick={() => go(chapter - 1)} aria-label="Previous chapter">
            <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button type="button" className="lm-demo-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" className="lm-demo-step" onClick={() => go(chapter + 1)} aria-label="Next chapter">
            <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <div className="lm-demo-dots" role="group" aria-label="Chapters" ref={dotsRef}>
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`lm-demo-dot ${i === chapter ? "is-on" : ""}`}
              onClick={() => go(i, { pause: true })}
              aria-current={i === chapter ? "true" : undefined}
              aria-label={`Chapter ${i + 1} of ${CHAPTERS.length}: ${c.label}`}
              data-label={c.label}
            >
              <span className="lm-demo-dot-fill" style={{ transform: `scaleX(${i < chapter ? 1 : i === chapter ? progress : 0})` }} />
            </button>
          ))}
        </div>
        <span className="lm-mono lm-caption lm-demo-chlabel" style={{ fontSize: 12 }} aria-live="polite">
          <span className="lm-demo-chpos">{chapter + 1} / {CHAPTERS.length}</span>{" "}
          {CHAPTERS[chapter].label}
        </span>
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
            {s.lines.map((l, i) => {
              const parsed = parseSlackLine(l)
              if (!parsed) return <p key={i}>{l}</p>
              return (
                <div key={i} className="lm-demo-slackline">
                  <img src={parsed.person.avatar} alt="" width={28} height={28} className="lm-demo-slackline-avatar" />
                  <div>
                    <div className="lm-demo-slackline-who">
                      <span>{parsed.person.name}</span>
                      <span className="lm-caption">{parsed.person.role}</span>
                    </div>
                    <p>{parsed.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function InstinctCard({ d, compact = false }: { d: D; compact?: boolean }) {
  const opt = d.options.find((o) => o.letter === d.gut.option)
  return (
    <div className={`lm-indexcard ${compact ? "is-compact" : ""}`}>
      <span className="lm-indexcard-rule" aria-hidden="true" />
      <div className="lm-indexcard-inner">
        <div className="lm-label">Leaning toward</div>
        <p className="lm-indexcard-opt">{opt?.label}</p>
        <div className="lm-indexcard-rows">
          <div>
            <span className="lm-caption">Confidence</span>
            <span className="lm-indexcard-val">{d.gut.confidence} of 5</span>
          </div>
          <div>
            <span className="lm-caption">What&apos;s nagging</span>
            <span className="lm-indexcard-val">{d.gut.worry}</span>
          </div>
        </div>
      </div>
      <div className="lm-indexcard-stamp">Tuesday, 9:40 pm</div>
    </div>
  )
}

function InstinctScene({ d }: { d: D }) {
  return (
    <div className="lm-demo-col">
      <div className="lm-label">Your first instinct</div>
      <p className="lm-demo-lead">Lumo asks first, so your instinct is written down before it shows you anything.</p>
      <InstinctCard d={d} />
    </div>
  )
}

function ResearchScene({ d }: { d: D }) {
  const rows = [
    ["Went and looked", d.findings.research],
    ["The outside view", d.findings.outsideView],
    ["Ran it forward and it failed", d.findings.premortem],
  ]
  return (
    <div className="lm-demo-col">
      <div className="lm-label">The research</div>
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
    <div className="lm-demo-col">
      <div className="lm-label">Your instinct vs. the evidence</div>
      <div className="lm-demo-gapwrap">
        <InstinctCard d={d} compact />
        <p className="lm-demo-gap">{d.gap}</p>
      </div>
    </div>
  )
}

function ForwardScene({ d }: { d: D }) {
  return (
    <div className="lm-demo-col">
      <div className="lm-label">How each option plays out</div>
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
      <div className="lm-label">A lesson from a past decision</div>
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
      <div className="lm-label">Your decision</div>
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

function UpdatesScene({ d }: { d: D }) {
  const [tab, setTab] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!auto) return
    const t = setInterval(() => setTab((x) => (x + 1) % d.drafts.length), 2200)
    return () => clearInterval(t)
  }, [auto, d.drafts.length])
  const draft = d.drafts[tab]
  const person = personFor(draft.audience)
  return (
    <div className="lm-demo-col">
      <div className="lm-label">One decision, {d.drafts.length} updates</div>
      <div className="lm-demo-tabs">
        {d.drafts.map((dr, i) => {
          const p = personFor(dr.audience)
          return (
            <button
              key={dr.audience}
              type="button"
              className={`lm-tab ${i === tab ? "is-on" : ""}`}
              onClick={() => {
                setAuto(false)
                setTab(i)
              }}
            >
              {p ? <img src={p.avatar} alt="" width={28} height={28} className="lm-tab-avatar" /> : null}
              <span className="lm-tab-text">
                <span className="lm-tab-name">{dr.audience}</span>
                <span className="lm-tab-role">{p ? p.role : "Customer"}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div key={tab} className="lm-fade-swap lm-demo-draft">
        <div className="lm-demo-draft-who">
          {person ? <img src={person.avatar} alt="" width={36} height={36} className="lm-demo-draft-avatar" /> : null}
          <div>
            <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>{draft.audience} / {draft.channel}</div>
            <div className="lm-caption">{person ? person.role : "Customer"}</div>
          </div>
        </div>
        <p>{draft.body}</p>
      </div>
    </div>
  )
}
