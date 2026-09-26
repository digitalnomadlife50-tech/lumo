"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type AiStatus = "idle" | "ok" | "error";

export const STEP_NAMES = [
  "What's happening",
  "What I'm reading",
  "Your options",
  "Side by side",
  "Your choice",
  "Tell people",
] as const;

export function delay(ms: number): CSSProperties {
  return { ["--d" as string]: `${ms}ms` } as CSSProperties;
}

export function useInView<T extends HTMLElement>(threshold = 0) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    // Reveal as soon as any part of the element crosses just below the viewport
    // bottom. A higher threshold never fires for elements taller than the
    // viewport, which would leave them stuck invisible.
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -48px 0px" }
    );
    obs.observe(el);
    // Safety net: never let content stay permanently hidden if the observer
    // somehow doesn't fire (e.g. layout thrash on first paint).
    const fallback = window.setTimeout(() => setInView(true), 1600);
    return () => {
      obs.disconnect();
      window.clearTimeout(fallback);
    };
  }, [inView, threshold]);
  return { ref, inView };
}

export function Reveal({
  children,
  delayMs = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={`lm-reveal ${inView ? "is-in" : ""} ${className}`}
      style={delay(delayMs)}
    >
      {children}
    </Tag>
  );
}

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <a href={href} className="lm-wordmark" aria-label="Lumo home">
      lumo<i aria-hidden="true" />
    </a>
  );
}

export function AppHeader({ aiStatus, initials = "" }: { aiStatus: AiStatus; initials?: string }) {
  const label = aiStatus === "ok" ? "ai connected" : aiStatus === "error" ? "ai unavailable" : "ai ready";
  const color = aiStatus === "ok" ? "var(--lm-positive)" : aiStatus === "error" ? "var(--lm-caution)" : "var(--lm-text-3)";
  return (
    <header className="lm-header">
      <Wordmark href="/app" />
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span className="lm-status" role="status">
          <i className={aiStatus === "ok" ? "lm-pulse" : ""} style={{ background: color }} aria-hidden="true" />
          <span>{label}</span>
        </span>
        {initials ? <span className="lm-avatar">{initials}</span> : null}
      </div>
    </header>
  );
}

export function PathBar({ current, onJump }: { current: number; onJump?: (step: number) => void }) {
  const [listOpen, setListOpen] = useState(false);
  return (
    <>
      <nav className="lm-path" aria-label="Progress">
        {STEP_NAMES.map((name, i) => {
          const color = i < current ? "var(--lm-text)" : i === current ? "var(--lm-accent)" : "var(--lm-text-3)";
          const canJump = i < current && !!onJump;
          const Tag = canJump ? "button" : "span";
          return (
            <span key={name} style={{ display: "contents" }}>
              <Tag
                type={canJump ? "button" : undefined}
                className={`lm-path-step ${canJump ? "is-jump" : ""}`}
                style={{ color, fontWeight: i === current ? 500 : 400 }}
                aria-current={i === current ? "step" : undefined}
                onClick={canJump ? () => onJump!(i) : undefined}
              >
                <i aria-hidden="true" />
                {name}
              </Tag>
              {i < STEP_NAMES.length - 1 ? <span className={`lm-path-dash ${i < current ? "is-done" : ""}`} aria-hidden="true"><i /></span> : null}
            </span>
          );
        })}
      </nav>
      <div className="lm-path-mobile" aria-label="Progress" style={{ position: "relative" }}>
        <button
          type="button"
          className="lm-path-mobile-text is-jump"
          onClick={() => setListOpen((o) => !o)}
          aria-expanded={listOpen}
          style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "var(--lm-text-2)", cursor: "pointer" }}
        >
          Step {current + 1} of 6. {STEP_NAMES[current]}
        </button>
        <div className="lm-path-mobile-bar">
          <i style={{ width: `${((current + 1) / 6) * 100}%` }} />
        </div>
        {listOpen ? (
          <div className="lm-path-jumplist" role="menu">
            {STEP_NAMES.map((name, i) => {
              const canJump = i < current && !!onJump;
              return (
                <button
                  key={name}
                  type="button"
                  disabled={!canJump}
                  onClick={() => {
                    if (canJump) {
                      onJump!(i);
                      setListOpen(false);
                    }
                  }}
                >
                  Step {i + 1}. {name}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}

export function KeyHint({ label = "Enter" }: { label?: string }) {
  const [mac, setMac] = useState(true);
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(window.navigator.userAgent));
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  if (touch) return null;
  return (
    <span className="lm-keyhint" aria-hidden="true">
      {mac ? `\u2318 ${label}` : `Ctrl ${label}`}
    </span>
  );
}

export function Kicker({ number, step, right }: { number: number; step: number; right?: ReactNode }) {
  return (
    <div className="lm-kicker">
      <span>
        No.{number} / step {step} of 6
      </span>
      {right ? <span>{right}</span> : null}
    </div>
  );
}

/** Signature element. Only use on: past decision closure, Step 2 "I noticed", Home empty state, Completion closing line. */
export function Signature({
  children,
  draw = true,
  delayMs = 0,
  style,
}: {
  children: ReactNode;
  draw?: boolean;
  delayMs?: number;
  style?: CSSProperties;
}) {
  return (
    <p className={`lm-sig ${draw ? "is-drawn" : ""}`} style={{ margin: 0, ...delay(delayMs), ...style }}>
      {children}
    </p>
  );
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
