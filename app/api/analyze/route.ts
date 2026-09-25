import Anthropic from "@anthropic-ai/sdk"
import { ANTHROPIC_MODEL } from "@/lib/anthropic-model"
import { cleanAIValue, getAnthropicErrorMetadata, HUMAN_WRITING_RULES, safeAIErrorMessage, safeRawModelOutput } from "@/lib/ai-output-utils"
import type { AIAttemptDiagnostic, AIDiagnostics } from "@/lib/ai-debug-config"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const maxDuration = 60

interface AnalyzeRequest {
  situation: string
  urgency: string
}

export interface AnalysisResult {
  realQuestion: string
  whatMatters: string
  whoIsAffected: string
  howPressing: string
  options: Array<{
    name: string
    description: string
    cost: string
  }>
  observations: string[]
}

const analysisTool: Anthropic.Tool = {
  name: "provide_decision_analysis",
  description: "Return the structured analysis for the product manager's decision.",
  input_schema: {
    type: "object",
    properties: {
      realQuestion: { type: "string" },
      whatMatters: { type: "string" },
      whoIsAffected: { type: "string" },
      howPressing: { type: "string" },
      options: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            cost: { type: "string" },
          },
          required: ["name", "description", "cost"],
          additionalProperties: false,
        },
      },
      observations: { type: "array", items: { type: "string" } },
    },
    required: ["realQuestion", "whatMatters", "whoIsAffected", "howPressing", "options", "observations"],
    additionalProperties: false,
  },
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false
  const result = value as Record<string, unknown>
  return (
    typeof result.realQuestion === "string" &&
    typeof result.whatMatters === "string" &&
    typeof result.whoIsAffected === "string" &&
    typeof result.howPressing === "string" &&
    Array.isArray(result.options) &&
    result.options.length >= 2 &&
    result.options.length <= 3 &&
    result.options.every((option) =>
      option &&
      typeof option === "object" &&
      typeof option.name === "string" &&
      typeof option.description === "string" &&
      typeof option.cost === "string"
    ) &&
    Array.isArray(result.observations) &&
    result.observations.every((observation) => typeof observation === "string")
  )
}

export async function POST(req: Request) {
  const requestStartedAt = Date.now()

  // ─── Check for API key ──────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    const error = "ANTHROPIC_API_KEY is not configured."
    const diagnostics: AIDiagnostics = {
      step: "Analyze decision context",
      route: "/api/analyze",
      httpStatus: 500,
      stage: "request to Anthropic",
      exactErrorMessage: error,
      model: ANTHROPIC_MODEL,
      anthropicRequestId: null,
      retryRan: false,
      retryResult: "Retry not run because the API key is not configured",
      timeTakenMs: Date.now() - requestStartedAt,
      rawModelOutput: null,
      attempts: [],
    }
    return Response.json(
      { success: false, error: "API not configured. Please set ANTHROPIC_API_KEY.", errorCode: "SERVER_ERROR", diagnostics },
      { status: 500 }
    )
  }

  // ─── Rate limit ─────────────────────────────────────────────────────────────
  const ip = getClientIp(req)

  const rl = await checkRateLimit("analyze", ip)
  if (!rl.allowed) {
    return Response.json(
      { success: false, error: `Rate limit exceeded. Try again in ${rl.retryAfter} seconds.`, errorCode: "RATE_LIMIT" },
      { status: 429 }
    )
  }

  try {
    const body: AnalyzeRequest = await req.json()
    const { situation, urgency } = body

    if (!situation || situation.trim().length < 10) {
      return Response.json(
        { success: false, error: "Please describe your situation in more detail.", errorCode: "INVALID_INPUT" },
        { status: 400 }
      )
    }

    const systemPrompt = `You are Lumo, a decision-structuring tool for Senior Product Managers. Read the user's situation and produce specific, useful analysis. Reframe the core decision in one sentence; explain the key tensions in 2-3 sentences; identify affected stakeholders and why; explain timeline implications based on urgency; suggest 2-3 realistic options with a short name, one-sentence description, and costs or risks; and offer subtle observations the user may have missed. Avoid generic options unless they genuinely apply. Provide the result through the required structured analysis tool.\n\n${HUMAN_WRITING_RULES}`

    const userPrompt = `USER'S SITUATION: ${situation}
URGENCY: ${urgency || "Not specified"}

Analyze this situation specifically.`

    const attempts: AIAttemptDiagnostic[] = []
    let result: AnalysisResult | null = null
    let lastFailure: Omit<AIAttemptDiagnostic, "attempt" | "result"> & { result: string } | null = null

    for (let attempt = 1; attempt <= 2 && !result; attempt++) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const response = await anthropic.messages.create({
          model: ANTHROPIC_MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          tools: [analysisTool],
          tool_choice: { type: "tool", name: analysisTool.name },
        })
        const requestId = response._request_id ?? null
        const toolResult = response.content.find(
          (block): block is Anthropic.ToolUseBlock =>
            block.type === "tool_use" && block.name === analysisTool.name
        )

        if (!toolResult) {
          const rawModelOutput = safeRawModelOutput(response.content
            .filter((block): block is Anthropic.TextBlock => block.type === "text")
            .map((block) => block.text)
            .join("\n"))
          lastFailure = {
            stage: "model returned no tool output",
            httpStatus: 200,
            requestId,
            errorMessage: "Anthropic returned a response without the required structured analysis tool output.",
            rawModelOutput,
            result: "No required tool output returned",
          }
          attempts.push({ attempt, ...lastFailure })
          continue
        }

        if (!isAnalysisResult(toolResult.input)) {
          lastFailure = {
            stage: "output didn't match the expected shape",
            httpStatus: 200,
            requestId,
            errorMessage: "The structured analysis tool output was missing required fields or had incorrect field types.",
            rawModelOutput: safeRawModelOutput(toolResult.input),
            result: "Tool output did not match expected shape",
          }
          attempts.push({ attempt, ...lastFailure })
          continue
        }

        result = cleanAIValue(toolResult.input)
      } catch (error) {
        const metadata = getAnthropicErrorMetadata(error)
        lastFailure = {
          stage: metadata.status === null ? "request to Anthropic" : "Anthropic returned an error",
          httpStatus: metadata.status,
          requestId: metadata.requestId,
          errorMessage: metadata.message,
          rawModelOutput: null,
          result: metadata.status === null ? "Request to Anthropic failed" : `Anthropic returned HTTP ${metadata.status}`,
        }
        attempts.push({ attempt, ...lastFailure })
      }
    }

    if (!result && lastFailure) {
      const routeStatus = lastFailure.stage === "Anthropic returned an error" && lastFailure.httpStatus !== null && lastFailure.httpStatus >= 400 && lastFailure.httpStatus <= 599
        ? lastFailure.httpStatus
        : 502
      const diagnostics: AIDiagnostics = {
        step: "Analyze decision context",
        route: "/api/analyze",
        httpStatus: routeStatus,
        stage: lastFailure.stage,
        exactErrorMessage: safeAIErrorMessage(lastFailure.errorMessage),
        model: ANTHROPIC_MODEL,
        anthropicRequestId: lastFailure.requestId,
        retryRan: attempts.length > 1,
        retryResult: attempts[1]?.result ?? "Retry not run",
        timeTakenMs: Date.now() - requestStartedAt,
        rawModelOutput: lastFailure.rawModelOutput,
        attempts,
      }
      const lowerError = diagnostics.exactErrorMessage.toLowerCase()
      const errorCode = lastFailure.stage === "output didn't match the expected shape" || lastFailure.stage === "model returned no tool output"
        ? "INVALID_RESPONSE"
        : lowerError.includes("quota") || lowerError.includes("billing") || lowerError.includes("credit")
          ? "QUOTA_EXCEEDED"
          : routeStatus === 429
            ? "ANTHROPIC_RATE_LIMITED"
            : "SERVER_ERROR"
      const error = errorCode === "QUOTA_EXCEEDED"
        ? "Lumo is busier than usual right now."
        : errorCode === "ANTHROPIC_RATE_LIMITED"
          ? "Lumo is at capacity. Try again in 30 seconds."
          : errorCode === "INVALID_RESPONSE"
            ? "We couldn't generate a complete analysis after two attempts. Please try again."
            : diagnostics.exactErrorMessage
      return Response.json({ success: false, error, errorCode, diagnostics }, { status: routeStatus })
    }

    return Response.json({
      success: true,
      analysis: result,
    })
  } catch (err) {
    console.error("[lumo/analyze] Error:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    
    // Check for quota exceeded errors
    if (message.toLowerCase().includes("quota") || message.toLowerCase().includes("billing") || message.toLowerCase().includes("credit")) {
      return Response.json(
        { success: false, error: "Lumo is busier than usual right now.", errorCode: "QUOTA_EXCEEDED" },
        { status: 429 }
      )
    }
    
    // Check for Anthropic rate limit errors
    if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
      return Response.json(
        { success: false, error: "Lumo is at capacity. Try again in 30 seconds.", errorCode: "ANTHROPIC_RATE_LIMITED" },
        { status: 429 }
      )
    }
    
    return Response.json(
      { success: false, error: message, errorCode: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}
