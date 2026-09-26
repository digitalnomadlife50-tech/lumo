import type { DemoDecision, DecisionKind, IfThenPlan, MonthlyBrief } from "./types"

export const IF_THEN_PLANS: IfThenPlan[] = [
  {
    id: "customer-date",
    cueKind: "timing",
    cueKeywords: ["date", "customer", "commit", "ship", "launch", "deadline"],
    text: "When you give a customer a date, add Marco's worst case first.",
  },
  {
    id: "tell-support",
    cueKind: "scope",
    cueKeywords: ["sunset", "migration", "change", "notification"],
    text: "When a change touches how customers get notified, tell Priya before it ships.",
  },
]

const KIND_LABEL: Record<DecisionKind, string> = {
  timing: "timing",
  scope: "scope",
  hiring: "hiring",
  people: "people",
  vendor: "vendor",
  strategy: "strategy",
}

function countBy(decisions: DemoDecision[], kind: DecisionKind) {
  return decisions.filter((d) => d.kind === kind)
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

  // Where it runs off: high-confidence timing calls that turned out worse.
  const timing = countBy(withOutcomes, "timing")
  const highConfTiming = timing.filter((d) => d.final.confidence >= 4)
  const highConfTimingWorse = highConfTiming.filter((d) => d.outcome.result === "worse")

  // Something you might not have noticed: support over the last 20, Priya told count.
  const last20 = [...decisions].sort((a, b) => b.number - a.number).slice(0, 20)
  const supportAffected = last20.filter((d) => d.supportAffected).length
  const priyaTold = last20.filter((d) => d.audiencesTold.some((a) => a.toLowerCase().includes("priya"))).length

  return {
    month,
    strongAt: `Your ${strongLabel} calls hold up. When you decide who works on what, and who to bring on, the results land where you expected or better.`,
    runsOff: `Timing is where it runs off. Of your ${highConfTiming.length} high-confidence timing calls, ${highConfTimingWorse.length} turned out worse than expected. You feel most sure right before a date slips.`,
    ifThen: IF_THEN_PLANS[0].text,
    didntNotice: `Support was affected in ${supportAffected} of your last 20 decisions. Priya was told in ${priyaTold}.`,
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
