type OmniRouteMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type OmniRouteResult = {
  text: string
  metadata: {
    model: string | null
    provider: string | null
    decision: string | null
    requestId: string | null
    latencyMs: string | null
    fallbackAttempts: string | null
  }
}

function getOmniRouteBaseUrl() {
  return (process.env.OMNIROUTE_BASE_URL || "").trim().replace(/\/+$/, "")
}

export function isOmniRouteConfigured() {
  return Boolean(getOmniRouteBaseUrl() && process.env.OMNIROUTE_API_KEY)
}

function getOmniRouteChatUrl() {
  const baseUrl = getOmniRouteBaseUrl()
  if (!baseUrl) throw new Error("OMNIROUTE_BASE_URL is not configured")

  // Accept either the gateway origin or a path already ending in /v1.
  // OmniRoute exposes the same OpenAI-compatible route through both local and
  // reverse-proxied deployments; keeping this configurable avoids hardcoding
  // deployment-specific prefixes in the app.
  return baseUrl.endsWith("/v1")
    ? `${baseUrl}/chat/completions`
    : `${baseUrl}/v1/chat/completions`
}

function readTextContent(content: unknown) {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""

  return content
    .map((part) => {
      if (typeof part === "string") return part
      if (part && typeof part === "object" && "text" in part) return String(part.text || "")
      return ""
    })
    .join("")
}

export async function createOmniRouteChatCompletion({
  system,
  user,
  model = process.env.OMNIROUTE_MODEL || "auto",
  maxTokens = 4000,
}: {
  system: string
  user: string
  model?: string
  maxTokens?: number
}): Promise<OmniRouteResult> {
  if (!isOmniRouteConfigured()) {
    throw new Error("OmniRoute is not configured")
  }

  const response = await fetch(getOmniRouteChatUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OMNIROUTE_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: maxTokens,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ] satisfies OmniRouteMessage[],
    }),
    cache: "no-store",
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.error || `OmniRoute request failed (${response.status})`
    throw new Error(String(detail))
  }

  const text = readTextContent(payload?.choices?.[0]?.message?.content)
  if (!text.trim()) throw new Error("OmniRoute returned an empty completion")

  return {
    text,
    metadata: {
      model: response.headers.get("x-omniroute-model"),
      provider: response.headers.get("x-omniroute-provider"),
      decision: response.headers.get("x-omniroute-decision"),
      requestId: response.headers.get("x-omniroute-request-id"),
      latencyMs: response.headers.get("x-omniroute-latency-ms"),
      fallbackAttempts: response.headers.get("x-omniroute-fallback-attempts"),
    },
  }
}
