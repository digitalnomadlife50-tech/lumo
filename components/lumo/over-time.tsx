"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useInView, usePrefersReducedMotion } from "./ui"

const TYPED = "Yes, March 14 works"
const SQUARE_COUNT = 10
const SLIPPED = 7

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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (reduced) return
    const container = containerRef.current
    if (!container) return

    let raf = 0
    let active = false
    let total = 0
    let last = -1

    const measure = () => {
      total = container.offsetHeight - window.innerHeight
    }

    const read = () => {
      const rect = container.getBoundingClientRect()
      return total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!active) return
      const p = read()
      if (Math.abs(p - last) < 0.001) return
      last = p
      setProgress(p)
    }

    measure()
    const initial = read()
    last = initial
    setProgress(initial)

    const obs =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              active = entries.some((e) => e.isIntersecting)
            },
            { rootMargin: "300px 0px 300px 0px" }
          )
    if (obs) obs.observe(container)
    else active = true

    const onResize = () => {
      measure()
      last = -1
    }
    window.addEventListener("resize", onResize)

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      obs?.disconnect()
      window.removeEventListener("resize", onResize)
    }
  }, [reduced])

  const p = reduced ? 1 : progress
  const leftIn = p > 0.01
  const chars = p < 0.1 ? 0 : p >= 0.3 ? TYPED.length : Math.floor(((p - 0.1) / 0.2) * TYPED.length)
  const rightIn = p >= 0.3
  const squares = p < 0.4 ? 0 : p >= 0.6 ? SQUARE_COUNT : Math.floor(((p - 0.4) / 0.2) * SQUARE_COUNT)
  const slippedIn = p >= 0.6
  const ruleIn = p >= 0.7
  const actionsIn = p >= 0.8

  return (
    <>
      <div className="lm-ot-scroll" ref={containerRef}>
        <div className="lm-ot-stage">
          <div className="lm-wrap lm-ot-stage-inner">
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
                  <span aria-hidden="true">{TYPED.slice(0, chars)}</span>
                  <i className="lm-ot-caret" aria-hidden="true" />
                </div>
              </div>

              <div className={`lm-ot-card lm-ot-record ${rightIn ? "is-in" : ""}`}>
                <div className="lm-ot-eyebrow is-up">You have been here before</div>
                <p className="lm-ot-line">Ten times you have been this sure about a date.</p>
                <div className="lm-ot-squares" aria-hidden="true">
                  {Array.from({ length: SQUARE_COUNT }, (_, i) => (
                    <span
                      key={i}
                      className={`lm-ot-square ${i < squares ? "is-on" : ""} ${i < SLIPPED ? "is-slipped" : ""}`}
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
            <p className={`lm-ot-recordlink ${actionsIn ? "is-in" : ""}`}>
              From 40 decisions in this record. <Link href="/app/demo#map">See the whole map</Link>
            </p>
          </div>
        </div>
      </div>

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
    </>
  )
}
