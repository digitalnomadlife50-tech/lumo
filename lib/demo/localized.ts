import type { Locale } from "@/lib/i18n/locales"
import type { CurrentDecision, DemoDecision, DemoPersona } from "./types"
import { PERSONA } from "./persona"
import { DEMO_DECISIONS } from "./decisions"
import { CURRENT_DECISION } from "./current"
import { PERSONA_ES } from "./es/persona"
import { CURRENT_DECISION_ES } from "./es/current"
import { DECISIONS_TEXT_ES } from "./es/decisions"

/**
 * Locale-aware access to the demo dataset. English is the canonical record
 * (metadata: kind, stakes, confidences, results, dates). Spanish overrides the
 * human-written text fields by decision number, merged over the English base so
 * every number, kind, and outcome stays identical across locales.
 */

export function getPersona(locale: Locale): DemoPersona {
  return locale === "es" ? PERSONA_ES : PERSONA
}

export function getCurrentDecision(locale: Locale): CurrentDecision {
  return locale === "es" ? CURRENT_DECISION_ES : CURRENT_DECISION
}

export function getDecisions(locale: Locale): DemoDecision[] {
  if (locale !== "es") return DEMO_DECISIONS
  return DEMO_DECISIONS.map((d) => {
    const t = DECISIONS_TEXT_ES[d.number]
    if (!t) return d
    return {
      ...d,
      title: t.title,
      options: t.options,
      gut: { ...d.gut, option: t.gutOpt, worry: t.worry },
      final: { ...d.final, option: t.finalOpt, why: t.why, gaveUp: t.gaveUp },
      tripwire: t.tripwire,
      outcome: { ...d.outcome, whatHappened: t.whatHappened, lesson: t.lesson },
    }
  })
}
