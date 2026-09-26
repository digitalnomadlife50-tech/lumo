"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, usePrefersReducedMotion } from "./ui";

const CHIPS = [
  "#launch-v2 sales needs v2",
  "LUM-812 blocker",
  "vp: call by friday",
  "#eng SSO is two sprints",
  "#support 40 tickets",
  "dana: 3 deals riding on it",
  "onboarding fix in v2",
];

const CHIP_POS = [
  { top: "6%", left: "4%" },
  { top: "2%", left: "38%" },
  { top: "14%", left: "68%" },
  { top: "48%", left: "2%" },
  { top: "58%", left: "40%" },
  { top: "70%", left: "70%" },
  { top: "86%", left: "20%" },
];

const OPTIONS = [
  { letter: "A", label: "Ship, no SSO date" },
  { letter: "B", label: "Hold six weeks" },
  { letter: "C", label: "Ship, written SSO date" },
];

const AUDIENCES = ["Engineering", "Your VP", "Sales", "Support", "Design", "Marketing", "Decision doc"];

const STAGES = [
  { key: "mess", label: "The mess", at: 0 },
  { key: "question", label: "The real question", at: 2600 },
  { key: "options", label: "Your options", at: 4800 },
  { key: "choice", label: "The choice", at: 6800 },
  { key: "tell", label: "Tell people", at: 7700 },
] as const;

const LOOP_MS = 12500;
const SEG_TO_STAGE = [0, 1, 2, 4] as const;

export function ConceptAnimation() {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [running, setRunning] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [stage, setStage] = useState(reduced ? 4 : 0);
  const [cycleStart, setCycleStart] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    if (inView && !hovering) {
      setRunning(true);
      if (cycleStart === 0) setCycleStart(Date.now());
    } else {
      setRunning(false);
    }
  }, [inView, hovering, reduced, cycleStart]);

  useEffect(() => {
    if (!running || reduced) return;
    const tick = () => {
      const elapsed = (Date.now() - cycleStart) % LOOP_MS;
      let s = 0;
      for (let i = STAGES.length - 1; i >= 0; i--) {
        if (elapsed >= STAGES[i].at) {
          s = i;
          break;
        }
      }
      setStage(s);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, cycleStart, reduced]);

  const jump = (i: number) => {
    setStage(i);
    setCycleStart(Date.now() - STAGES[i].at);
  };

  const showMess = stage === 0;
  const showQuestion = stage >= 1;
  const showOptions = stage >= 2;
  const chosen = stage >= 3;
  const showTell = stage >= 4;
  const segCount = 4;
  const segIndex = Math.min(stage, 3);

  return (
    <div
      ref={ref}
      className="lm-concept"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="lm-concept-stage">
        <svg className="lm-concept-lines" aria-hidden="true">
          {showOptions &&
            OPTIONS.map((o, i) => (
              <path
                key={o.letter}
                className={`lm-concept-line ${showOptions ? "is-drawn" : ""} ${chosen && o.letter !== "C" ? "is-dim" : ""} ${chosen && o.letter === "C" ? "is-chosen" : ""}`}
                style={{ transitionDelay: `${i * 180}ms` }}
                d="M 20% 50% C 40% 50%, 40% 50%, 50% 50%"
              />
            ))}
          {showTell &&
            AUDIENCES.map((a, i) => (
              <path
                key={a}
                className="lm-concept-line is-chosen is-drawn"
                style={{ transitionDelay: `${i * 110}ms` }}
                d="M 55% 50% C 75% 50%, 75% 50%, 90% 50%"
              />
            ))}
        </svg>

        <div className={`lm-concept-chips ${showMess ? "is-on" : "is-off"}`} aria-hidden={!showMess}>
          {CHIPS.map((c, i) => (
            <span key={c} className="lm-concept-chip" style={{ ...CHIP_POS[i], transitionDelay: `${i * 90}ms` }}>
              {c}
            </span>
          ))}
        </div>

        <div className={`lm-concept-question ${showQuestion ? "is-on" : ""}`}>
          <div className="lm-concept-tag">the real question</div>
          <div className="lm-concept-qtext">Ship v2 now, or hold for enterprise</div>
        </div>

        <div className={`lm-concept-options ${showOptions ? "is-on" : ""}`}>
          {OPTIONS.map((o, i) => (
            <div
              key={o.letter}
              className={`lm-concept-opt ${chosen && o.letter === "C" ? "is-chosen" : ""} ${chosen && o.letter !== "C" ? "is-dim" : ""}`}
              style={{ transitionDelay: `${i * 180}ms` }}
            >
              <span className="lm-concept-letter">{o.letter}</span>
              {o.label}
            </div>
          ))}
        </div>

        <div className={`lm-concept-audiences ${showTell ? "is-on" : ""}`}>
          {AUDIENCES.map((a, i) => (
            <span key={a} className="lm-concept-pill" style={{ transitionDelay: `${i * 110}ms` }}>
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="lm-concept-controls">
        <span className="lm-mono lm-concept-caption">{STAGES[stage].label}</span>
        <div className="lm-concept-segs" role="group" aria-label="Animation stage">
          {SEG_TO_STAGE.map((targetStage, i) => (
            <button
              key={i}
              type="button"
              className={`lm-concept-seg ${i <= segIndex ? "is-on" : ""}`}
              aria-label={`Jump to stage ${i + 1}`}
              onClick={() => jump(targetStage)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
