import Anthropic from "@anthropic-ai/sdk"
import { ANTHROPIC_MODEL } from "@/lib/anthropic-model"

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
  // ─── Check for API key ──────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[lumo/decide] ANTHROPIC_API_KEY not configured")
    return Response.json(
      {
        success: false,
        errorCode: "SERVER_ERROR",
        error: "API not configured. Please set ANTHROPIC_API_KEY.",
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

    console.log("[lumo] Request received:", JSON.stringify({ situation, urgency, chosenDirection, reasoning, confidence }))

    const systemPrompt = `You are Lumo, a tool for thoughtful Senior Product Managers. Create a first-person clarity summary in 2-3 sentences that names the decision, tradeoff, and why the chosen direction fits the user's reasoning. Then draft three specific messages, each under 80 words: engineering (scope, technical tradeoffs, implementation implications), design (user impact, UX implications, invite input), and leadership (outcome, identified risk, and a concrete ask). Every message should name the timeline and why it matters, the specific chosen direction, and the user's reasoning. Use a confident Senior PM voice without corporate filler, sycophancy, or generic phrasing. Provide the result through the required structured communication tool.`

    const userPrompt = `USER'S DECISION CONTEXT:
What's happening: ${situation || "Not provided"}
Timeline/urgency: ${urgency || "Not specified"}
The direction they chose: ${chosenDirection || "Not provided"}
Why they chose it: ${reasoning || "Not provided"}
How confident they feel: ${confidence}/10

Tailor each message to its audience and reference the user's actual context.`

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    let result: DecideResult | null = null
    let lastError: unknown

    for (let attempt = 0; attempt < 2 && !result; attempt++) {
      try {
        const response = await anthropic.messages.create({
          model: ANTHROPIC_MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          tools: [decisionMessagesTool],
          tool_choice: { type: "tool", name: decisionMessagesTool.name },
        })

        const toolResult = response.content.find(
          (block): block is Anthropic.ToolUseBlock =>
            block.type === "tool_use" && block.name === decisionMessagesTool.name
        )

        if (!toolResult || !isDecideResult(toolResult.input)) {
          throw new Error("AI_RESPONSE_INVALID: structured messages were missing required fields")
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
          { success: false, error: "We couldn't generate complete decision messages after two attempts. Please try again.", errorCode: "INVALID_RESPONSE" },
          { status: 502 }
        )
      }
      throw lastError ?? new Error("AI request failed after two attempts")
    }

    return Response.json({
      success: true,
      claritySummary: result.claritySummary,
      messages: result.messages,
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
