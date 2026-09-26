import type { DemoDecision, DecisionKind, IfThenPlan, MonthlyBrief } from "./types"

export const IF_THEN_PLANS: IfThenPlan[] = [
  {
    id: "customer-date",
    cueKind: "timing",
    cueKeywords: ["date", "customer", "commit", "ship", "launch", "deadline"],
    text: "When you give a customer a date, add your engineering lead's worst case first.",
  },
  {
    id: "tell-support",
    cueKind: "scope",
    cueKeywords: ["sunset", "migration", "change", "notification"],
    text: "When a change touches how customers get notified, tell Priya before it ships.",
  },
]

const KIND_LABEL: Record<DecisionKind, string> = {
  timing: "dates and deadlines",
  scope: "scope",
  hiring: "hiring",
  people: "people",
  vendor: "vendor",
  strategy: "strategy",
}

function countBy(decisions: DemoDecision[], kind: DecisionKind) {
  return decisions.filter((d) => d.kind === kind)
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Compute the month's brief straight from the data so every number matches. */
export function computeBrief(decisions: DemoDecision[], month: string): MonthlyBrief {
  const withOutcomes = decisions.filter((d) => d.outcome)

  // Where the instinct is strong: kind with the best better/as-expected rate (min 3 samples).
  const kinds: DecisionKind[] = ["timing", "scope", "hiring", "people", "vendor", "strategy"]
  const scored = kinds
    .map((k) => {
      const rows = withOutcomes.filter((d) => d.kind === k)
      const good = rows.filter((d) => d.outcome.result !== "worse").length
      return { k, n: rows.length, rate: rows.length ? good / rows.length : 0 }
    })
    .filter((s) => s.n >= 3)

  const strong = [...scored].sort((a, b) => b.rate - a.rate)[0]
  const strongKinds = strong
    ? kinds.filter((k) => {
        const rows = withOutcomes.filter((d) => d.kind === k)
        const good = rows.filter((d) => d.outcome.result !== "worse").length
        return rows.length >= 3 && good / rows.length >= strong.rate - 0.01
      })
    : []
  const strongLabel = strongKinds.length >= 2
    ? `${KIND_LABEL[strongKinds[0]]} and ${KIND_LABEL[strongKinds[1]]}`
    : strong
      ? KIND_LABEL[strong.k]
      : "people"

  // Where the instinct is off: high-confidence date calls that turned out worse.
  const timing = countBy(withOutcomes, "timing")
  const highConfTiming = timing.filter((d) => d.final.confidence >= 4)
  const highConfTimingWorse = highConfTiming.filter((d) => d.outcome.result === "worse")

  // Something you might not have noticed: support across the whole record.
  const supportAffected = decisions.filter((d) => d.supportAffected).length
  const priyaTold = decisions.filter((d) => d.audiencesTold.some((a) => a.toLowerCase().includes("priya"))).length

  return {
    month,
    strongAt: `${capitalize(strongLabel)} decisions. They turn out as expected or better.`,
    runsOff: `Dates and deadlines. Of your ${highConfTiming.length} decisions about dates and deadlines rated 4 or 5 for confidence, ${highConfTimingWorse.length} turned out worse than expected. You feel most sure right before a deadline moves.`,
    ifThen: IF_THEN_PLANS[0].text,
    didntNotice: `Support was affected in ${supportAffected} of your ${decisions.length} decisions. Priya (Support) was told in ${priyaTold}.`,
  }
}

/** Does a decision kind and title match a saved if-then plan's cue. */
export function matchPlan(kind: DecisionKind, text: string, plans: IfThenPlan[] = IF_THEN_PLANS): IfThenPlan | null {
  const lower = text.toLowerCase()
  for (const plan of plans) {
    if (plan.cueKind !== kind) continue
    if (plan.cueKeywords.some((kw) => lower.includes(kw))) return plan
  }
  return null
}
