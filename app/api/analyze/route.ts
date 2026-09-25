import Anthropic from "@anthropic-ai/sdk"
import { ANTHROPIC_MODEL } from "@/lib/anthropic-model"

export const maxDuration = 60

// ─── Simple in-memory IP rate limiter (20 req / IP / hour for analysis) ───────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const limit = 20

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
    result.options.length > 0 &&
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
  // ─── Check for API key ──────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[lumo/analyze] ANTHROPIC_API_KEY not configured")
    return Response.json(
      { success: false, error: "API not configured. Please set ANTHROPIC_API_KEY.", errorCode: "SERVER_ERROR" },
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

    const systemPrompt = `You are Lumo, a decision-structuring tool for Senior Product Managers. Read the user's situation and produce specific, useful analysis. Reframe the core decision in one sentence; explain the key tensions in 2-3 sentences; identify affected stakeholders and why; explain timeline implications based on urgency; suggest 2-3 realistic options with a short name, one-sentence description, and costs or risks; and offer subtle observations the user may have missed. Avoid generic options unless they genuinely apply. Use a direct voice without corporate filler or sycophancy. Provide the result through the required structured analysis tool.`

    const userPrompt = `USER'S SITUATION: ${situation}
URGENCY: ${urgency || "Not specified"}

Analyze this situation specifically.`

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    let result: AnalysisResult | null = null
    let lastError: unknown

    for (let attempt = 0; attempt < 2 && !result; attempt++) {
      try {
        const response = await anthropic.messages.create({
          model: ANTHROPIC_MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          tools: [analysisTool],
          tool_choice: { type: "tool", name: analysisTool.name },
        })

        const toolResult = response.content.find(
          (block): block is Anthropic.ToolUseBlock =>
            block.type === "tool_use" && block.name === analysisTool.name
        )

        if (!toolResult || !isAnalysisResult(toolResult.input)) {
          throw new Error("AI_RESPONSE_INVALID: structured analysis was missing required fields")
        }

        result = toolResult.input
      } catch (error) {
        lastError = error
      }
    }

    if (!result) {
      const message = lastError instanceof Error ? lastError.message : String(lastError)
      if (message.startsWith("AI_RESPONSE_INVALID:")) {
        return Response.json(
          { success: false, error: "We couldn't generate a complete analysis after two attempts. Please try again.", errorCode: "INVALID_RESPONSE" },
          { status: 502 }
        )
      }
      throw lastError ?? new Error("AI request failed after two attempts")
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
