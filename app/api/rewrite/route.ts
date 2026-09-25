import Anthropic from "@anthropic-ai/sdk"
import { ANTHROPIC_MODEL } from "@/lib/anthropic-model"
import { cleanAIValue, getAnthropicErrorMetadata, HUMAN_WRITING_RULES, safeAIErrorMessage, safeRawModelOutput } from "@/lib/ai-output-utils"
import type { AIAttemptDiagnostic, AIDiagnostics } from "@/lib/ai-debug-config"

export const maxDuration = 60

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return { allowed: true }
  }
  if (entry.count >= 20) return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  entry.count++
  return { allowed: true }
}

type Channel = "email" | "slack" | "dm"
type Instruction = "shorter" | "more-direct" | "add-audience"
interface Draft {
  audience: string
  channel: Channel
  subject: string
  body: string
}
interface RewriteRequest {
  draft: Draft
  context: {
    situation: string
    urgency: string
    chosenDirection: string
    reasoning: string
    confidence: number
    whatGivingUp: string
    claritySummary: string
    affectedAudiences: string
  }
  instruction: Instruction
  audience?: string
}

const rewriteTool: Anthropic.Tool = {
  name: "rewrite_audience_draft",
  description: "Return one complete audience-specific message draft.",
  input_schema: {
    type: "object",
    properties: {
      audience: { type: "string" },
      channel: { type: "string", enum: ["email", "slack", "dm"] },
      subject: { type: "string" },
      body: { type: "string" },
    },
    required: ["audience", "channel", "subject", "body"],
    additionalProperties: false,
  },
}

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== "object") return false
  const draft = value as Record<string, unknown>
  return typeof draft.audience === "string" && (draft.channel === "email" || draft.channel === "slack" || draft.channel === "dm") && typeof draft.subject === "string" && typeof draft.body === "string" && draft.body.trim().length > 0
}

function failureResponse(
  requestStartedAt: number,
  attempts: AIAttemptDiagnostic[],
  lastFailure: Omit<AIAttemptDiagnostic, "attempt" | "result"> & { result: string },
) {
  const routeStatus = lastFailure.stage === "Anthropic returned an error" && lastFailure.httpStatus !== null && lastFailure.httpStatus >= 400 && lastFailure.httpStatus <= 599 ? lastFailure.httpStatus : 502
  const diagnostics: AIDiagnostics = {
    step: "Rewrite audience draft", route: "/api/rewrite", httpStatus: routeStatus,
    stage: lastFailure.stage, exactErrorMessage: safeAIErrorMessage(lastFailure.errorMessage),
    model: ANTHROPIC_MODEL, anthropicRequestId: lastFailure.requestId,
    retryRan: attempts.length > 1, retryResult: attempts[1]?.result ?? "Retry not run",
    timeTakenMs: Date.now() - requestStartedAt, rawModelOutput: lastFailure.rawModelOutput, attempts,
  }
  const errorCode = lastFailure.stage === "output didn't match the expected shape" || lastFailure.stage === "model returned no tool output"
    ? "INVALID_RESPONSE"
    : diagnostics.exactErrorMessage.toLowerCase().match(/quota|billing|credit/)
      ? "QUOTA_EXCEEDED"
      : routeStatus === 429 ? "ANTHROPIC_RATE_LIMITED" : "SERVER_ERROR"
  const error = errorCode === "QUOTA_EXCEEDED" ? "Lumo is busier than usual right now." : errorCode === "ANTHROPIC_RATE_LIMITED" ? "Lumo is at capacity for a moment. Try again in 30 seconds." : errorCode === "INVALID_RESPONSE" ? "Lumo couldn't return a complete rewrite after two attempts." : "Something went wrong on our end. Try again."
  return Response.json({ success: false, error, errorCode, diagnostics }, { status: routeStatus })
}

export async function POST(req: Request) {
  const requestStartedAt = Date.now()
  if (!process.env.ANTHROPIC_API_KEY) {
    const error = "ANTHROPIC_API_KEY is not configured."
    const diagnostics: AIDiagnostics = {
      step: "Rewrite audience draft", route: "/api/rewrite", httpStatus: 500,
      stage: "request to Anthropic", exactErrorMessage: error, model: ANTHROPIC_MODEL,
      anthropicRequestId: null, retryRan: false, retryResult: "Retry not run because the API key is not configured",
      timeTakenMs: Date.now() - requestStartedAt, rawModelOutput: null, attempts: [],
    }
    return Response.json({ success: false, error: "API not configured. Please set ANTHROPIC_API_KEY.", errorCode: "SERVER_ERROR", diagnostics }, { status: 500 })
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown"
  const rateLimit = checkRateLimit(ip)
  if (!rateLimit.allowed) return Response.json({ success: false, errorCode: "RATE_LIMITED", error: "Too many draft requests. Try again later.", retryAfter: rateLimit.retryAfter }, { status: 429 })

  try {
    const body = await req.json() as Partial<RewriteRequest>
    const draft = body.draft
    const context = body.context
    const instruction = body.instruction
    const audience = typeof body.audience === "string" ? body.audience.trim() : ""
    if (!draft || typeof draft !== "object" || !context || typeof context !== "object" || !["shorter", "more-direct", "add-audience"].includes(instruction ?? "")) {
      return Response.json({ success: false, errorCode: "INVALID_INPUT", error: "The rewrite request is incomplete." }, { status: 400 })
    }
    const isAddAudience = instruction === "add-audience"
    if (!isAddAudience && !isDraft(draft)) return Response.json({ success: false, errorCode: "INVALID_INPUT", error: "The draft is incomplete." }, { status: 400 })
    if (isAddAudience && (!audience || audience.length > 100)) return Response.json({ success: false, errorCode: "INVALID_INPUT", error: "Enter an audience name under 100 characters." }, { status: 400 })
    if (typeof draft.audience !== "string" || draft.audience.length > 100 || typeof draft.body !== "string" || draft.body.length > 5000) return Response.json({ success: false, errorCode: "INVALID_INPUT", error: "The draft is too long to rewrite." }, { status: 400 })

    const safeContext = {
      situation: typeof context.situation === "string" ? context.situation.slice(0, 6000) : "",
      urgency: typeof context.urgency === "string" ? context.urgency.slice(0, 500) : "",
      chosenDirection: typeof context.chosenDirection === "string" ? context.chosenDirection.slice(0, 3000) : "",
      reasoning: typeof context.reasoning === "string" ? context.reasoning.slice(0, 3000) : "",
      confidence: typeof context.confidence === "number" ? context.confidence : 0,
      whatGivingUp: typeof context.whatGivingUp === "string" ? context.whatGivingUp.slice(0, 2000) : "",
      claritySummary: typeof context.claritySummary === "string" ? context.claritySummary.slice(0, 2000) : "",
      affectedAudiences: typeof context.affectedAudiences === "string" ? context.affectedAudiences.slice(0, 3000) : "",
    }
    const targetAudience = isAddAudience ? audience : draft.audience.trim()
    const systemPrompt = `You are Lumo, a thoughtful senior product manager editing a message for colleagues. Preserve the real facts, names, teams, dates, decision, and confidence from the supplied context. Do not invent details. Lead with the decision, include one clear ask when there is one, and match the audience. Executives get the call, cost, risk being watched, and confidence. Engineering gets scope changes and owners. Sales and support get what to say to customers. Keep the body under 100 words. Do not use bold, markdown, or headers inside the body. For email, provide a concise subject. For Slack or DM, return an empty subject. ${HUMAN_WRITING_RULES}`
    const instructionText = instruction === "shorter" ? "Make this draft shorter while preserving its important facts and clear ask." : instruction === "more-direct" ? "Make this draft more direct and outcome-first without becoming abrupt or changing any facts." : `Create a new draft for the audience named exactly "${targetAudience}". Choose the best channel for this audience and tailor the message to their role.`
    const userPrompt = `INSTRUCTION: ${instructionText}

DECISION CONTEXT
Situation: ${safeContext.situation}
Timeline: ${safeContext.urgency}
Chosen direction: ${safeContext.chosenDirection}
Reasoning: ${safeContext.reasoning}
Confidence: ${safeContext.confidence} of 5
What is being given up: ${safeContext.whatGivingUp}
Analysis summary: ${safeContext.claritySummary}
Affected audiences: ${safeContext.affectedAudiences}

CURRENT DRAFT
Audience: ${targetAudience}
Channel: ${isAddAudience ? "Choose the best channel" : draft.channel}
Subject: ${isAddAudience ? "" : draft.subject}
Body: ${draft.body}

Return one rewritten draft for the same audience. For add-audience, use the requested audience name exactly.`

    const attempts: AIAttemptDiagnostic[] = []
    let result: Draft | null = null
    let lastFailure: (Omit<AIAttemptDiagnostic, "attempt" | "result"> & { result: string }) | null = null
    for (let attempt = 1; attempt <= 2 && !result; attempt++) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const response = await anthropic.messages.create({
          model: ANTHROPIC_MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          tools: [rewriteTool],
          tool_choice: { type: "tool", name: rewriteTool.name },
        })
        const requestId = response._request_id ?? null
        const toolResult = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === rewriteTool.name)
        if (!toolResult) {
          const rawModelOutput = safeRawModelOutput(response.content.filter((block): block is Anthropic.TextBlock => block.type === "text").map((block) => block.text).join("\n"))
          lastFailure = { stage: "model returned no tool output", httpStatus: 200, requestId, errorMessage: "Anthropic returned a response without the required structured rewrite tool output.", rawModelOutput, result: "No required tool output returned" }
          attempts.push({ attempt, ...lastFailure })
          continue
        }
        if (!isDraft(toolResult.input) || toolResult.input.audience.trim().toLowerCase() !== targetAudience.toLowerCase() || (!isAddAudience && toolResult.input.channel !== draft.channel)) {
          lastFailure = { stage: "output didn't match the expected shape", httpStatus: 200, requestId, errorMessage: "The structured rewrite output did not match the expected audience, channel, or fields.", rawModelOutput: safeRawModelOutput(toolResult.input), result: "Tool output did not match expected shape" }
          attempts.push({ attempt, ...lastFailure })
          continue
        }
        result = toolResult.input
      } catch (error) {
        const metadata = getAnthropicErrorMetadata(error)
        lastFailure = { stage: metadata.status === null ? "request to Anthropic" : "Anthropic returned an error", httpStatus: metadata.status, requestId: metadata.requestId, errorMessage: metadata.message, rawModelOutput: null, result: metadata.status === null ? "Request to Anthropic failed" : `Anthropic returned HTTP ${metadata.status}` }
        attempts.push({ attempt, ...lastFailure })
      }
    }
    if (!result && lastFailure) return failureResponse(requestStartedAt, attempts, lastFailure)
    return Response.json({ success: true, draft: cleanAIValue(result!) })
  } catch (error: unknown) {
    console.error("[lumo/rewrite] Error:", error)
    return Response.json({ success: false, errorCode: "SERVER_ERROR", error: "Something went wrong on our end. Try again." }, { status: 500 })
  }
}

export type { Draft, Instruction }
