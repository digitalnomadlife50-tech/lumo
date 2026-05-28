import Anthropic from "@anthropic-ai/sdk"

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

    // ─── Exact system prompt from spec ──────────────────────────────────────
    const systemPrompt = `You are Lumo, a tool for thoughtful Senior Product Managers. The user is working through a specific decision and needs three tailored communication messages.

Your job is to produce:
1. A clarity summary (2-3 sentences in first-person) that names this specific decision, the specific tradeoff the user identified, and why the chosen direction makes sense given their reasoning.
2. Three messages that are each fully specific to this decision. Generic phrasing is forbidden.

Audience adaptations:
- Engineering message: emphasize scope, technical tradeoffs, and the specific implementation implication of this decision. Reference the user's actual situation.
- Design message: emphasize user impact, the specific UX implication, and invite input on the design surface that this decision affects. Reference the user's actual situation.
- Leadership message: emphasize the outcome, the risk the user identified in their reasoning, and the specific ask they need from leadership to move forward. Reference the user's actual situation.

Voice: Confident Senior PM. No corporate filler ('circle back', 'synergy', 'leverage', 'unpack'). No sycophancy. No 'I hope this helps' closers. Each message under 80 words.

IMPORTANT: Your output MUST specifically reference ALL FOUR of these elements or you have failed the task:
1. THE TIMELINE — name when this needs to happen and why that timing matters
2. THE SPECIFIC DIRECTION they chose — name it explicitly, do not generalize or substitute a different direction
3. THE REASONING — reference their specific numbers, tradeoffs, or concerns
4. Tailor each message differently for each audience

Return as structured JSON in exactly this format:
{
  "claritySummary": "string",
  "messages": {
    "engineering": "string",
    "design": "string",
    "leadership": "string"
  }
}`

    const userPrompt = `USER'S DECISION CONTEXT:
What's happening: ${situation || "Not provided"}
Timeline/urgency: ${urgency || "Not specified"}
The direction they chose: ${chosenDirection || "Not provided"}
Why they chose it: ${reasoning || "Not provided"}
How confident they feel: ${confidence}/10

IMPORTANT: Your output MUST specifically reference:
1. The TIMELINE ("${urgency || "Not specified"}") — when this needs to happen and why that timing matters
2. The SPECIFIC DIRECTION ("${chosenDirection || "Not provided"}") — name it explicitly, don't generalize
3. The REASONING — reference their specific numbers, tradeoffs, or concerns
4. Tailor each message differently for each audience

If any of these four elements is missing from your output, you have failed the task.`

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const result = JSON.parse(jsonMatch[0])

    console.log("[lumo] Response parsed OK, claritySummary length:", result.claritySummary?.length)

    return Response.json({
      success: true,
      claritySummary: result.claritySummary,
      messages: result.messages,
    })
  } catch (error: unknown) {
    console.error("[lumo] API Error:", error)

    // Surface rate limit errors from Anthropic
    const errMsg = error instanceof Error ? error.message : String(error)
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
