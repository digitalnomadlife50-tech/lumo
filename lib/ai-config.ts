export const SHOW_DEBUG_PANEL = true

export type AIFailureStage =
  | "request_to_anthropic"
  | "anthropic_returned_error"
  | "model_returned_no_tool_output"
  | "output_shape_mismatch"

export interface AIAttemptDiagnostic {
  attempt: number
  stage: AIFailureStage | "success"
  httpStatus?: number
  errorMessage?: string
  requestId?: string
  rawModelOutput?: string
}

export interface AIDiagnostic {
  step: "analyze" | "decide"
  route: "/api/analyze" | "/api/decide"
  httpStatus: number
  stage: AIFailureStage
  errorMessage: string
  model: string
  requestId?: string
  retryRan: boolean
  retryResult: string
  durationMs: number
  rawModelOutput?: string
  attempts: AIAttemptDiagnostic[]
}

export function formatAIDiagnostic(diagnostic: AIDiagnostic): string {
  return [
    `Step: ${diagnostic.step}`,
    `API route: ${diagnostic.route}`,
    `HTTP status: ${diagnostic.httpStatus}`,
    `Failure stage: ${diagnostic.stage}`,
    `Error: ${diagnostic.errorMessage}`,
    `Model: ${diagnostic.model}`,
    `Anthropic request ID: ${diagnostic.requestId ?? "Not provided"}`,
    `Retry ran: ${diagnostic.retryRan ? "Yes" : "No"}`,
    `Retry result: ${diagnostic.retryResult}`,
    `Time taken: ${diagnostic.durationMs} ms`,
    `Raw model output (up to 1500 chars):\n${diagnostic.rawModelOutput ?? "Not available"}`,
    `Attempts:\n${diagnostic.attempts.map((attempt) => JSON.stringify(attempt, null, 2)).join("\n")}`,
  ].join("\n\n")
}

export function cleanAIText(text: string): string {
  const chars = Array.from(text)
  let output = ""

  for (let index = 0; index < chars.length; index++) {
    const char = chars[index]
    if (char === "!") continue

    if (char === "—" || char === "–") {
      const previous = chars[index - 1] ?? ""
      const next = chars[index + 1] ?? ""
      if (/\d/.test(previous) && /\d/.test(next)) {
        output += char
        continue
      }

      output = output.replace(/\s+$/, "")
      output += ", "
      while (/\s/.test(chars[index + 1] ?? "")) index++
      continue
    }

    output += char
  }

  return output.replace(/[ \t]+([,.;:?])/g, "$1").replace(/([,.;:?])(?=\S)/g, "$1 ").trim()
}

export function cleanAIValue<T>(value: T): T {
  if (typeof value === "string") return cleanAIText(value) as T
  if (Array.isArray(value)) return value.map((item) => cleanAIValue(item)) as T
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, cleanAIValue(item)])
    ) as T
  }
  return value
}

export function cleanDiagnostic(diagnostic: AIDiagnostic): AIDiagnostic {
  return cleanAIValue(diagnostic)
}

export function redactDiagnosticText(text: string): string {
  let safeText = text
  for (const secret of [process.env.ANTHROPIC_API_KEY, process.env.API_KEY]) {
    if (secret) safeText = safeText.split(secret).join("[redacted]")
  }

  return safeText
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/(?:authorization|x-api-key|api-key|anthropic-version)\s*[:=]\s*[^\r\n]+/gi, "[request header redacted]")
    .replace(/\*{4,}\s*[A-Z][A-Z0-9_]{2,}/g, "[redacted variable]")
}

export function excerptModelOutput(text: string): string | undefined {
  const excerpt = redactDiagnosticText(text).slice(0, 1500)
  return excerpt || undefined
}

export function buildDiagnosticText(diagnostic: AIDiagnostic): string {
  return formatAIDiagnostic(diagnostic)
}

export function attachDiagnosticToResponse(
  diagnostic: AIDiagnostic,
  status: number
): AIDiagnostic {
  return cleanDiagnostic({ ...diagnostic, httpStatus: status })
}

export function isDebugPanelEnabled(): boolean {
  return SHOW_DEBUG_PANEL
}

export function diagnosticFailureCopy(stage: AIFailureStage): string {
  if (stage === "model_returned_no_tool_output") return "The AI response did not include the expected structured output. Please try again."
  if (stage === "output_shape_mismatch") return "The AI response was incomplete. Please try again."
  return "The AI service could not complete the request. Please try again."
}

export function diagnosticErrorCode(stage: AIFailureStage, errorMessage: string): string {
  const message = errorMessage.toLowerCase()
  if (message.includes("quota") || message.includes("billing") || message.includes("credit")) return "QUOTA_EXCEEDED"
  if (message.includes("429") || message.includes("rate limit")) return "ANTHROPIC_RATE_LIMITED"
  if (stage === "model_returned_no_tool_output" || stage === "output_shape_mismatch") return "INVALID_RESPONSE"
  return "SERVER_ERROR"
}

export function diagnosticHttpStatus(stage: AIFailureStage, upstreamStatus?: number): number {
  if (upstreamStatus === 429) return 429
  if (stage === "model_returned_no_tool_output" || stage === "output_shape_mismatch") return 502
  return 502
}

export function publicDiagnosticError(errorMessage: string): string {
  return redactDiagnosticText(errorMessage)
}

export function rawOutputForDiagnostic(text: string): string | undefined {
  return excerptModelOutput(text)
}

export function retrySummary(attempts: AIAttemptDiagnostic[]): string {
  const retry = attempts.find((attempt) => attempt.attempt === 2)
  if (!retry) return "Not run"
  if (retry.stage === "success") return "Succeeded with valid structured output"
  return `Failed at ${retry.stage}${retry.httpStatus ? ` (HTTP ${retry.httpStatus})` : ""}: ${retry.errorMessage ?? "No error details"}`
}

export function latestAttempt(attempts: AIAttemptDiagnostic[]): AIAttemptDiagnostic {
  return attempts[attempts.length - 1]
}

export function attemptRawOutput(attempt: AIAttemptDiagnostic): string | undefined {
  return attempt.rawModelOutput
}

export function diagnosticRequestId(attempts: AIAttemptDiagnostic[]): string | undefined {
  return latestAttempt(attempts).requestId
}

export function diagnosticRoute(step: "analyze" | "decide"): "/api/analyze" | "/api/decide" {
  return step === "analyze" ? "/api/analyze" : "/api/decide"
}

export function aiErrorMessage(error: unknown): string {
  if (error instanceof Error) return redactDiagnosticText(error.message)
  return redactDiagnosticText(String(error))
}

export function isAIFailureStage(value: string): value is AIFailureStage {
  return value === "request_to_anthropic" || value === "anthropic_returned_error" || value === "model_returned_no_tool_output" || value === "output_shape_mismatch"
}

export function httpStatusFromError(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined
  const status = (error as { status?: unknown }).status
  return typeof status === "number" ? status : undefined
}

export function requestIdFromError(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined
  const item = error as { request_id?: unknown; requestId?: unknown }
  const requestId = item.request_id ?? item.requestId
  return typeof requestId === "string" ? requestId : undefined
}

export function safeRawModelOutput(text: string): string | undefined {
  return excerptModelOutput(text)
}

export function cleanAIResponse<T>(result: T): T {
  return cleanAIValue(result)
}

export function modelOutputText(blocks: Array<{ type: string; text?: string }>): string {
  return blocks.filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n")
}

export function hasSensitiveHeader(text: string): boolean {
  return /(?:authorization|x-api-key|api-key|anthropic-version)\s*[:=]/i.test(text)
}

export function safeDiagnostic(diagnostic: AIDiagnostic): AIDiagnostic {
  return cleanDiagnostic(diagnostic)
}

export function systemWritingRules(): string {
  return `Write like a sharp senior product manager talking to colleagues. Plain, direct, and specific. Use short sentences. Use actual names, teams, dates, and numbers from the user's situation. Never use em dashes or en dashes as punctuation. Do not use exclamation points, semicolons, or emojis. Do not use filler openers or closers such as "Great question," "Certainly," "I hope this helps," "Let me know if you have any questions," or "Happy to discuss." Avoid these words and phrases: delve, navigate, leverage, robust, seamless, streamline, landscape, crucial, pivotal, holistic, synergy, unlock, empower, game-changer, "it's important to note," "at the end of the day," "in today's fast-paced world," "moving forward," "let's," and "we'll." Do not use the "it's not just X, it's Y" construction. Avoid lists of three when one or two points are enough, hedging stacks, and markdown formatting such as bold or headers inside drafted messages. Draft messages should read like a senior PM wrote them after a light edit. Match the audience: brief and outcome-first for executives, concrete and technical for engineering, and customer-impact-first for sales and support.`
}
