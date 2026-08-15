import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy_key",
})

export interface ExtractedClaim {
  claimType: "SKILL_PROFICIENCY" | "PROJECT_COUNT" | "CERTIFICATION" | "HACKATHON_COUNT" | "GPA_THRESHOLD"
  subject: string
  predicate: ">=" | "==" | "has"
  value: string
  confidence: number
  sourceEvidence: string
}

export async function analyzeCredential(content: string): Promise<ExtractedClaim[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY is not set. Falling back to mock claim extraction.")
    return getMockClaims(content)
  }

  const systemPrompt = `You are an expert credential analyzer. Your task is to extract structured, verifiable claims from the provided credential text.
You must return ONLY a valid JSON array of objects. Do not include any markdown formatting, preamble, or explanation.

Each object in the array must strictly match the following typescript structure:
{
  "claimType": "SKILL_PROFICIENCY" | "PROJECT_COUNT" | "CERTIFICATION" | "HACKATHON_COUNT" | "GPA_THRESHOLD",
  "subject": string, // Name of the skill or certification (e.g. "Python", "CompTIA Security+")
  "predicate": ">=" | "==" | "has",
  "value": string, // "Beginner" | "Intermediate" | "Advanced" | "Expert" for skills, or integer strings (e.g. "5") for counts/scores
  "confidence": number, // Float between 0.0 and 1.0 representing your confidence
  "sourceEvidence": string // Brief sentence explaining what text in the document proves this claim
}

CRITICAL RULES:
1. Only extract claims directly evidenced in the text.
2. Never invent or hallucinate claims.
3. Skill level values must only be: Beginner, Intermediate, Advanced, or Expert.
4. For certifications, use predicate "has" and value "true".
5. For GPA, use predicate ">=" and value as the decimal string.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Analyze this credential content and extract claims:\n\n${content}`,
        },
      ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    // Basic parser cleanup in case Claude wrapped it in a json codeblock
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim()
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("Error analyzing credential with Anthropic:", error)
    return getMockClaims(content)
  }
}

function getMockClaims(content: string): ExtractedClaim[] {
  const claims: ExtractedClaim[] = []
  
  if (content.toLowerCase().includes("python")) {
    claims.push({
      claimType: "SKILL_PROFICIENCY",
      subject: "Python",
      predicate: ">=",
      value: "Advanced",
      confidence: 0.95,
      sourceEvidence: "Mentions Python developer with 3 years experience"
    })
  }
  
  if (content.toLowerCase().includes("security+")) {
    claims.push({
      claimType: "CERTIFICATION",
      subject: "CompTIA Security+",
      predicate: "has",
      value: "true",
      confidence: 0.99,
      sourceEvidence: "Directly mentions CompTIA Security+ certified"
    })
  }

  if (content.toLowerCase().includes("web apps") || content.toLowerCase().includes("project")) {
    claims.push({
      claimType: "PROJECT_COUNT",
      subject: "Web Apps",
      predicate: ">=",
      value: "5",
      confidence: 0.9,
      sourceEvidence: "Mentions built 5 web apps"
    })
  }
  
  return claims
}
