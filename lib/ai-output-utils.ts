import "server-only"

export const HUMAN_WRITING_RULES = `
Write like a sharp senior product manager talking to colleagues. Use plain, direct, specific language and short sentences. Use actual names, teams, dates, and numbers from the user's situation instead of general statements.

Never use em dashes or en dashes as punctuation. Use a comma or period instead. Never use exclamation points, semicolons, or emojis. Avoid filler openers or closers such as "Great question," "Certainly," "I hope this helps," "Let me know if you have any questions," or "Happy to discuss." Avoid these words and phrases: delve, navigate, leverage, robust, seamless, streamline, landscape, crucial, pivotal, holistic, synergy, unlock, empower, game-changer, "it's important to note," "at the end of the day," "in today's fast-paced world," "moving forward," "let's," and "we'll." Do not use the construction "it's not just X, it's Y." Do not list three points when one or two are enough. Avoid stacked hedges such as "it may potentially be worth considering." Do not use markdown formatting, bold, or headers inside drafted messages.

Drafted messages should read like something a senior PM would send after a light edit. Match the audience: brief and outcome-first for executives, concrete and technical for engineering, and customer-impact-first for sales and support.`

export function cleanAIText(text: string): string {
  return text
    .replace(/\s*([—–])\s*/g, (dashWithSpacing, _dash, index, source: string) => {
      const before = source.slice(0, index).trimEnd().slice(-1)
      const after = source.slice(index + dashWithSpacing.length).trimStart().charAt(0)
      if (/\d/.test(before) && /\d/.test(after)) return dashWithSpacing
      return ", "
    })
    .replace(/!/g, "")
}

export function cleanAIValue<T>(value: T): T {
  if (typeof value === "string") return cleanAIText(value) as T
  if (Array.isArray(value)) return value.map((item) => cleanAIValue(item)) as T
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cleanAIValue(item)])
    ) as T
  }
  return value
}

function redactSensitiveText(text: string): string {
  const secrets = [process.env.ANTHROPIC_API_KEY, process.env.API_KEY].filter(
    (secret): secret is string => Boolean(secret)
  )
  let safeText = text
  for (const secret of secrets) safeText = safeText.split(secret).join("[REDACTED]")
  return safeText
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[REDACTED]")
    .replace(/(?:authorization|x-api-key|anthropic-version|headers?)\s*[:=][^\r\n]*/gi, "[request header redacted]")
}

export function safeAIErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return redactSensitiveText(message)
}

export function safeRawModelOutput(value: unknown): string | null {
  if (value === null || value === undefined) return null
  let raw: string
  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value)
    raw = typeof serialized === "string" ? serialized : String(value)
  } catch {
    raw = String(value)
  }
  return redactSensitiveText(raw).slice(0, 1500)
}

export function getAnthropicErrorMetadata(error: unknown): {
  status: number | null
  requestId: string | null
  message: string
} {
  const record = error && typeof error === "object" ? error as Record<string, unknown> : {}
  const status = typeof record.status === "number" ? record.status : null
  const requestId = [record.request_id, record.requestId, record._request_id].find(
    (candidate): candidate is string => typeof candidate === "string"
  ) ?? null
  return {
    status,
    requestId,
    message: safeAIErrorMessage(error),
  }
}
