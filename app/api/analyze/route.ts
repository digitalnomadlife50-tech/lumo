import Anthropic from "@anthropic-ai/sdk"

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

    const systemPrompt = `You are Lumo, a decision-structuring tool for Senior Product Managers. The user has described a situation they need to decide on. Your job is to read their situation and produce structured analysis.

Return a JSON object with exactly this structure:
{
  "realQuestion": "One sentence reframing the core decision",
  "whatMatters": "2-3 sentences on the key tensions and tradeoffs",
  "whoIsAffected": "List the stakeholders likely involved and why",
  "howPressing": "Timeline implications given the urgency level",
  "options": [
    {
      "name": "Short name for this path (5-8 words)",
      "description": "One sentence describing this option",
      "cost": "What this option costs or risks (1-2 sentences)"
    }
  ],
  "observations": [
    "One subtle observation about the situation the user might not have considered",
    "Another observation"
  ]
}

Generate 2-3 realistic options. Be specific to their situation. Do not use generic options like 'do nothing' unless it genuinely applies. 
Voice: direct, no corporate filler, no sycophancy.
Return ONLY the JSON object, no markdown code blocks, no explanation.`

    const userPrompt = `USER'S SITUATION: ${situation}
URGENCY: ${urgency || "Not specified"}

Analyze this situation and return the structured JSON.`

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    // Parse the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[lumo/analyze] No JSON found in response:", text.slice(0, 500))
      return Response.json(
        { success: false, error: "Failed to parse AI response. Please try again.", errorCode: "PARSE_ERROR" },
        { status: 500 }
      )
    }

    const result: AnalysisResult = JSON.parse(jsonMatch[0])

    // Validate the structure
    if (!result.realQuestion || !result.options || result.options.length === 0) {
      console.error("[lumo/analyze] Invalid response structure:", result)
      return Response.json(
        { success: false, error: "AI returned incomplete analysis. Please try again.", errorCode: "INVALID_RESPONSE" },
        { status: 500 }
      )
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
