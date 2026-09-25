export const SHOW_DEBUG_PANEL = true

export type AIFailureStage =
  | "request to Anthropic"
  | "Anthropic returned an error"
  | "model returned no tool output"
  | "output didn't match the expected shape"

export interface AIAttemptDiagnostic {
  attempt: number
  result: string
  stage: AIFailureStage
  httpStatus: number | null
  requestId: string | null
  errorMessage: string
  rawModelOutput: string | null
}

export interface AIDiagnostics {
  step: string
  route: string
  httpStatus: number
  stage: AIFailureStage
  exactErrorMessage: string
  model: string
  anthropicRequestId: string | null
  retryRan: boolean
  retryResult: string
  timeTakenMs: number
  rawModelOutput: string | null
  attempts: AIAttemptDiagnostic[]
}

export function isAIDiagnostics(value: unknown): value is AIDiagnostics {
  if (!value || typeof value !== "object") return false
  const item = value as Partial<AIDiagnostics>
  return (
    typeof item.step === "string" &&
    typeof item.route === "string" &&
    typeof item.httpStatus === "number" &&
    typeof item.exactErrorMessage === "string" &&
    typeof item.model === "string" &&
    typeof item.timeTakenMs === "number" &&
    Array.isArray(item.attempts)
  )
}

export function formatAIDiagnostics(diagnostics: AIDiagnostics): string {
  const lines = [
    `Step: ${diagnostics.step}`,
    `API route: ${diagnostics.route}`,
    `HTTP status: ${diagnostics.httpStatus}`,
    `Failure stage: ${diagnostics.stage}`,
    `Exact error: ${diagnostics.exactErrorMessage}`,
    `Model: ${diagnostics.model}`,
    `Anthropic request ID: ${diagnostics.anthropicRequestId ?? "not available"}`,
    `Retry ran: ${diagnostics.retryRan ? "yes" : "no"}`,
    `Retry result: ${diagnostics.retryResult}`,
    `Time taken: ${diagnostics.timeTakenMs} ms`,
    `Raw model output (first 1500 characters):\n${diagnostics.rawModelOutput ?? "not available"}`,
    "Attempt details:",
    ...diagnostics.attempts.map((attempt) => [
      `  Attempt ${attempt.attempt}: ${attempt.result}`,
      `    Stage: ${attempt.stage}`,
      `    Anthropic HTTP status: ${attempt.httpStatus ?? "not available"}`,
      `    Request ID: ${attempt.requestId ?? "not available"}`,
      `    Error: ${attempt.errorMessage}`,
      `    Raw model output: ${attempt.rawModelOutput ?? "not available"}`,
    ].join("\n")),
  ]
  return lines.join("\n")
}
