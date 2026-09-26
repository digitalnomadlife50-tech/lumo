"use client";

import { useEffect, useRef, useState } from "react";
import {
  Step1Screen,
  Step2Screen,
  Step3Screen,
  Step4Screen,
  Step5Screen,
  Step6Screen,
  CompleteScreen,
  type Option,
  type Comparison,
  type Draft,
  type ReadBack,
} from "./screens";
import { useInView, usePrefersReducedMotion } from "./ui";

const SITUATION = `#launch-v2 dana: sales needs v2 live for re:Invent, three enterprise deals riding on it
#eng marco: SSO is two sprints minimum, can't parallelize with the onboarding fix
LUM-812: blocker, enterprise SSO not scoped
dm from vp: need a call on this by friday`;

const READBACK: ReadBack = {
  question: "Ship v2 this quarter, or hold it for the enterprise launch",
  matters: "Revenue timing against a release current customers are waiting on",
  affected: "Engineering, sales, support, three enterprise prospects",
  pressing: "The VP wants an answer by Friday",
};

const OPTIONS: Option[] = [
  { id: "a", label: "Ship, no SSO date", summary: "Ship v2 on schedule without committing to a date.", source: "user", letter: "A" },
  { id: "b", label: "Hold six weeks", summary: "Delay the release to bundle SSO.", source: "user", letter: "B" },
  { id: "c", label: "Ship, written SSO date", summary: "Ship now and give a committed SSO date in writing.", source: "lumo", letter: "C" },
];

const COMPARISONS: Comparison[] = [
  { optionId: "a", label: "Ship, no SSO date", letter: "A", costLevel: "medium", costSummary: "Sales has to manage the ambiguity.", whoItHurts: "Sales", reversible: "partly", risk: "Prospects may walk if SSO slips again." },
  { optionId: "b", label: "Hold six weeks", letter: "B", costLevel: "high", costSummary: "Misses the re:Invent window entirely.", whoItHurts: "Sales and support", reversible: "no", risk: "The re:Invent window closes either way." },
  { optionId: "c", label: "Ship, written SSO date", letter: "C", costLevel: "low", costSummary: "Engineering commits to a hard date.", whoItHurts: "Engineering", reversible: "yes", risk: "Marco has to size SSO fast." },
];

const DRAFTS: Draft[] = [
  {
    id: "vp",
    audience: "Your VP",
    channel: "email",
    subject: "v2 ships on time. SSO gets its own date.",
    body: "Short version: v2 goes out on schedule to existing customers. Enterprise SSO moves to its own release with a committed date, so three deals don't hold up a fix 40 customers are waiting on.",
  },
  {
    id: "eng",
    audience: "Engineering",
    channel: "slack",
    body: "Decision on v2: it ships on the current date to existing customers. SSO comes out of v2 scope and gets its own release. Marco, can you size SSO as a standalone track by Wednesday?",
  },
];

type StepKey = 1 | 2 | 3 | 4 | 5 | 6 | 7;
const STEP_DURATIONS: Record<StepKey, number> = { 1: 6000, 2: 7000, 3: 6500, 4: 6500, 5: 6500, 6: 6000, 7: 3500 };
const STEP_ORDER: StepKey[] = [1, 2, 3, 4, 5, 6, 7];

function totalBefore(step: StepKey) {
  let sum = 0;
  for (const s of STEP_ORDER) {
    if (s === step) break;
    sum += STEP_DURATIONS[s];
  }
  return sum;
}
const TOTAL_MS = STEP_ORDER.reduce((a, s) => a + STEP_DURATIONS[s], 0);

export function ProductReplay() {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const [playing, setPlaying] = useState(!reduced);
  const [step, setStep] = useState<StepKey>(1);
  const [cycleStart, setCycleStart] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const pressRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setPlaying(false);
      return;
    }
    if (inView && playing !== false) {
      setPlaying(true);
      setCycleStart((c) => (c === 0 ? Date.now() : c));
    } else if (!inView) {
      setPlaying(false);
    }
  }, [inView, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCursorVisible(playing);
  }, [playing]);

  useEffect(() => {
    if (!playing || reduced) return;
    const tick = () => {
      const elapsed = (Date.now() - cycleStart) % TOTAL_MS;
      let s: StepKey = 1;
      for (const key of STEP_ORDER) {
        if (elapsed >= totalBefore(key)) s = key;
      }
      setStep((prev) => (prev === s ? prev : s));
      const withinStep = elapsed - totalBefore(s);
      const frac = withinStep / STEP_DURATIONS[s];
      const x = 30 + Math.sin(frac * Math.PI * 2 + s) * 20 + 40;
      const y = 60 + Math.cos(frac * Math.PI * 2 + s) * 15 + 20;
      const press = frac % 0.5 < 0.06;
      if (cursorRef.current) {
        cursorRef.current.style.left = `${x}%`;
        cursorRef.current.style.top = `${y}%`;
      }
      if (pressRef.current) {
        pressRef.current.style.opacity = press ? "1" : "0";
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, cycleStart, reduced]);

  const jump = (s: StepKey) => {
    setStep(s);
    setCycleStart(Date.now() - totalBefore(s));
    setCursorVisible(false);
  };

  const shared = { aiStatus: "ok" as const, initials: "TR" };

  return (
    <div ref={ref} className="lm-replay">
      <div className="lm-replay-frame">
        <div className="lm-replay-scale">
          {step === 1 ? <Step1Screen {...shared} decisionNumber={48} text={SITUATION} onChange={() => {}} onSubmit={() => {}} /> : null}
          {step === 2 ? <Step2Screen {...shared} decisionNumber={48} loading={false} readBack={READBACK} noticed="I noticed the onboarding fix is riding on v2 too. Delaying doesn't only affect sales." onEditField={() => {}} onNext={() => {}} onBack={() => {}} /> : null}
          {step === 3 ? <Step3Screen {...shared} decisionNumber={48} options={OPTIONS} onAddOption={() => {}} onNext={() => {}} onBack={() => {}} /> : null}
          {step === 4 ? <Step4Screen {...shared} decisionNumber={48} comparisons={COMPARISONS} onNext={() => {}} onBack={() => {}} /> : null}
          {step === 5 ? (
            <Step5Screen
              {...shared}
              decisionNumber={48}
              options={OPTIONS}
              selectedId="c"
              onSelect={() => {}}
              why="It ships. SSO gets a date instead of an open ended promise."
              onWhy={() => {}}
              gaveUp="A clean enterprise story at re:Invent"
              onGaveUp={() => {}}
              confidence={4}
              onConfidence={() => {}}
              onCommit={() => {}}
              onBack={() => {}}
            />
          ) : null}
          {step === 6 ? (
            <Step6Screen
              {...shared}
              decisionNumber={48}
              drafts={DRAFTS}
              onEditDraft={() => {}}
              onRewrite={() => {}}
              onUndo={() => {}}
              canUndo={() => false}
              onAddAudience={() => {}}
              onFinish={() => {}}
              onBack={() => {}}
            />
          ) : null}
          {step === 7 ? (
            <CompleteScreen
              {...shared}
              decisionNumber={48}
              call="Ship, written SSO date"
              confidence={4}
              audiences={["Your VP", "Engineering"]}
              gaveUp="A clean enterprise story at re:Invent"
              onHome={() => {}}
              onReview={() => {}}
            />
          ) : null}
        </div>
        {cursorVisible && playing ? (
          <div ref={cursorRef} className="lm-replay-cursor" aria-hidden="true">
            <span ref={pressRef} className="lm-replay-press" style={{ opacity: 0 }} />
          </div>
        ) : null}
        {!playing && reduced ? (
          <div className="lm-replay-nav" aria-hidden="false">
            <button type="button" aria-label="Previous step" onClick={() => jump(STEP_ORDER[(STEP_ORDER.indexOf(step) - 1 + 7) % 7])}>Previous</button>
            <button type="button" aria-label="Next step" onClick={() => jump(STEP_ORDER[(STEP_ORDER.indexOf(step) + 1) % 7])}>Next</button>
          </div>
        ) : null}
      </div>
      <div className="lm-replay-controls">
        <button
          type="button"
          className="lm-replay-play"
          aria-label={playing ? "Pause replay" : "Play replay"}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <div className="lm-replay-segs" role="group" aria-label="Replay step">
          {STEP_ORDER.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              className={`lm-replay-seg ${s <= step ? "is-on" : ""}`}
              aria-label={`Jump to step ${s}`}
              onClick={() => jump(s)}
            />
          ))}
        </div>
      </div>
      <div className="lm-mono lm-caption" style={{ fontSize: 12, marginTop: 10 }}>Replay of the real product with example data.</div>
    </div>
  );
}
