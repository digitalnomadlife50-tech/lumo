"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { AppHeader, KeyHint, Kicker, PathBar, Signature, delay, usePrefersReducedMotion, type AiStatus } from "./ui";
import { useDict } from "@/lib/i18n";
import { fill } from "@/lib/i18n/get-dictionary";

/* ============ TYPES: wire existing app state and API results into these ============ */

export type PastDecision = {
  id: string;
  number: number;
  title: string;
  choice: string;
  confidence: number;
  gaveUp?: string;
  revisitDate?: string;
  outcome?: string;
  };

export type DraftInProgress = {
  id: string;
  number: number;
  title: string;
  step: number;
};

export type ReadBack = {
  question: string;
  matters: string;
  affected: string;
  pressing: string;
};

export type Option = {
  id: string;
  label: string;
  summary: string;
  source: "user" | "lumo";
  letter: string;
};

export type Comparison = {
  optionId: string;
  label: string;
  letter: string;
  costLevel: "low" | "medium" | "high";
  costSummary: string;
  whoItHurts: string;
  reversible: "yes" | "partly" | "no";
  risk: string;
};

export type Pushback = {
  objection: string;
  response: string;
};

export type Draft = {
  id: string;
  audience: string;
  channel: string;
  subject?: string;
  body: string;
  pushback?: Pushback[];
};

type Shell = { aiStatus: AiStatus; initials?: string };

function AppShell({
  aiStatus,
  initials,
  step,
  onJump,
  direction,
  children,
}: Shell & { step?: number; onJump?: (step: number) => void; direction?: "fwd" | "back"; children: ReactNode }) {
  return (
    <div className="lm-page">
      <AppHeader aiStatus={aiStatus} initials={initials} />
      {typeof step === "number" ? <PathBar current={step} onJump={onJump} /> : null}
      <main key={step} className={`lm-main ${direction === "back" ? "is-back" : direction === "fwd" ? "is-fwd" : ""}`}>
        {children}
      </main>
    </div>
  );
}

/* ============ HOME ============ */

export function HomeScreen({
  aiStatus,
  initials,
  value,
  onChange,
  onStart,
  decisions,
  newestId,
  onOpenDecision,
  draft,
  onResume,
  onDiscardDraft,
  onTryExample,
  onSaveOutcome,
}: Shell & {
  value: string;
  onChange: (v: string) => void;
  onStart: () => void;
  decisions: PastDecision[];
  newestId?: string | null;
  onOpenDecision?: (id: string) => void;
  draft?: DraftInProgress | null;
  onResume?: () => void;
  onDiscardDraft?: () => void;
  onTryExample?: () => void;
  onSaveOutcome?: (id: string, outcome: string) => void;
}) {
  const t = useDict().app.home;
  const reduced = usePrefersReducedMotion();
  const [ph, setPh] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [outcomeOpenId, setOutcomeOpenId] = useState<string | null>(null);
  const [outcomeDraft, setOutcomeDraft] = useState("");
  useEffect(() => {
    if (reduced || value) return;
    const timer = setInterval(() => setPh((p) => (p + 1) % t.placeholders.length), 4000);
    return () => clearInterval(timer);
  }, [reduced, value, t.placeholders.length]);

  const sorted = [...decisions].sort((a, b) => b.number - a.number);

  return (
    <AppShell aiStatus={aiStatus} initials={initials}>
      <h1 className="lm-anim lm-display">{t.title}</h1>
      <p className="lm-anim lm-sub" style={delay(80)}>{t.sub}</p>

      <div className="lm-anim lm-callbox" style={delay(160)}>
        <label htmlFor="lm-call" className="lm-label">{t.inOneLine}</label>
        <div className="lm-callinput">
          {!value ? (
            <span key={ph} className="lm-callph lm-fade-swap" aria-hidden="true">{t.placeholders[ph]}</span>
          ) : null}
          <input
            id="lm-call"
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) onStart();
            }}
            autoComplete="off"
          />
        </div>
        <div className="lm-callfoot">
          <div className="lm-chips">
            {t.chips.map(({ label, text }) => (
              <button
                key={label}
                className="lm-chip"
                type="button"
                onClick={() => {
                  onChange(text);
                  inputRef.current?.focus();
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="lm-btn" onClick={onStart} disabled={!value.trim()}>{t.start}</button>
        </div>
        {onTryExample && !value.trim() ? (
          <div className="lm-samplerow">
            <span className="lm-label">{t.orSample}</span>
            <button type="button" className="lm-chip" onClick={onTryExample}>
              {t.sampleChip}
            </button>
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 72 }}>
        {draft ? (
          <div className="lm-card lm-resume" style={{ marginBottom: 32 }}>
            <div className="lm-label">{t.inProgress}</div>
            <div style={{ fontSize: 17, fontWeight: 500, marginTop: 8 }}>{draft.title}</div>
            <div className="lm-mono lm-caption" style={{ marginTop: 6 }}>{fill(t.stepOf, { number: draft.number, step: draft.step })}</div>
            <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
              <button className="lm-btn" onClick={onResume}>{t.resume}</button>
              <button className="lm-link" style={{ color: "var(--lm-text-3)" }} onClick={onDiscardDraft}>{t.discard}</button>
            </div>
          </div>
        ) : null}
        {sorted.length === 0 ? (
          <Signature delayMs={300}>{t.emptySignature}</Signature>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div className="lm-label">{t.recent}</div>
              <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>{sorted.length === 1 ? fill(t.decisionCount, { count: sorted.length }) : fill(t.decisionCountPlural, { count: sorted.length })}</div>
            </div>
            <div className="lm-stack" style={{ marginTop: 20, gap: 16 }}>
              {sorted.map((d, i) => {
                const revisitDue = !!d.revisitDate && new Date(d.revisitDate).getTime() < Date.now();
                const isNewest = !!newestId && d.id === newestId;
                return (
                  <div key={d.id} className="lm-anim lm-past lm-flip-enter" style={delay(300 + i * 80)}>
                    <div className="lm-past-num">No.{d.number}</div>
                    <div
                      className={isNewest ? "lm-card lm-card-hover lm-card-new" : "lm-card lm-card-hover"}
                      style={{ cursor: onOpenDecision ? "pointer" : "default" }}
                      onClick={onOpenDecision ? () => onOpenDecision(d.id) : undefined}
                    >
                      <div className="lm-past-num-inline">No.{d.number}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
                        <div style={{ fontSize: 17, fontWeight: 500 }}>{d.title}</div>
                        <span className={revisitDue ? "lm-done lm-revisit-due" : "lm-done"}>{revisitDue ? t.revisitDue : isNewest ? t.justFiled : t.done}</span>
                      </div>
                      <div className="lm-caption" style={{ marginTop: 6 }}>
                        {fill(t.choseLine, { choice: d.choice, confidence: d.confidence })}
                      </div>
                      {i === 0 && d.gaveUp ? (
                        <Signature draw={false} style={{ marginTop: 18 }}>{fill(t.gaveUpLine, { gaveUp: lowerFirst(d.gaveUp) })}</Signature>
                      ) : null}
                      {d.outcome ? (
                        <div className="lm-caption" style={{ marginTop: 10, color: "var(--lm-text-2)" }}>
                          <span className="lm-label" style={{ marginRight: 8 }}>{t.outcome}</span>
                          {d.outcome}
                        </div>
                      ) : onSaveOutcome ? (
                        outcomeOpenId === d.id ? (
                          <div
                            style={{ marginTop: 12, display: "flex", gap: 10 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              className="lm-input"
                              autoFocus
                              placeholder={t.howDidItGo}
                              value={outcomeDraft}
                              onChange={(e) => setOutcomeDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && outcomeDraft.trim()) {
                                  onSaveOutcome(d.id, outcomeDraft.trim());
                                  setOutcomeOpenId(null);
                                  setOutcomeDraft("");
                                }
                              }}
                            />
                            <button
                              className="lm-btn-sec"
                              type="button"
                              onClick={() => {
                                if (outcomeDraft.trim()) onSaveOutcome(d.id, outcomeDraft.trim());
                                setOutcomeOpenId(null);
                                setOutcomeDraft("");
                              }}
                            >
                              {t.save}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="lm-link"
                            style={{ marginTop: 10 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOutcomeOpenId(d.id);
                              setOutcomeDraft("");
                            }}
                          >
                            {t.howDidItGo}
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {sorted.length > 0 ? <PatternsSection decisions={sorted} /> : null}
      </div>
    </AppShell>
  );
}

function PatternsSection({ decisions }: { decisions: PastDecision[] }) {
  const t = useDict().app.home;
  if (decisions.length < 5) {
    const remaining = 5 - decisions.length;
    return (
      <div style={{ marginTop: 56 }}>
        <div className="lm-label">{t.patterns}</div>
        <p className="lm-caption" style={{ marginTop: 10, maxWidth: 480 }}>
          {fill(t.patternsEmpty, { count: remaining, s: remaining === 1 ? "" : "s" })}
        </p>
      </div>
    );
  }

  const avgConfidence = decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length;
  const gaveUpCount = decisions.filter((d) => d.gaveUp?.trim()).length;
  const revisited = decisions.filter((d) => d.revisitDate).length;

  return (
    <div style={{ marginTop: 56 }}>
      <div className="lm-label">{t.patterns}</div>
      <div className="lm-stack" style={{ marginTop: 16, gap: 12 }}>
        <p className="lm-caption">
          {fill(t.avgConfidence, { avg: avgConfidence.toFixed(1), count: decisions.length })}
        </p>
        <p className="lm-caption">
          {fill(t.gaveUpStat, { count: gaveUpCount, total: decisions.length })}
        </p>
        {revisited > 0 ? (
          <p className="lm-caption">
            {revisited === 1 ? fill(t.revisitedStat, { count: revisited }) : fill(t.revisitedStatPlural, { count: revisited })}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function lowerFirst(s: string) {
  const t = s.trim().replace(/[.]+$/, "");
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/* ============ STEP 1 ============ */

type Kind = "person" | "deadline" | "blocker" | "channel";
const PATTERNS: { kind: Kind; re: RegExp }[] = [
  { kind: "channel", re: /#[\w-]+/g },
  { kind: "person", re: /@[\w.-]+/g },
  { kind: "person", re: /(^|\n)\s*(?:#[\w-]+\s+)?([A-Za-z][\w.-]{1,30})(?=\s*:)/g },
  { kind: "blocker", re: /\b[A-Z]{2,10}-\d{1,6}\b/g },
  { kind: "deadline", re: /\b(mon|tues|wednes|thurs|fri|satur|sun)day\b/gi },
  { kind: "deadline", re: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{1,2}\b/gi },
  { kind: "deadline", re: /\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/g },
  { kind: "deadline", re: /\b(end of (the )?(week|month|quarter)|next (week|sprint|quarter)|eod|eow|q[1-4])\b/gi },
];

export function detectEntities(text: string) {
  const ranges: { start: number; end: number; kind: Kind; value: string }[] = [];
  for (const { kind, re } of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      let start = m.index;
      let value = m[0];
      if (m[2]) {
        start = m.index + m[0].indexOf(m[2]);
        value = m[2];
      }
      const end = start + value.length;
      if (!ranges.some((r) => start < r.end && end > r.start)) ranges.push({ start, end, kind, value });
      if (m[0].length === 0) re.lastIndex++;
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  const uniq = (k: Kind) => new Set(ranges.filter((r) => r.kind === k).map((r) => r.value.replace(/^@/, "").toLowerCase())).size;
  return {
    ranges,
    counts: { people: uniq("person"), deadlines: uniq("deadline"), blockers: uniq("blocker"), channels: uniq("channel") },
  };
}

export function Step1Screen({
  aiStatus,
  initials,
  decisionNumber,
  text,
  onChange,
  onSubmit,
  onSaveForLater,
  loading,
  error,
  direction,
  hardship = "",
  onHardshipChange,
}: Shell & {
  decisionNumber: number;
  text: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSaveForLater?: () => void;
  loading?: boolean;
  error?: string;
  direction?: "fwd" | "back";
  hardship?: string;
  onHardshipChange?: (v: string) => void;
}) {
  const t = useDict().app.step1;
  const layerRef = useRef<HTMLDivElement>(null);
  const { ranges, counts } = useMemo(() => detectEntities(text), [text]);

  const pieces: ReactNode[] = [];
  let pos = 0;
  ranges.forEach((r, i) => {
    if (r.start > pos) pieces.push(text.slice(pos, r.start));
    pieces.push(<mark key={i}>{text.slice(r.start, r.end)}</mark>);
    pos = r.end;
  });
  pieces.push(text.slice(pos) + "\n");

  return (
    <AppShell aiStatus={aiStatus} initials={initials} step={0} direction={direction}>
      <Kicker number={decisionNumber} step={1} />
      <h1 className="lm-anim lm-heading">{t.heading}</h1>
      <p className="lm-anim lm-sub" style={delay(60)}>{t.sub}</p>

      <div className="lm-anim lm-paste" style={delay(120)}>
        <div ref={layerRef} className="lm-paste-layer" aria-hidden="true">{pieces}</div>
        <textarea
          aria-label={t.textareaLabel}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => {
            if (layerRef.current) layerRef.current.scrollTop = e.currentTarget.scrollTop;
          }}
          placeholder={t.placeholder}
        />
      </div>

      {text.trim() ? (
        <div className="lm-picked" aria-live="polite">
          <span>{t.pickedUp}</span>
          <b>{counts.people} {counts.people === 1 ? t.person : t.people}</b>
          <b>{counts.deadlines} {counts.deadlines === 1 ? t.deadline : t.deadlines}</b>
          <b>{counts.blockers} {counts.blockers === 1 ? t.ticket : t.tickets}</b>
          <b>{counts.channels} {counts.channels === 1 ? t.channel : t.channels}</b>
        </div>
      ) : null}

      {onHardshipChange ? (
        <div className="lm-anim" style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8, ...delay(160) }}>
          <label htmlFor="lm-hardship" className="lm-label">{t.hardshipLabel}</label>
          <input
            id="lm-hardship"
            className="lm-input"
            placeholder={t.hardshipPlaceholder}
            value={hardship}
            onChange={(e) => onHardshipChange(e.target.value)}
          />
        </div>
      ) : null}

      {error ? <div className="lm-error" role="alert">{error}</div> : null}

      <div className="lm-actions">
        <button className="lm-btn" onClick={onSubmit} disabled={!text.trim() || loading}>
          {loading ? t.readingItBack : t.readItBack}
        </button>
        {text.trim() && !loading ? <KeyHint /> : null}
        {onSaveForLater ? <button className="lm-link" onClick={onSaveForLater}>{t.saveForLater}</button> : null}
      </div>
    </AppShell>
  );
}

/* ============ STEP 2 ============ */

export function Step2Screen({
  aiStatus,
  initials,
  decisionNumber,
  loading,
  readBack,
  noticed,
  onEditField,
  onNext,
  onBack,
  error,
  direction,
  onJump,
  entities = [],
  sources,
  }: Shell & {
  decisionNumber: number;
  loading: boolean;
  readBack: ReadBack | null;
  noticed?: string;
  onEditField: (key: keyof ReadBack, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  error?: string;
  direction?: "fwd" | "back";
  onJump?: (step: number) => void;
  entities?: string[];
  sources?: Partial<Record<keyof ReadBack, string[]>>;
}) {
  const t = useDict().app.step2;
  const FIELDS: { key: keyof ReadBack; label: string; lead?: boolean }[] = [
    { key: "question", label: t.fields.question, lead: true },
    { key: "matters", label: t.fields.matters },
    { key: "affected", label: t.fields.affected },
    { key: "pressing", label: t.fields.pressing },
  ];
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);
  const [editing, setEditing] = useState<keyof ReadBack | null>(null);
  const [draft, setDraft] = useState("");
  const [entityCount, setEntityCount] = useState(0);
  const [sourceVisible, setSourceVisible] = useState<keyof ReadBack | null>(null);

  useEffect(() => {
    if (!loading) {
      setEntityCount(0);
      return;
    }
    setEntityCount(0);
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setEntityCount(n);
      if (n >= Math.min(entities.length, 6)) clearInterval(t);
    }, 300);
    return () => clearInterval(t);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!readBack) {
      setShown(0);
      return;
    }
    if (reduced) {
      setShown(FIELDS.length + 1);
      return;
    }
    setShown(0);
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setShown(n);
      if (n > FIELDS.length) clearInterval(t);
    }, 500);
    return () => clearInterval(t);
  }, [readBack === null, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = !!readBack && shown > FIELDS.length;

  return (
    <AppShell aiStatus={aiStatus} initials={initials} step={1} direction={direction} onJump={onJump}>
      <Kicker number={decisionNumber} step={2} right={done ? <span style={{ color: "var(--lm-positive)" }}>{t.read}</span> : null} />
      <h1 className="lm-anim lm-heading">{t.heading}</h1>
      <p className="lm-anim lm-sub" style={delay(60)}>{t.sub}</p>

      {loading || !readBack ? (
        <div className="lm-reading" role="status">
          <i className="lm-pulse" aria-hidden="true" />
          <span className="lm-mono">{entities.length === 0 ? t.reading : `${t.reading} ${entities.slice(0, entityCount).join(", ")}`}</span>
        </div>
      ) : (
        <div className="lm-stack" style={{ marginTop: 32 }}>
          {FIELDS.map((f, i) =>
            i < shown ? (
              <div
                key={f.key}
                className="lm-anim lm-field"
                onMouseEnter={() => setSourceVisible(f.key)}
                onMouseLeave={() => setSourceVisible((v) => (v === f.key ? null : v))}
                onFocus={() => setSourceVisible(f.key)}
                onBlur={() => setSourceVisible((v) => (v === f.key ? null : v))}
              >
                <div className="lm-field-top">
                  <div className="lm-label">{f.label}</div>
                  {editing !== f.key ? (
                    <button
                      className="lm-edit"
                      onClick={() => {
                        setEditing(f.key);
                        setDraft(readBack[f.key]);
                      }}
                    >
                      {t.edit}
                    </button>
                  ) : null}
                </div>
                {editing === f.key ? (
                  <div style={{ marginTop: 10 }}>
                    <textarea className="lm-textarea" rows={2} value={draft} autoFocus onChange={(e) => setDraft(e.target.value)} />
                    <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                      <button
                        className="lm-link"
                        onClick={() => {
                          onEditField(f.key, draft.trim() || readBack[f.key]);
                          setEditing(null);
                        }}
                      >
                        {t.save}
                      </button>
                      <button className="lm-link" style={{ color: "var(--lm-text-3)" }} onClick={() => setEditing(null)}>{t.cancel}</button>
                    </div>
                  </div>
                ) : (
                  <div className={`lm-field-val ${f.lead ? "is-lead" : ""}`}>{readBack[f.key]}</div>
                )}
                {sources?.[f.key]?.length ? (
                  <button
                    type="button"
                    className="lm-source-toggle"
                    onClick={() => setSourceVisible((v) => (v === f.key ? null : f.key))}
                  >
                    {sourceVisible === f.key ? t.hideSource : t.showSource}
                  </button>
                ) : null}
                {sourceVisible === f.key && sources?.[f.key]?.length ? (
                  <div className="lm-source">
                    {sources[f.key]!.map((line, li) => (
                      <div key={li}>&ldquo;{line}&rdquo;</div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null
          )}
          {shown > FIELDS.length && noticed ? <Signature style={{ marginTop: 18 }}>{noticed}</Signature> : null}
        </div>
      )}

      {error ? <div className="lm-error" role="alert">{error}</div> : null}

      <div className="lm-actions">
        <button className="lm-btn" onClick={onNext} disabled={!done}>{t.thatsRight}</button>
        {done ? <KeyHint /> : null}
        <button className="lm-link" onClick={onBack}>{t.backToDetails}</button>
      </div>
    </AppShell>
  );
}

/* ============ STEP 3 ============ */

export function Step3Screen({
  aiStatus,
  initials,
  decisionNumber,
  options,
  onAddOption,
  onNext,
  onBack,
  loading,
  direction,
  onJump,
  }: Shell & {
  decisionNumber: number;
  options: Option[];
  onAddOption: (label: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  direction?: "fwd" | "back";
  onJump?: (step: number) => void;
  }) {
  const t = useDict().app.step3;
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const ordered = [...options.filter((o) => o.source === "user"), ...options.filter((o) => o.source === "lumo")];

  return (
  <AppShell aiStatus={aiStatus} initials={initials} step={2} direction={direction} onJump={onJump}>
      <Kicker number={decisionNumber} step={3} />
      <h1 className="lm-anim lm-heading">{t.heading}</h1>
      <p className="lm-anim lm-sub" style={delay(60)}>{t.sub}</p>

      {loading ? (
        <div className="lm-reading" role="status"><i className="lm-pulse" aria-hidden="true" />{t.readingOptions}</div>
      ) : (
        <div className="lm-stack" style={{ marginTop: 32 }}>
          {ordered.map((o, i) => {
            const isLumo = o.source === "lumo";
            const d = isLumo ? 300 + i * 200 + 600 : 300 + i * 200;
            return (
              <div key={o.id} className={`lm-opt ${isLumo ? "is-lumo is-in" : "lm-anim"}`} style={delay(d)}>
                <div className="lm-opt-key">{o.letter}</div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <div className="lm-opt-title">{o.label}</div>
                    {isLumo ? <span className="lm-badge">{t.addedByLumo}</span> : <span className="lm-label">{t.yours}</span>}
                  </div>
                  {o.summary ? <div className="lm-opt-sum">{o.summary}</div> : null}
                </div>
              </div>
            );
          })}
          {adding ? (
            <div className="lm-field">
              <label className="lm-label" htmlFor="lm-newopt">{t.yourOption}</label>
              <input
                id="lm-newopt"
                className="lm-input"
                style={{ marginTop: 10 }}
                value={label}
                autoFocus
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && label.trim()) {
                    onAddOption(label.trim());
                    setLabel("");
                    setAdding(false);
                  }
                }}
              />
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <button
                  className="lm-link"
                  onClick={() => {
                    if (label.trim()) onAddOption(label.trim());
                    setLabel("");
                    setAdding(false);
                  }}
                >
                  {t.add}
                </button>
                <button className="lm-link" style={{ color: "var(--lm-text-3)" }} onClick={() => setAdding(false)}>{t.cancel}</button>
              </div>
            </div>
          ) : (
            <button className="lm-addopt" onClick={() => setAdding(true)}>{t.addOption}</button>
          )}
        </div>
      )}

      <div className="lm-actions">
        <button className="lm-btn" onClick={onNext} disabled={loading || options.length < 2}>{t.compareThem}</button>
        {!loading && options.length >= 2 ? <KeyHint /> : null}
        <button className="lm-link" onClick={onBack}>{t.back}</button>
      </div>
    </AppShell>
  );
}

/* ============ STEP 4 ============ */

const COST = {
  low: { w: "40%", c: "var(--lm-positive)" },
  medium: { w: "70%", c: "var(--lm-caution)" },
  high: { w: "90%", c: "var(--lm-risk)" },
};
const REV = { yes: "var(--lm-positive)", partly: "var(--lm-caution)", no: "var(--lm-risk)" };

export function Step4Screen({
  aiStatus,
  initials,
  decisionNumber,
  comparisons,
  onNext,
  onBack,
  loading,
  direction,
  onJump,
  }: Shell & {
  decisionNumber: number;
  comparisons: Comparison[];
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  direction?: "fwd" | "back";
  onJump?: (step: number) => void;
  }) {
  const t = useDict().app.step4;
  const cols = { ["--cols" as string]: comparisons.length } as CSSProperties;
  return (
  <AppShell aiStatus={aiStatus} initials={initials} step={3} direction={direction} onJump={onJump}>
      <Kicker number={decisionNumber} step={4} />
      <h1 className="lm-anim lm-heading">{t.heading}</h1>
      <p className="lm-anim lm-sub" style={delay(60)}>{t.sub}</p>

      {loading ? (
        <div className="lm-reading" role="status"><i className="lm-pulse" aria-hidden="true" />{t.weighing}</div>
      ) : (
        <>
          <div className="lm-anim lm-cmp" style={delay(150)}>
            <div className="lm-cmp-row is-head" style={cols}>
              <div />
              {comparisons.map((c) => (
                <div key={c.optionId}>
                  <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>{c.letter}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4, lineHeight: 1.35 }}>{c.label}</div>
                </div>
              ))}
            </div>
            <div className="lm-cmp-row" style={cols}>
              <div className="lm-label">{t.whatItCosts}</div>
              {comparisons.map((c, i) => (
                <div key={c.optionId}>
                  <div className="lm-track"><i style={{ width: COST[c.costLevel].w, background: COST[c.costLevel].c, ...delay(600 + i * 150) }} /></div>
                  <span style={{ color: "var(--lm-text-2)" }}>{c.costSummary}</span>
                </div>
              ))}
            </div>
            <div className="lm-cmp-row" style={cols}>
              <div className="lm-label">{t.whoItHurts}</div>
              {comparisons.map((c) => <div key={c.optionId}>{c.whoItHurts}</div>)}
            </div>
            <div className="lm-cmp-row" style={cols}>
              <div className="lm-label">{t.canYouUndo}</div>
              {comparisons.map((c) => (
                <div key={c.optionId} className="lm-mono" style={{ fontSize: 13, color: REV[c.reversible] }}>{c.reversible}</div>
              ))}
            </div>
            <div className="lm-cmp-row" style={cols}>
              <div className="lm-label">{t.theRisk}</div>
              {comparisons.map((c) => <div key={c.optionId} style={{ color: "var(--lm-text-2)" }}>{c.risk}</div>)}
            </div>
          </div>

          <div className="lm-cmp-cards">
            {comparisons.map((c, i) => (
              <div key={c.optionId} className="lm-anim lm-card lm-cmp-card" style={delay(150 + i * 120)}>
                <div className="lm-mono lm-caption" style={{ fontSize: 12 }}>{c.letter}</div>
                <div style={{ fontSize: 17, fontWeight: 500, marginTop: 4 }}>{c.label}</div>
                <dl>
                  <div>
                    <dt>{t.whatItCosts}</dt>
                    <dd>
                      <div className="lm-track" style={{ marginTop: 8 }}><i style={{ width: COST[c.costLevel].w, background: COST[c.costLevel].c, ...delay(500 + i * 150) }} /></div>
                      {c.costSummary}
                    </dd>
                  </div>
                  <div><dt>{t.whoItHurts}</dt><dd>{c.whoItHurts}</dd></div>
                  <div><dt>{t.canYouUndo}</dt><dd className="lm-mono" style={{ fontSize: 13, color: REV[c.reversible] }}>{c.reversible}</dd></div>
                  <div><dt>{t.theRisk}</dt><dd>{c.risk}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="lm-actions">
        <button className="lm-btn" onClick={onNext} disabled={loading}>{t.makeDecision}</button>
        {!loading ? <KeyHint /> : null}
        <button className="lm-link" onClick={onBack}>{t.backToOptions}</button>
      </div>
    </AppShell>
  );
}

/* ============ STEP 5 ============ */

export function Step5Screen({
  aiStatus,
  initials,
  decisionNumber,
  options,
  selectedId,
  onSelect,
  why,
  onWhy,
  gaveUp,
  onGaveUp,
  confidence,
  onConfidence,
  onCommit,
  onBack,
  direction,
  onJump,
  reversibleById,
  revisitDate,
  onRevisitDate,
}: Shell & {
  decisionNumber: number;
  options: Option[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  why: string;
  onWhy: (v: string) => void;
  gaveUp: string;
  onGaveUp: (v: string) => void;
  confidence: number;
  onConfidence: (n: number) => void;
  onCommit: () => void;
  onBack: () => void;
  direction?: "fwd" | "back";
  onJump?: (step: number) => void;
  reversibleById?: Record<string, "yes" | "partly" | "no">;
  revisitDate?: string;
  onRevisitDate?: (v: string) => void;
}) {
  const t = useDict().app.step5;
  const [holding, setHolding] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ready = !!selectedId && why.trim().length > 0 && confidence > 0;

  const commit = () => {
    if (!ready) {
      setError(t.errorPick);
      return;
    }
    setError("");
    setCommitted(true);
    setHolding(false);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(15); } catch { /* ignore unsupported vibrate */ }
    }
    setTimeout(onCommit, 500);
  };
  const start = () => {
    if (committed) return;
    if (!ready) {
      setError(t.errorPick);
      return;
    }
    setError("");
    setHolding(true);
    timer.current = setTimeout(commit, 1100);
  };
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!committed) setHolding(false);
  };
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
      e.preventDefault();
      start();
    }
  };
  const onKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") stop();
  };

  return (
    <AppShell aiStatus={aiStatus} initials={initials} step={4}>
      <Kicker number={decisionNumber} step={5} />
      <h1 className="lm-anim lm-heading">{t.heading}</h1>
      <p className="lm-anim lm-sub" style={delay(60)}>{t.sub}</p>

      <div className="lm-anim lm-stack" style={{ marginTop: 32, gap: 10, ...delay(150) }} role="radiogroup" aria-label={t.optionsLabel}>
        {options.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={selectedId === o.id}
            className={`lm-choice ${selectedId === o.id ? "is-on" : ""}`}
            onClick={() => onSelect(o.id)}
          >
            <span className="lm-mono" style={{ fontSize: 14, width: 20 }}>{o.letter}</span>
            <span>{o.label}</span>
            <span className="lm-radio" aria-hidden="true" />
          </button>
        ))}
      </div>

      {selectedId && reversibleById?.[selectedId] ? (
        <div className="lm-anim lm-undo-line" style={delay(190)}>
          <span className="lm-label">{t.canYouUndo}</span>
          <span
            className="lm-mono"
            style={{ fontSize: 13, color: REV[reversibleById[selectedId]] }}
          >
            {reversibleById[selectedId]}
          </span>
        </div>
      ) : null}

      <div className="lm-anim" style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 8, ...delay(220) }}>
        <label htmlFor="lm-why" className="lm-label">{t.whyLabel}</label>
        <textarea id="lm-why" className="lm-textarea" rows={2} value={why} onChange={(e) => onWhy(e.target.value)} />
      </div>

      <div className="lm-anim" style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8, ...delay(280) }}>
          <label htmlFor="lm-gave" className="lm-label">{t.gaveUpLabel}</label>
        <input id="lm-gave" className="lm-input" value={gaveUp} onChange={(e) => onGaveUp(e.target.value)} />
      </div>

      <div className="lm-anim" style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", ...delay(340) }}>
        <span className="lm-label">{t.confidence}</span>
        <div className="lm-conf" role="radiogroup" aria-label={t.confidence}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              role="radio"
              aria-checked={confidence === n}
              aria-label={fill(t.confidenceAria, { n })}
              className={n <= confidence ? "is-on" : ""}
              style={n <= confidence ? { transitionDelay: `${(n - 1) * 40}ms` } : undefined}
              onClick={() => onConfidence(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {onRevisitDate ? (
        <div className="lm-anim lm-revisit" style={delay(370)}>
          <label htmlFor="lm-revisit" className="lm-label">{t.revisitOn}</label>
          <input
            id="lm-revisit"
            type="date"
            className="lm-input"
            value={revisitDate ?? ""}
            onChange={(e) => onRevisitDate(e.target.value)}
          />
        </div>
      ) : null}

      {error ? <div className="lm-error" role="alert">{error}</div> : null}

      <div className="lm-actions" style={{ marginTop: 44 }}>
        <button
          className={`lm-hold ${holding ? "is-holding" : ""} ${committed ? "is-done" : ""}`}
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          aria-label={t.holdToCommit}
        >
          <span className="lm-hold-fill" aria-hidden="true" />
          <span className="lm-hold-label">{committed ? fill(t.committed, { number: decisionNumber }) : t.holdToCommit}</span>
        </button>
        {!committed ? (
          <button className="lm-link" onClick={commit}>{t.commitWithout}</button>
        ) : null}
        <button className="lm-link" style={{ color: "var(--lm-text-3)" }} onClick={onBack}>{t.back}</button>
      </div>
    </AppShell>
  );
}

/* ============ STEP 6 ============ */

export function Step6Screen({
  aiStatus,
  initials,
  decisionNumber,
  drafts,
  loading,
  onEditDraft,
  onRewrite,
  rewritingId,
  onUndo,
  canUndo,
  onAddAudience,
  addingAudience,
  onFinish,
  onBack,
  error,
}: Shell & {
  decisionNumber: number;
  drafts: Draft[];
  loading?: boolean;
  onEditDraft: (id: string, body: string) => void;
  onRewrite: (id: string, mode: "shorter" | "more_direct") => void;
  rewritingId?: string | null;
  onUndo: (id: string) => void;
  canUndo: (id: string) => boolean;
  onAddAudience: (audience: string) => void;
  addingAudience?: boolean;
  onFinish: () => void;
  onBack: () => void;
  error?: string;
}) {
  const t = useDict().app.step6;
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [newAud, setNewAud] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [hasFanned, setHasFanned] = useState(false);
  const bodyWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tab > drafts.length - 1) setTab(Math.max(0, drafts.length - 1));
  }, [drafts.length, tab]);

  useEffect(() => {
    if (!hasFanned && drafts.length > 0) setHasFanned(true);
  }, [hasFanned, drafts.length]);

  const d = drafts[tab];
  const words = d ? `${d.subject ?? ""} ${d.body}`.trim().split(/\s+/).filter(Boolean).length : 0;
  const busy = !!d && rewritingId === d.id;
  const copiedCount = drafts.filter((x) => copied[x.id]).length;

  const bodies = drafts.map((x) => x.body.trim());
  const isConsistent = bodies.every((b) => b === bodies[0]) || bodies.length <= 1;

  useEffect(() => {
    const el = bodyWrapRef.current;
    if (!el) return;
    const target = el.firstElementChild as HTMLElement | null;
    if (!target) return;
    const setHeight = () => { el.style.height = `${target.offsetHeight}px`; };
    setHeight();
    const ro = new ResizeObserver(setHeight);
    ro.observe(target);
    return () => ro.disconnect();
  }, [d?.id, d?.body, editing]);

  const copy = async () => {
    if (!d) return;
    const text = d.subject ? `Subject: ${d.subject}\n\n${d.body}` : d.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied((c) => ({ ...c, [d.id]: true }));
    } catch {
      setCopied((c) => ({ ...c, [d.id]: false }));
    }
  };

  return (
    <AppShell aiStatus={aiStatus} initials={initials} step={5}>
      <Kicker number={decisionNumber} step={6} />
      <h1 className="lm-anim lm-heading">{t.heading}</h1>
        <p className="lm-anim lm-sub" style={delay(60)}>{t.sub}</p>

      {loading || drafts.length === 0 ? (
        <div className="lm-reading" role="status"><i className="lm-pulse" aria-hidden="true" />{t.writingDrafts}</div>
      ) : (
        <>
          <div className="lm-tabs-wrap" style={delay(150)}>
            <div className={`lm-anim lm-tabs ${!hasFanned ? "is-fan" : ""}`} role="tablist" aria-label={t.updatesLabel}>
              {drafts.map((x, i) => (
                <button
                  key={x.id}
                  role="tab"
                  id={`lm-tab-${i}`}
                  aria-selected={i === tab}
                  aria-controls="lm-draft-panel"
                  className={i === tab ? "is-on" : ""}
                  style={!hasFanned ? ({ "--d": `${i * 90}ms` } as CSSProperties) : undefined}
                  onClick={() => {
                    setTab(i);
                    setEditing(false);
                  }}
                >
                  {x.audience}
                  {copied[x.id] ? <small>{t.copied}</small> : null}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="lm-tabs-add"
              onClick={() => setShowAdd((s) => !s)}
              aria-expanded={showAdd}
            >
              {t.addPerson}
            </button>
          </div>

          <div className={`lm-consistency ${isConsistent ? "" : "is-flagged"}`} role="status">
            <i aria-hidden="true" />
            {isConsistent ? t.consistent : t.differ}
          </div>

          {showAdd ? (
            <div className="lm-field" style={{ marginTop: 12 }}>
              <label htmlFor="lm-aud" className="lm-label">{t.whoElse}</label>
              <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                <input id="lm-aud" className="lm-input" style={{ flex: "1 1 220px" }} placeholder={t.addPlaceholder} value={newAud} onChange={(e) => setNewAud(e.target.value)} />
                <button
                  className="lm-btn"
                  disabled={!newAud.trim() || addingAudience}
                  onClick={() => {
                    onAddAudience(newAud.trim());
                    setNewAud("");
                    setShowAdd(false);
                    setTab(drafts.length);
                  }}
                >
                  {addingAudience ? t.writing : t.writeDraft}
                </button>
              </div>
            </div>
          ) : null}

          {d ? (
            <div
              className="lm-anim lm-draft"
              id="lm-draft-panel"
              role="tabpanel"
              aria-labelledby={`lm-tab-${tab}`}
              style={delay(220)}
            >
              <div className="lm-draft-head">
                <span>{d.channel}</span>
                <span>{busy ? <span className="lm-pulse">{t.rewriting}</span> : fill(t.words, { count: words })}</span>
              </div>
              <div className="lm-draft-body-wrap" ref={bodyWrapRef}>
                <div key={d.id + d.body.length} className={`lm-draft-body lm-fade-swap ${busy ? "is-busy" : ""}`}>
                  {editing ? (
                    <textarea aria-label={t.editDraft} value={editText} onChange={(e) => setEditText(e.target.value)} />
                  ) : (
                    <>
                      {d.subject ? <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>{d.subject}</div> : null}
                      {d.body}
                    </>
                  )}
                </div>
              </div>
              <div className="lm-draft-foot">
                <div className="lm-chips">
                  {editing ? (
                    <>
                      <button
                        className="lm-chip"
                        onClick={() => {
                          onEditDraft(d.id, editText);
                          setEditing(false);
                        }}
                      >
                        {t.save}
                      </button>
                      <button className="lm-chip" onClick={() => setEditing(false)}>{t.cancel}</button>
                    </>
                  ) : (
                    <>
                      <button className="lm-chip" disabled={busy} onClick={() => onRewrite(d.id, "shorter")}>{t.shorter}</button>
                      <button className="lm-chip" disabled={busy} onClick={() => onRewrite(d.id, "more_direct")}>{t.moreDirect}</button>
                      <button
                        className="lm-chip"
                        disabled={busy}
                        onClick={() => {
                          setEditText(d.body);
                          setEditing(true);
                        }}
                      >
                        {t.edit}
                      </button>
                      {canUndo(d.id) ? <button className="lm-chip" disabled={busy} onClick={() => onUndo(d.id)}>{t.undo}</button> : null}
                    </>
                  )}
                </div>
                <button className={`lm-copy ${copied[d.id] ? "is-copied" : ""}`} onClick={copy} disabled={busy || editing}>
                  {copied[d.id] ? (
                    <>
                      <svg className="lm-copy-check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t.copiedBtn}
                    </>
                  ) : (
                    t.copy
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {d?.pushback?.length ? (
            <div className="lm-anim lm-pushback" style={delay(280)}>
              <div className="lm-label">{t.pushback}</div>
              <div className="lm-stack" style={{ marginTop: 10, gap: 10 }}>
                {d.pushback.map((p, i) => (
                  <div key={i} className="lm-pushback-item">
                    <div className="lm-pushback-objection">&ldquo;{p.objection}&rdquo;</div>
                    <div className="lm-pushback-response">{p.response}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="lm-mono lm-caption" style={{ marginTop: 16, fontSize: 12 }}>{fill(t.copiedCount, { copied: copiedCount, total: drafts.length })}</div>
        </>
      )}

      {error ? <div className="lm-error" role="alert">{error}</div> : null}

      <div className="lm-actions" style={{ marginTop: 36 }}>
        <button className="lm-btn" onClick={onFinish} disabled={loading || drafts.length === 0}>{t.fileDecision}</button>
        <button className="lm-link" onClick={onBack}>{t.back}</button>
      </div>
    </AppShell>
  );
}

/* ============ COMPLETION ============ */

export function CompleteScreen({
  aiStatus,
  initials,
  decisionNumber,
  call,
  confidence,
  audiences,
  gaveUp,
  revisitDate,
  decidedMinutes,
  onCopyRecord,
  recordCopied,
  onHome,
  onReview,
  isExample,
}: Shell & {
  decisionNumber: number;
  call: string;
  confidence: number;
  audiences: string[];
  gaveUp: string;
  revisitDate?: string;
  decidedMinutes?: number | null;
  onCopyRecord?: () => void;
  recordCopied?: boolean;
  onHome: () => void;
  onReview: () => void;
  isExample?: boolean;
}) {
  const t = useDict().app.complete;
  const revisitLabel = revisitDate
    ? new Date(`${revisitDate}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  if (isExample) {
    return (
      <AppShell aiStatus={aiStatus} initials={initials}>
        <div style={{ paddingTop: 32 }}>
          <h1 className="lm-anim lm-heading">{t.exampleTitle}</h1>
          <p className="lm-anim lm-sub" style={delay(80)}>{t.exampleSub}</p>
          <div className="lm-anim lm-actions" style={{ marginTop: 32, gap: 12, ...delay(160) }}>
            <button className="lm-btn" onClick={onHome}>{t.backHome}</button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell aiStatus={aiStatus} initials={initials}>
      <div style={{ paddingTop: 32 }}>
        <div className="lm-stamp lm-bignum">No.{decisionNumber}</div>
        <h1 className="lm-anim lm-heading" style={{ marginTop: 28, ...delay(700) }}>{t.filed}</h1>

        <div className="lm-anim lm-summary" style={delay(900)}>
          <div><span className="lm-label" style={{ paddingTop: 3 }}>{t.theDecision}</span><span style={{ fontWeight: 500 }}>{call}</span></div>
          <div><span className="lm-label" style={{ paddingTop: 3 }}>{t.confidence}</span><span className="lm-mono" style={{ fontSize: 14 }}>{fill(t.confidenceOf, { confidence })}</span></div>
          <div><span className="lm-label" style={{ paddingTop: 3 }}>{t.updates}</span><span>{audiences.join(", ")}</span></div>
          {decidedMinutes ? (
            <div><span className="lm-label" style={{ paddingTop: 3 }}>{t.decidedIn}</span><span className="lm-mono" style={{ fontSize: 14 }}>{fill(t.decidedMin, { minutes: decidedMinutes })}</span></div>
          ) : null}
          {revisitLabel ? (
            <div><span className="lm-label" style={{ paddingTop: 3 }}>{t.revisitOn}</span><span className="lm-mono" style={{ fontSize: 14 }}>{revisitLabel}</span></div>
          ) : null}
        </div>

        {gaveUp.trim() ? (
          <Signature delayMs={1400} style={{ marginTop: 36 }}>
            {fill(t.gaveUpLine, { gaveUp: lowerFirst(gaveUp) })}
          </Signature>
        ) : null}

        <div className="lm-anim lm-actions" style={{ marginTop: 44, gap: 12, ...delay(1800) }}>
          <button className="lm-btn" onClick={onHome}>{t.backHome}</button>
          <button className="lm-btn-sec" onClick={onReview}>{t.reviewDrafts}</button>
          {onCopyRecord ? (
            <button className="lm-link lm-record-copy" onClick={onCopyRecord}>
              {recordCopied ? (
                <>
                  <svg className="lm-copy-check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t.copiedBtn}
                </>
              ) : (
                t.copyHistory
              )}
            </button>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
