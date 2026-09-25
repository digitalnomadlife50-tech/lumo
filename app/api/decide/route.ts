import Anthropic from "@anthropic-ai/sdk"
import { ANTHROPIC_MODEL } from "@/lib/anthropic-model"
import { cleanAIValue, getAnthropicErrorMetadata, HUMAN_WRITING_RULES, safeAIErrorMessage, safeRawModelOutput } from "@/lib/ai-output-utils"
import type { AIAttemptDiagnostic, AIDiagnostics } from "@/lib/ai-debug-config"

export const maxDuration = 60

// ─── Simple in-memory IP rate limiter (10 req / IP / hour) ───────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const limit = 10

  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  entry.count++
  return { allowed: true }
}

interface DecideRequest {
  situation: string
  urgency: string
  chosenDirection: string
  reasoning: string
  confidence: number
}

interface DecideResult {
  claritySummary: string
  messages: {
    engineering: string
    design: string
    leadership: string
  }
}

const decisionMessagesTool: Anthropic.Tool = {
  name: "provide_decision_messages",
  description: "Return a decision clarity summary and three audience-specific messages.",
  input_schema: {
    type: "object",
    properties: {
      claritySummary: { type: "string" },
      messages: {
        type: "object",
        properties: {
          engineering: { type: "string" },
          design: { type: "string" },
          leadership: { type: "string" },
        },
        required: ["engineering", "design", "leadership"],
        additionalProperties: false,
      },
    },
    required: ["claritySummary", "messages"],
    additionalProperties: false,
  },
}

function isDecideResult(value: unknown): value is DecideResult {
  if (!value || typeof value !== "object") return false
  const result = value as Record<string, unknown>
  if (!result.messages || typeof result.messages !== "object") return false
  const messages = result.messages as Record<string, unknown>
  return (
    typeof result.claritySummary === "string" &&
    typeof messages.engineering === "string" &&
    typeof messages.design === "string" &&
    typeof messages.leadership === "string"
  )
}

export async function POST(req: Request) {
  const requestStartedAt = Date.now()

  // ─── Check for API key ──────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    const error = "ANTHROPIC_API_KEY is not configured."
    const diagnostics: AIDiagnostics = {
      step: "Draft decision messages",
      route: "/api/decide",
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
      {
        success: false,
        errorCode: "SERVER_ERROR",
        error: "API not configured. Please set ANTHROPIC_API_KEY.",
        diagnostics,
      },
      { status: 500 }
    )
  }

  // ─── Rate limit ─────────────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  const rl = checkRateLimit(ip)
  if (!rl.allowed) {
    return Response.json(
      {
        success: false,
        errorCode: "RATE_LIMITED",
        error:
          "You've used Lumo a lot today. Try again in an hour or see the example output instead.",
        retryAfter: rl.retryAfter,
      },
      { status: 429 }
    )
  }

  try {
    const body: DecideRequest = await req.json()
    const { situation, urgency, chosenDirection, reasoning, confidence } = body

    const systemPrompt = `You are Lumo, a tool for thoughtful Senior Product Managers. Create a first-person clarity summary in 2-3 sentences that names the decision, tradeoff, and why the chosen direction fits the user's reasoning. Then draft three specific messages, each under 80 words: engineering (scope, technical tradeoffs, implementation implications), design (user impact, UX implications, invite input), and leadership (outcome, identified risk, and a concrete ask). Every message should name the timeline and why it matters, the specific chosen direction, and the user's reasoning. Provide the result through the required structured communication tool.\n\n${HUMAN_WRITING_RULES}`

    const userPrompt = `USER'S DECISION CONTEXT:
What's happening: ${situation || "Not provided"}
Timeline/urgency: ${urgency || "Not specified"}
The direction they chose: ${chosenDirection || "Not provided"}
Why they chose it: ${reasoning || "Not provided"}
How confident they feel: ${confidence}/10

Tailor each message to its audience and reference the user's actual context.`

    const attempts: AIAttemptDiagnostic[] = []
    let result: DecideResult | null = null
    let lastFailure: Omit<AIAttemptDiagnostic, "attempt" | "result"> & { result: string } | null = null

    for (let attempt = 1; attempt <= 2 && !result; attempt++) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const response = await anthropic.messages.create({
          model: ANTHROPIC_MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          tools: [decisionMessagesTool],
          tool_choice: { type: "tool", name: decisionMessagesTool.name },
        })
        const requestId = response._request_id ?? null
        const toolResult = response.content.find(
          (block): block is Anthropic.ToolUseBlock =>
            block.type === "tool_use" && block.name === decisionMessagesTool.name
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
            errorMessage: "Anthropic returned a response without the required structured decision message tool output.",
            rawModelOutput,
            result: "No required tool output returned",
          }
          attempts.push({ attempt, ...lastFailure })
          continue
        }

        if (!isDecideResult(toolResult.input)) {
          lastFailure = {
            stage: "output didn't match the expected shape",
            httpStatus: 200,
            requestId,
            errorMessage: "The structured decision message tool output was missing required fields or had incorrect field types.",
            rawModelOutput: safeRawModelOutput(toolResult.input),
            result: "Tool output did not match expected shape",
          }
          attempts.push({ attempt, ...lastFailure })
          continue
        }

        result = toolResult.input
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
        step: "Draft decision messages",
        route: "/api/decide",
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
          ? "Lumo is at capacity for a moment. Try again in 30 seconds."
          : errorCode === "INVALID_RESPONSE"
            ? "We couldn't generate complete decision messages after two attempts. Please try again."
            : "Something went wrong on our end. Try again, or see an example of Lumo's output instead."
      return Response.json({ success: false, error, errorCode, diagnostics }, { status: routeStatus })
    }

    const cleanedResult = cleanAIValue(result!)
    return Response.json({
      success: true,
      claritySummary: cleanedResult.claritySummary,
      messages: cleanedResult.messages,
    })
  } catch (error: unknown) {
    console.error("[lumo] API Error:", error)

    // Surface rate limit and quota errors from Anthropic
    const errMsg = error instanceof Error ? error.message : String(error)
    
    // Check for quota exceeded errors
    if (errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("billing") || errMsg.toLowerCase().includes("credit")) {
      return Response.json(
        {
          success: false,
          errorCode: "QUOTA_EXCEEDED",
          error: "Lumo is busier than usual right now.",
        },
        { status: 429 }
      )
    }
    
    if (errMsg.includes("429") || errMsg.toLowerCase().includes("rate limit")) {
      return Response.json(
        {
          success: false,
          errorCode: "ANTHROPIC_RATE_LIMITED",
          error: "Lumo is at capacity for a moment. Try again in 30 seconds.",
        },
        { status: 429 }
      )
    }

    return Response.json(
      {
        success: false,
        errorCode: "SERVER_ERROR",
        error:
          "Something went wrong on our end. Try again, or see an example of Lumo's output instead.",
      },
      { status: 500 }
    )
  }
}
