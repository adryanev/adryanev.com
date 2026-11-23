const BOT_USER_AGENT_PATTERN =
  /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|curl|wget|python-requests|go-http-client|node-fetch|axios|undici|monitor/i

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function isCountableUserAgent(userAgent: string | null | undefined): boolean {
  const trimmed = userAgent?.trim()
  return !!trimmed && !BOT_USER_AGENT_PATTERN.test(trimmed)
}

export function msUntilEndOfUtcDay(now: Date = new Date()): number {
  return MS_PER_DAY - (now.getTime() % MS_PER_DAY)
}

// Only a SHA-256 digest of IP and user-agent is stored, never the raw values
export async function buildViewKey(
  postId: number,
  ip: string,
  userAgent: string,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${ip}\n${userAgent}`),
  )
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
  return `view:${postId}:${hash}`
}
