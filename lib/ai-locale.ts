import type { Locale } from "@/lib/i18n/locales"

/**
 * Resolve the locale an AI route should respond in. The client sends its active
 * locale; anything unrecognized falls back to English so a bad or missing value
 * never changes behavior.
 */
export function resolveAiLocale(value: unknown): Locale {
  return value === "es" ? "es" : "en"
}

/**
 * Instruction appended to the system prompt so the model writes every
 * human-readable field in the user's language. Structured enums (kind,
 * costLevel, reversible) stay in English because the UI maps them to labels.
 */
export function aiLanguageInstruction(locale: Locale): string {
  if (locale === "es") {
    return "Write every human-readable field (names, descriptions, summaries, questions, observations, drafts, subjects, pushback, risks, costs) in natural, professional, neutral Latin American Spanish (es-419). Address the reader consistently with tú, never vos or usted. Do not use em dashes, en dashes, or dash punctuation. Do not use inverted or closing exclamation marks. Never use the phrases \"vamos a\" or \"hagamos\". Keep PM terms in English, including roadmap, launch, scope, stakeholder, and sprint. Keep enum fields (kind, costLevel, reversible) and any verbatim source quotes exactly as they appear in the user's text."
  }
  return "Write every human-readable field in natural, professional English. Keep enum fields (kind, costLevel, reversible) and any verbatim source quotes exactly as they appear in the user's text."
}
