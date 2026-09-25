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

export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
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

export function PathBar({ current }: { current: number }) {
  return (
    <>
      <nav className="lm-path" aria-label="Progress">
        {STEP_NAMES.map((name, i) => {
          const color = i < current ? "var(--lm-text)" : i === current ? "var(--lm-accent)" : "var(--lm-text-3)";
          return (
            <span key={name} style={{ display: "contents" }}>
              <span
                className="lm-path-step"
                style={{ color, fontWeight: i === current ? 500 : 400 }}
                aria-current={i === current ? "step" : undefined}
              >
                <i aria-hidden="true" />
                {name}
              </span>
              {i < STEP_NAMES.length - 1 ? <span className="lm-path-dash" aria-hidden="true" /> : null}
            </span>
          );
        })}
      </nav>
      <div className="lm-path-mobile" aria-label="Progress">
        <div className="lm-path-mobile-text">
          Step {current + 1} of 6. {STEP_NAMES[current]}
        </div>
        <div className="lm-path-mobile-bar">
          <i style={{ width: `${((current + 1) / 6) * 100}%` }} />
        </div>
      </div>
    </>
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
