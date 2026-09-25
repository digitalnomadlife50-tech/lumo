import Anthropic from "@anthropic-ai/sdk"
import { ANTHROPIC_MODEL } from "@/lib/anthropic-model"
import { cleanAIValue, getAnthropicErrorMetadata, HUMAN_WRITING_RULES, safeAIErrorMessage, safeRawModelOutput } from "@/lib/ai-output-utils"
import type { AIAttemptDiagnostic, AIDiagnostics } from "@/lib/ai-debug-config"
import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit"

export const maxDuration = 60

interface DecisionContext {
  situation: string
  urgency: string
  chosenDirection: string
  reasoning: string
  confidence: number
  whatGivingUp: string
  analysis?: {
    realQuestion?: string
    whatMatters?: string
    whoIsAffected?: string
    howPressing?: string
  }
}

type Channel = "email" | "slack" | "dm"
interface AudienceDraft {
  audience: string
  channel: Channel
  subject: string
  body: string
}
interface DecideResult {
  claritySummary: string
  executionTeam: string
  drafts: AudienceDraft[]
}

const decideTool: Anthropic.Tool = {
  name: "provide_audience_drafts",
  description: "Return a concise decision summary and a message draft for every affected audience, including the user's VP and the execution team.",
  input_schema: {
    type: "object",
    properties: {
      claritySummary: { type: "string" },
      executionTeam: { type: "string" },
      drafts: {
        type: "array",
        minItems: 2,
        maxItems: 8,
        items: {
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
      },
    },
    required: ["claritySummary", "executionTeam", "drafts"],
    additionalProperties: false,
  },
}

function isAudienceDraft(value: unknown): value is AudienceDraft {
  if (!value || typeof value !== "object") return false
  const draft = value as Record<string, unknown>
  return typeof draft.audience === "string" && draft.audience.trim().length > 0 &&
    (draft.channel === "email" || draft.channel === "slack" || draft.channel === "dm") &&
    typeof draft.subject === "string" && typeof draft.body === "string" && draft.body.trim().length > 0
}

function isDecideResult(value: unknown): value is DecideResult {
  if (!value || typeof value !== "object") return false
  const result = value as Record<string, unknown>
  if (typeof result.claritySummary !== "string" || typeof result.executionTeam !== "string" || !result.executionTeam.trim()) return false
  if (!Array.isArray(result.drafts) || result.drafts.length < 2 || result.drafts.length > 8 || !result.drafts.every(isAudienceDraft)) return false
  const audiences = result.drafts.map((draft) => draft.audience.trim().toLowerCase())
  return audiences.includes("your vp") && audiences.includes(result.executionTeam.trim().toLowerCase())
}

function getDiagnosticsResponse(
  requestStartedAt: number,
  attempts: AIAttemptDiagnostic[],
  lastFailure: Omit<AIAttemptDiagnostic, "attempt" | "result"> & { result: string },
) {
  const routeStatus = lastFailure.stage === "Anthropic returned an error" && lastFailure.httpStatus !== null && lastFailure.httpStatus >= 400 && lastFailure.httpStatus <= 599
    ? lastFailure.httpStatus
    : 502
  const diagnostics: AIDiagnostics = {
    step: "Draft audience messages",
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
        ? "We couldn't generate complete audience drafts after two attempts. Please try again."
        : "Something went wrong on our end. Try again, or see an example of Lumo's output instead."
  return Response.json({ success: false, error, errorCode, diagnostics }, { status: routeStatus })
}

export async function POST(req: Request) {
  const requestStartedAt = Date.now()
  if (!process.env.ANTHROPIC_API_KEY) {
    const error = "ANTHROPIC_API_KEY is not configured."
    const diagnostics: AIDiagnostics = {
      step: "Draft audience messages", route: "/api/decide", httpStatus: 500,
      stage: "request to Anthropic", exactErrorMessage: error, model: ANTHROPIC_MODEL,
      anthropicRequestId: null, retryRan: false,
      retryResult: "Retry not run because the API key is not configured",
      timeTakenMs: Date.now() - requestStartedAt, rawModelOutput: null, attempts: [],
    }
    return Response.json({ success: false, error: "API not configured. Please set ANTHROPIC_API_KEY.", errorCode: "SERVER_ERROR", diagnostics }, { status: 500 })
  }

  const ip = getClientIp(req)
  const rateLimit = await checkRateLimit("decide", ip)
  if (!rateLimit.allowed) {
    return Response.json({ success: false, errorCode: "RATE_LIMITED", error: RATE_LIMIT_MESSAGE, retryAfter: rateLimit.retryAfter }, { status: 429 })
  }

  try {
    const body = await req.json() as Partial<DecisionContext>
    const situation = typeof body.situation === "string" ? body.situation.trim() : ""
    const urgency = typeof body.urgency === "string" ? body.urgency.trim() : ""
    const chosenDirection = typeof body.chosenDirection === "string" ? body.chosenDirection.trim() : ""
    const reasoning = typeof body.reasoning === "string" ? body.reasoning.trim() : ""
    const whatGivingUp = typeof body.whatGivingUp === "string" ? body.whatGivingUp.trim() : ""
    const confidence = body.confidence
    if ([situation, urgency, chosenDirection, reasoning, whatGivingUp].some((value) => !value || value.length > 6000) || typeof confidence !== "number" || !Number.isInteger(confidence) || confidence < 1 || confidence > 5) {
      return Response.json({ success: false, errorCode: "INVALID_INPUT", error: "Complete the decision details before drafting messages." }, { status: 400 })
    }

    const analysis = body.analysis && typeof body.analysis === "object" ? body.analysis : {}
    const analysisContext = {
      coreQuestion: typeof analysis.realQuestion === "string" ? analysis.realQuestion.slice(0, 2000) : "",
      whatMatters: typeof analysis.whatMatters === "string" ? analysis.whatMatters.slice(0, 3000) : "",
      affectedAudiences: typeof analysis.whoIsAffected === "string" ? analysis.whoIsAffected.slice(0, 3000) : "",
      urgencyRead: typeof analysis.howPressing === "string" ? analysis.howPressing.slice(0, 2000) : "",
    }

    const systemPrompt = `You are Lumo, a thoughtful senior product manager writing real messages to colleagues. Return a short first-person decision summary and one message draft for each affected person or team named in the analysis. Always include an audience named exactly "Your VP" and the execution team that owns the chosen work. Set executionTeam to that team's actual name from the input. If no specific team can be identified, use "Execution team" rather than inventing one. Do not add unrelated audiences. Keep each message under 100 words. Choose the channel that best fits the audience: email, slack, or dm. Email drafts need a concise subject. Slack and DM drafts must have an empty subject. Lead with the decision. Include one clear ask when there is one. Executives get the call, cost, risk being watched, and confidence. Engineering gets scope changes and owners. Sales and support get what to say to customers. Use the real names, teams, dates, and numbers from the input. Do not fabricate details. No bold, markdown, or headers inside draft bodies. ${HUMAN_WRITING_RULES}`

    const userPrompt = `USER'S DECISION CONTEXT
Situation: ${situation}
Timeline: ${urgency}
Chosen direction: ${chosenDirection}
Why they chose it: ${reasoning}
Confidence: ${confidence} of 5
What they are giving up: ${whatGivingUp}

ANALYSIS
Core question: ${analysisContext.coreQuestion || "Not provided"}
What matters: ${analysisContext.whatMatters || "Not provided"}
Affected people and teams: ${analysisContext.affectedAudiences || "Not provided"}
Urgency read: ${analysisContext.urgencyRead || "Not provided"}

Draft for every affected audience, plus Your VP and the team responsible for execution. Preserve the supplied facts and do not make up names, commitments, dates, or numbers.`

    const attempts: AIAttemptDiagnostic[] = []
    let result: DecideResult | null = null
    let lastFailure: (Omit<AIAttemptDiagnostic, "attempt" | "result"> & { result: string }) | null = null

    for (let attempt = 1; attempt <= 2 && !result; attempt++) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const response = await anthropic.messages.create({
          model: ANTHROPIC_MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          tools: [decideTool],
          tool_choice: { type: "tool", name: decideTool.name },
        })
        const requestId = response._request_id ?? null
        const toolResult = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === decideTool.name)
        if (!toolResult) {
          const rawModelOutput = safeRawModelOutput(response.content.filter((block): block is Anthropic.TextBlock => block.type === "text").map((block) => block.text).join("\n"))
          lastFailure = { stage: "model returned no tool output", httpStatus: 200, requestId, errorMessage: "Anthropic returned a response without the required structured audience draft output.", rawModelOutput, result: "No required tool output returned" }
          attempts.push({ attempt, ...lastFailure })
          continue
        }
        if (!isDecideResult(toolResult.input)) {
          lastFailure = { stage: "output didn't match the expected shape", httpStatus: 200, requestId, errorMessage: "The structured draft output was missing a required audience or had incorrect fields.", rawModelOutput: safeRawModelOutput(toolResult.input), result: "Tool output did not match expected shape" }
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

    if (!result && lastFailure) return getDiagnosticsResponse(requestStartedAt, attempts, lastFailure)
    const cleanedResult = cleanAIValue(result!)
    return Response.json({ success: true, ...cleanedResult })
  } catch (error: unknown) {
    console.error("[lumo/decide] Error:", error)
    return Response.json({ success: false, errorCode: "SERVER_ERROR", error: "Something went wrong on our end. Try again." }, { status: 500 })
  }
}

export type { AudienceDraft, DecisionContext }
