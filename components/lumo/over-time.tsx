"use client"

import Link from "next/link"
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useInView, usePrefersReducedMotion } from "./ui"

const TYPED = "Yes, March 14 works"
const SQUARE_COUNT = 10
const SLIPPED = 7

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

const STEPS: Step[] = [
  {
    n: "1",
    eyebrow: "The pattern",
    headline: "Dates and deadlines are where your instinct is off.",
    support: "Seven of the ten date decisions you were most sure about turned out worse than you expected.",
    accent: true,
    art: "/illustrations/loop-pattern.svg",
    alt: "A cloud with three rain strokes",
  },
  {
    n: "2",
    eyebrow: "Why it happens",
    headline: "You are most confident right before a date slips.",
    support: "Your confidence peaks when the schedule is already under pressure. That is when it is least reliable.",
    art: "/illustrations/loop-why.svg",
    alt: "A calendar page with one date circled",
  },
  {
    n: "3",
    eyebrow: "The rule you set",
    headline: "Before you give a customer a date, add your engineering lead's worst case.",
    support: "Saved. Lumo raises this the next time a date comes up.",
    art: "/illustrations/loop-rule.svg",
    alt: "An index card with a checked box",
  },
  {
    n: "4",
    eyebrow: "Since then",
    headline: "Three of your last four date decisions landed.",
    support: "One still slipped. The record keeps counting either way.",
    art: "/illustrations/loop-since.svg",
    alt: "Four cards, three checked and one crossed",
  },
]

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
            <div className="lm-label">Weeks later</div>
            <h2 className="lm-h2">It shows up when you are about to do it again.</h2>
            <p className="lm-body-lg">
              A record you have to go and read is a record you forget. This one interrupts the next decision.
            </p>
          </div>
        </div>

        <div className="lm-ot-cols">
          <div className={`lm-ot-card lm-ot-decision ${leftIn ? "is-in" : ""}`}>
            <div className="lm-ot-eyebrow">DECISION No.41</div>
            <p className="lm-ot-q">Do we promise Northwind the API by March 14?</p>
            <div className="lm-ot-input">
              <span className="lm-sr">{TYPED}</span>
              <span aria-hidden="true">{armed ? TYPED.slice(0, chars) : TYPED}</span>
              <i className="lm-ot-caret" aria-hidden="true" />
            </div>
          </div>

          <div className={`lm-ot-card lm-ot-record ${rightIn ? "is-in" : ""}`}>
            <div className={`lm-ot-eyebrow is-up ${upIn ? "is-in" : ""}`}>You have been here before</div>
            <p className={`lm-ot-line ${lineIn ? "is-in" : ""}`}>Ten times you have been this sure about a date.</p>
            <div className="lm-ot-squares" aria-hidden="true">
              {Array.from({ length: SQUARE_COUNT }, (_, i) => (
                <span
                  key={i}
                  className={`lm-ot-square ${i < squaresShown ? "is-on" : ""} ${i < SLIPPED ? "is-slipped" : ""}`}
                />
              ))}
            </div>
            <p className={`lm-ot-slipped ${slippedIn ? "is-in" : ""}`}>Seven of them slipped.</p>
            <div className={`lm-ot-rule ${ruleIn ? "is-in" : ""}`}>
              <p>Your rule: add Marco&apos;s worst case before you give a date.</p>
            </div>
          </div>
        </div>

        <div className={`lm-ot-actions ${actionsIn ? "is-in" : ""}`}>
          <button type="button" className="lm-btn">
            Ask Marco first
          </button>
          <button type="button" className="lm-btn-sec">
            Commit anyway
          </button>
          <p className="lm-ot-note">Either way, Lumo records what you choose.</p>
        </div>
        {armed && !reduced ? (
          <button type="button" className="lm-ot-replay" onClick={replay}>
            Replay
          </button>
        ) : null}
        <p className={`lm-ot-recordlink ${actionsIn ? "is-in" : ""}`}>
          From 40 decisions in this record. <Link href="/app/demo#map">See the whole map</Link>
        </p>
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
  return (
    <div className="lm-wrap lm-section">
      <div className="lm-sec-head">
        <div className="lm-sec-copy">
          <div className="lm-label">How it learns</div>
          <h2 className="lm-h2">A pattern is only useful if it changes the next decision.</h2>
        </div>
      </div>
      <ol className="lm-ot-loop">
        {STEPS.map((s) => (
          <LoopStep key={s.n} step={s} />
        ))}
      </ol>
    </div>
  )
})
