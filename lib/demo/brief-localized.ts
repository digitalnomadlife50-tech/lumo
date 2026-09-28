import type { Locale } from "@/lib/i18n/locales"
import type { DemoDecision, DecisionKind, MonthlyBrief } from "./types"
import { getDecisions } from "./localized"

/**
 * Locale-aware monthly brief. The numbers are computed once from the record
 * (identical across locales); only the surrounding sentences are translated.
 * Mirrors computeBrief in ./brief.ts but renders per-locale templates.
 */

const KIND_LABEL: Record<Locale, Record<DecisionKind, string>> = {
  en: {
    timing: "dates and deadlines",
    scope: "scope",
    hiring: "hiring",
    people: "people",
    vendor: "vendor",
    strategy: "strategy",
  },
  es: {
    timing: "fechas y plazos",
    scope: "alcance",
    hiring: "contratación",
    people: "personas",
    vendor: "proveedores",
    strategy: "estrategia",
  },
}

const NUMBER_WORDS: Record<Locale, string[]> = {
  en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  es: ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"],
}

const IF_THEN: Record<Locale, string> = {
  en: "When you give a customer a date, add your engineering lead's worst case first.",
  es: "Cuando le des una fecha a un cliente, suma primero el peor caso de tu líder de ingeniería.",
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function numberWord(locale: Locale, n: number) {
  const words = NUMBER_WORDS[locale]
  return words[n] ? capitalize(words[n]) : String(n)
}

interface BriefNumbers {
  strongLabel: string
  highConfTiming: number
  highConfTimingWorse: number
  supportAffected: number
  priyaTold: number
  total: number
}

function computeNumbers(decisions: DemoDecision[], locale: Locale): BriefNumbers {
  const withOutcomes = decisions.filter((d) => d.outcome)
  const kinds: DecisionKind[] = ["timing", "scope", "hiring", "people", "vendor", "strategy"]
  const labels = KIND_LABEL[locale]

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
  const strongLabel =
    strongKinds.length >= 2
      ? `${labels[strongKinds[0]]} ${locale === "es" ? "y" : "and"} ${labels[strongKinds[1]]}`
      : strong
        ? labels[strong.k]
        : labels.people

  const timing = withOutcomes.filter((d) => d.kind === "timing")
  const highConfTiming = timing.filter((d) => d.final.confidence >= 4)
  const highConfTimingWorse = highConfTiming.filter((d) => d.outcome.result === "worse")

  const supportAffected = decisions.filter((d) => d.supportAffected).length
  const priyaTold = decisions.filter((d) => d.audiencesTold.some((a) => a.toLowerCase().includes("priya"))).length

  return {
    strongLabel,
    highConfTiming: highConfTiming.length,
    highConfTimingWorse: highConfTimingWorse.length,
    supportAffected,
    priyaTold,
    total: decisions.length,
  }
}

export function computeBriefLocalized(locale: Locale, month: string): MonthlyBrief {
  const decisions = getDecisions(locale)
  const n = computeNumbers(decisions, locale)

  if (locale === "es") {
    return {
      month,
      strongAt: `Decisiones de ${n.strongLabel}. Han salido como esperabas, o mejor.`,
      runsOff: `Fechas y plazos. Tomaste ${n.highConfTiming} decisiones sobre fechas en las que calificaste tu confianza con 4 o 5 de 5. ${numberWord(locale, n.highConfTimingWorse)} de ellas salieron peor de lo que esperabas. Te sientes más seguro justo antes de que una fecha se mueva.`,
      ifThen: IF_THEN.es,
      didntNotice: `${n.supportAffected} de tus ${n.total} decisiones afectaron al equipo de soporte. Le contaste a Priya, de ese equipo, sobre ${n.priyaTold} de ellas.`,
    }
  }

  return {
    month,
    strongAt: `${capitalize(n.strongLabel)} decisions. These have turned out the way you expected, or better.`,
    runsOff: `Dates and deadlines. You made ${n.highConfTiming} decisions about dates where you rated your confidence 4 or 5 out of 5. ${numberWord(locale, n.highConfTimingWorse)} of them turned out worse than you expected. You feel most certain right before a date moves.`,
    ifThen: IF_THEN.en,
    didntNotice: `${n.supportAffected} of your ${n.total} decisions affected the support team. You told Priya on that team about ${n.priyaTold} of them.`,
  }
}
