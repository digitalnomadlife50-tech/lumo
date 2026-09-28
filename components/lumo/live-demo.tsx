"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import type { CurrentDecision, DemoDecision } from "@/lib/demo/types"
import { usePrefersReducedMotion } from "./ui"
import { JudgmentMap, type MapPoint } from "./judgment-map"
import { ChevronLeft, ChevronRight, PenLine, Send, Telescope, TrendingUp, type LucideIcon } from "lucide-react"
import { useDemoData, useDict } from "@/lib/i18n"
import { fill } from "@/lib/i18n/get-dictionary"

export function demoMapPoints(decisions: DemoDecision[]): MapPoint[] {
  return decisions.filter((d) => d.outcome).map((d) => ({
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

const PHASE_ICONS: LucideIcon[] = [PenLine, Telescope, Send, TrendingUp]

const CHAPTER_META: ReadonlyArray<{ id: string; phase: number; hold?: number }> = [
  { id: "situation", phase: 0 },
  { id: "instinct", phase: 0 },
  { id: "research", phase: 1 },
  { id: "gap", phase: 1, hold: 2 },
  { id: "forward", phase: 1 },
  { id: "memory", phase: 1 },
  { id: "decision", phase: 2 },
  { id: "updates", phase: 2 },
  { id: "map", phase: 3 },
] as const

type RoleKey = "maya" | "marco" | "dana" | "priya"
const PEOPLE: Record<string, { name: string; roleKey: RoleKey; avatar: string }> = {
  "Maya Chen": { name: "Maya Chen", roleKey: "maya", avatar: "/illustrations/avatar-maya.png" },
  "Marco Diaz": { name: "Marco Diaz", roleKey: "marco", avatar: "/illustrations/avatar-marco.png" },
  "Dana Brooks": { name: "Dana Brooks", roleKey: "dana", avatar: "/illustrations/avatar-dana.png" },
  "Priya Shah": { name: "Priya Shah", roleKey: "priya", avatar: "/illustrations/avatar-priya.png" },
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
  const dict = useDict()
  const t = dict.liveDemo
  const chapters = CHAPTER_META.map((m, i) => ({ ...m, label: t.chapters[i] }))
  const { current: d, decisions } = useDemoData()
  const points = useMemo(() => demoMapPoints(decisions), [decisions])
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
    const dur = CH_DURATION * (chapters[chapter].hold ?? 1)
    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / dur)
      setProgress(t)
      if (t >= 1) {
        setChapter((c) => (c + 1) % chapters.length)
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
    const next = (i + chapters.length) % chapters.length
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
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      const dots = dotsRef.current
      const focused = document.activeElement
      const focusedIndex =
        dots && focused instanceof HTMLElement ? Array.prototype.indexOf.call(dots.children, focused) : -1
      const base = focusedIndex >= 0 ? focusedIndex : chapter
      go(base + (e.key === "ArrowRight" ? 1 : -1), { pause: true, focus: true })
    } else if (e.key === " " && !(e.target as HTMLElement).closest("button")) {
      e.preventDefault()
      setPlaying((p) => !p)
    }
  }

  const cur = chapters[chapter].id
  const phaseIndex = chapters[chapter].phase
  const phase = { ...t.phases[phaseIndex], Icon: PHASE_ICONS[phaseIndex] }

  return (
    <div className="lm-demo">
      <div className="lm-demo-bar">
        <span className="lm-mono lm-caption" style={{ fontSize: 12 }}>lumo</span>
        <span className="lm-mono lm-caption" style={{ fontSize: 12 }}>{fill(t.decisionNo, { number: d.number })} · {t.sampleData}</span>
      </div>

      <div className="lm-demo-who">
        <img
          src="/illustrations/avatar-jordan.png"
          alt=""
          width={44}
          height={44}
          className="lm-demo-who-avatar"
        />
        <p>{t.whoLine}</p>
      </div>

      <div key={`ph-${phaseIndex}`} className="lm-demo-phase lm-fade-swap">
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
              <div className="lm-label">{t.mapLabel}</div>
              <p className="lm-demo-lead">{t.mapLead}</p>
              <JudgmentMap points={points} />
            </div>
          )}
        </div>
      </div>

      <div className="lm-demo-controls" onKeyDown={onKeyDown}>
        <div className="lm-demo-transport">
          <button type="button" className="lm-demo-step" onClick={() => go(chapter - 1, { pause: true })} aria-label={t.prevChapter}>
            <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button type="button" className="lm-demo-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t.pause : t.play}>
            {playing ? t.pause : t.play}
          </button>
          <button type="button" className="lm-demo-step" onClick={() => go(chapter + 1, { pause: true })} aria-label={t.nextChapter}>
            <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <div className="lm-demo-dots" role="group" aria-label={t.chaptersAria} ref={dotsRef}>
          {chapters.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`lm-demo-dot ${i === chapter ? "is-on" : ""}`}
              onClick={() => go(i, { pause: true })}
              aria-current={i === chapter ? "true" : undefined}
              aria-label={fill(t.chapterOf, { current: i + 1, total: chapters.length, label: c.label })}
              data-label={c.label}
            >
              <span className="lm-demo-dot-fill" style={{ transform: `scaleX(${i < chapter ? 1 : i === chapter ? progress : 0})` }} />
            </button>
          ))}
        </div>
        <span className="lm-mono lm-caption lm-demo-chlabel" style={{ fontSize: 12 }} aria-live="polite">
          <span className="lm-demo-chpos">{chapter + 1} / {chapters.length}</span>{" "}
          {chapters[chapter].label}
        </span>
      </div>
    </div>
  )
}

type D = CurrentDecision

function SituationScene({ d }: { d: D }) {
  const dict = useDict()
  const t = dict.liveDemo
  return (
    <div className="lm-demo-col">
      <div className="lm-label">{t.scenes.situation}</div>
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
                      <span className="lm-caption">{t.roles[parsed.person.roleKey]}</span>
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
  const dict = useDict()
  const t = dict.liveDemo.card
  const opt = d.options.find((o) => o.letter === d.gut.option)
  return (
    <div className={`lm-indexcard ${compact ? "is-compact" : ""}`}>
      <span className="lm-indexcard-rule" aria-hidden="true" />
      <div className="lm-indexcard-inner">
        <div className="lm-label">{t.leaningToward}</div>
        <p className="lm-indexcard-opt">{opt?.label}</p>
        <div className="lm-indexcard-rows">
          <div>
            <span className="lm-caption">{dict.common.confidence}</span>
            <span className="lm-indexcard-val">{d.gut.confidence} {dict.common.of5}</span>
          </div>
          <div>
            <span className="lm-caption">{t.whatsNagging}</span>
            <span className="lm-indexcard-val">{d.gut.worry}</span>
          </div>
        </div>
      </div>
      <div className="lm-indexcard-stamp">{t.stamp}</div>
    </div>
  )
}

function InstinctScene({ d }: { d: D }) {
  const t = useDict().liveDemo
  return (
    <div className="lm-demo-col">
      <div className="lm-label">{t.scenes.instinct}</div>
      <p className="lm-demo-lead">{t.scenes.instinctLead}</p>
      <InstinctCard d={d} />
    </div>
  )
}

function ResearchScene({ d }: { d: D }) {
  const t = useDict().liveDemo
  const rows = [
    [t.research.wentAndLooked, d.findings.research],
    [t.research.outsideView, d.findings.outsideView],
    [t.research.premortem, d.findings.premortem],
  ]
  return (
    <div className="lm-demo-col">
      <div className="lm-label">{t.scenes.research}</div>
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
  const t = useDict().liveDemo
  return (
    <div className="lm-demo-col">
      <div className="lm-label">{t.scenes.gap}</div>
      <div className="lm-demo-gapwrap">
        <InstinctCard d={d} compact />
        <p className="lm-demo-gap">{d.gap}</p>
      </div>
    </div>
  )
}

function ForwardScene({ d }: { d: D }) {
  const t = useDict().liveDemo
  return (
    <div className="lm-demo-col">
      <div className="lm-label">{t.scenes.forward}</div>
      <div className="lm-demo-forward">
        {d.findings.playItForward.map((col) => {
          const opt = d.options.find((o) => o.letter === col.option)
          const chosen = col.option === d.final.option
          return (
            <div key={col.option} className={`lm-demo-track ${chosen ? "is-chosen" : ""}`}>
              <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>{fill(t.forward.path, { option: col.option })}{chosen ? t.forward.chosen : ""}</div>
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
  const t = useDict().liveDemo
  const r = d.resurfaced
  return (
    <div className="lm-demo-col lm-demo-center">
      <div className="lm-label">{t.scenes.memory}</div>
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
  const dict = useDict()
  const t = dict.liveDemo
  const opt = d.options.find((o) => o.letter === d.final.option)
  return (
    <div className="lm-demo-col">
      <div className="lm-label">{t.scenes.decision}</div>
      <div className="lm-demo-decision">
        <div className="lm-demo-decision-opt">{opt?.label}</div>
        <p className="lm-demo-lead">{d.final.why}</p>
        <div className="lm-demo-decision-meta">
          <div><div className="lm-caption">{dict.common.confidence}</div><div>{d.final.confidence}/5</div></div>
          <div><div className="lm-caption">{t.decisionMeta.givingUp}</div><div>{d.final.gaveUp}</div></div>
          <div><div className="lm-caption">{t.decisionMeta.revisit}</div><div>{d.tripwire}</div></div>
        </div>
      </div>
    </div>
  )
}

function UpdatesScene({ d }: { d: D }) {
  const dict = useDict()
  const t = dict.liveDemo
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
      <div className="lm-label">{fill(t.scenes.updates, { count: d.drafts.length })}</div>
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
                <span className="lm-tab-role">{p ? t.roles[p.roleKey] : t.customerRole}</span>
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
            <div className="lm-caption">{person ? t.roles[person.roleKey] : t.customerRole}</div>
          </div>
        </div>
        <p>{draft.body}</p>
      </div>
    </div>
  )
}
