"use client"

import Link from "next/link"
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useInView, usePrefersReducedMotion } from "./ui"
import { useDict, useLocaleHref } from "@/lib/i18n"

const SQUARE_COUNT = 10
const SLIPPED = 7

// The 40 outcomes in this record, in decision order. Mirrors lib/demo/decisions.ts
// so the strip below matches the judgment map it links to. Ten decisions per line.
const RECORD_OUTCOMES = (
  "better better worse as-expected as-expected better as-expected worse better better " +
  "as-expected better better as-expected better as-expected as-expected as-expected worse better " +
  "worse as-expected as-expected better better as-expected as-expected better worse better " +
  "worse better better worse as-expected worse worse as-expected better as-expected"
).split(" ") as Array<"better" | "as-expected" | "worse">

// useLayoutEffect during SSR warns and does nothing; fall back to useEffect.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

type Step = {
  n: string
  eyebrow: string
  headline: string
  support: string
  accent?: boolean
  art: string
  alt: string
}

// Locale-independent frame; the translatable text comes from the dictionary.
const STEP_META = [
  { n: "1", art: "/illustrations/loop-pattern.svg", accent: true },
  { n: "2", art: "/illustrations/loop-why.svg" },
  { n: "3", art: "/illustrations/loop-rule.svg" },
  { n: "4", art: "/illustrations/loop-since.svg" },
] as const

function LoopStep({ step }: { step: Step }) {
  const { ref, inView } = useInView<HTMLLIElement>()
  return (
    <li ref={ref} className="lm-ot-step">
      <div className="lm-ot-rail">
        <img
          src={step.art}
          alt={step.alt}
          width={56}
          height={56}
          className={`lm-ot-art ${inView ? "is-drawn" : ""}`}
        />
      </div>
      <div className="lm-ot-step-copy">
        <div className="lm-ot-step-eyebrow">
          {step.n} &middot; {step.eyebrow}
        </div>
        <h3 className="lm-ot-step-h">{step.headline}</h3>
        <p className={`lm-ot-step-p ${step.accent ? "is-accent" : ""}`}>{step.support}</p>
      </div>
    </li>
  )
}

export function OverTime() {
  const d = useDict()
  const t = d.overTime
  const lh = useLocaleHref()
  const TYPED = t.typed
  const reduced = usePrefersReducedMotion()
  const partRef = useRef<HTMLDivElement | null>(null)
  const timers = useRef<number[]>([])
  const runRef = useRef<() => void>(() => {})

  // Armed means JS is running and motion is allowed: elements start hidden
  // and the sequence reveals them. Unarmed (SSR, no JS, reduced motion) is
  // the finished state, so the section reads completely with no animation.
  const [armed, setArmed] = useState(false)
  const [leftIn, setLeftIn] = useState(false)
  const [rightIn, setRightIn] = useState(false)
  const [upIn, setUpIn] = useState(false)
  const [lineIn, setLineIn] = useState(false)
  const [squaresShown, setSquaresShown] = useState(0)
  const [slippedIn, setSlippedIn] = useState(false)
  const [ruleIn, setRuleIn] = useState(false)
  const [actionsIn, setActionsIn] = useState(false)
  const [chars, setChars] = useState(0)
  const [choice, setChoice] = useState<"ask" | "commit" | null>(null)

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }

  // The whole sequence runs on its own timing once triggered. Total 4.5s.
  const run = () => {
    clearTimers()
    setLeftIn(false)
    setRightIn(false)
    setUpIn(false)
    setLineIn(false)
    setSquaresShown(0)
    setSlippedIn(false)
    setRuleIn(false)
    setActionsIn(false)
    setChars(0)
    setChoice(null)
    const t = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms))
    }
    t(0, () => setLeftIn(true))
    // Typing: 350ms start, done at 1550ms. 20 chars over 1200ms.
    for (let i = 1; i <= TYPED.length; i++) t(350 + i * 60, () => setChars(i))
    t(1750, () => setRightIn(true))
    t(2000, () => setUpIn(true))
    t(2250, () => setLineIn(true))
    for (let i = 1; i <= SQUARE_COUNT; i++) t(2550 + (i - 1) * 90, () => setSquaresShown(i))
    t(3550, () => setSlippedIn(true))
    t(3900, () => setRuleIn(true))
    t(4300, () => setActionsIn(true))
  }
  runRef.current = run

  // Arm before the first paint so the hidden start state never flashes. The
  // media query is read directly: usePrefersReducedMotion only resolves in an
  // effect, which runs after this one, so it cannot be trusted here.
  useIsoLayoutEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setArmed(true)
  }, [])

  // One observer, threshold 0.4, disconnected on first fire: the sequence
  // plays exactly once per page load and never re-triggers on scroll-by.
  useEffect(() => {
    if (reduced) return
    const el = partRef.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      runRef.current()
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          obs.disconnect()
          runRef.current()
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [reduced])

  useEffect(() => clearTimers, [])

  const replay = () => {
    const el = partRef.current
    // Instant reset to the start state, then run the sequence again.
    el?.classList.add("is-resetting")
    clearTimers()
    setLeftIn(false)
    setRightIn(false)
    setUpIn(false)
    setLineIn(false)
    setSquaresShown(0)
    setSlippedIn(false)
    setRuleIn(false)
    setActionsIn(false)
    setChars(0)
    requestAnimationFrame(() => {
      el?.classList.remove("is-resetting")
      runRef.current()
    })
  }

  return (
    <>
      <div ref={partRef} className={`lm-wrap lm-section lm-ot ${armed && !reduced ? "is-armed" : ""}`}>
        <div className="lm-sec-head lm-ot-head">
          <div className="lm-sec-copy">
            <div className="lm-label">{t.label}</div>
            <h2 className="lm-h2">{t.title}</h2>
            <p className="lm-body-lg">
              {t.body}
            </p>
          </div>
        </div>

        <div className="lm-ot-cols">
          <div className={`lm-ot-card lm-ot-decision ${leftIn ? "is-in" : ""}`}>
            <div className="lm-ot-eyebrow">{t.decisionEyebrow}</div>
            <p className="lm-ot-q">{t.decisionQ}</p>
            <div className="lm-ot-input">
              <span className="lm-sr">{TYPED}</span>
              <span aria-hidden="true">{armed ? TYPED.slice(0, chars) : TYPED}</span>
              <i className="lm-ot-caret" aria-hidden="true" />
            </div>
          </div>

          <div className={`lm-ot-card lm-ot-record ${rightIn ? "is-in" : ""}`}>
            <div className={`lm-ot-eyebrow is-up ${upIn ? "is-in" : ""}`}>{t.beenHere}</div>
            <p className={`lm-ot-line ${lineIn ? "is-in" : ""}`}>{t.tenTimes}</p>
            <div className="lm-ot-squares" aria-hidden="true">
              {Array.from({ length: SQUARE_COUNT }, (_, i) => (
                <span
                  key={i}
                  className={`lm-ot-square ${i < squaresShown ? "is-on" : ""} ${i < SLIPPED ? "is-slipped" : ""}`}
                />
              ))}
            </div>
            <p className={`lm-ot-slipped ${slippedIn ? "is-in" : ""}`}>{t.sevenSlipped}</p>
            <div className={`lm-ot-rule ${ruleIn ? "is-in" : ""}`}>
              <p>{t.yourRule}</p>
            </div>
          </div>
        </div>

        <div className={`lm-ot-actions ${actionsIn ? "is-in" : ""}`}>
          <button
            type="button"
            className={`lm-btn ${choice === "ask" ? "is-chosen" : choice ? "is-dimmed" : ""}`}
            aria-pressed={choice === "ask"}
            onClick={() => setChoice("ask")}
          >
            {t.askFirst}
          </button>
          <button
            type="button"
            className={`lm-btn-sec ${choice === "commit" ? "is-chosen" : choice ? "is-dimmed" : ""}`}
            aria-pressed={choice === "commit"}
            onClick={() => setChoice("commit")}
          >
            {t.commitAnyway}
          </button>
          <p className="lm-ot-note" aria-live="polite">
            {choice === null
              ? t.noteEither
              : choice === "ask"
                ? t.noteAsk
                : t.noteCommit}
          </p>
        </div>
        {armed && !reduced ? (
          <button type="button" className="lm-ot-replay" onClick={replay}>
            {t.replay}
          </button>
        ) : null}
        <div className={`lm-ot-evidence ${actionsIn ? "is-in" : ""}`}>
          <div
            className="lm-ot-record-strip"
            role="img"
            aria-label={t.stripAria}
          >
            {RECORD_OUTCOMES.map((result, i) => (
              <span key={i} className={`lm-ot-tick is-${result}`} aria-hidden="true" />
            ))}
          </div>
          <p className="lm-ot-recordlink">
            {t.recordLinkPre}{" "}
            <Link href={lh("/app/demo") + "#map"}>{t.recordLinkCta}</Link>
          </p>
        </div>
      </div>

      <HowItLearns />
    </>
  )
}

/**
 * Held out of OverTime and memoized: the play-once sequence re-renders its
 * parent on every beat, and this block has no dependency on that state.
 */
const HowItLearns = memo(function HowItLearns() {
  const d = useDict()
  const t = d.overTime
  const steps = STEP_META.map((m, i) => ({ ...m, ...t.steps[i] }))
  return (
    <div className="lm-wrap lm-section">
      <div className="lm-sec-head">
        <div className="lm-sec-copy">
          <div className="lm-label">{t.learnLabel}</div>
          <h2 className="lm-h2">{t.learnTitle}</h2>
        </div>
      </div>
      <ol className="lm-ot-loop">
        {steps.map((s) => (
          <LoopStep key={s.n} step={s} />
        ))}
      </ol>
    </div>
  )
})
