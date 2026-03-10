import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { createServerEntry } from '@tanstack/react-start/server-entry'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

if (process.env.NODE_ENV === 'production') {
  SECURITY_HEADERS['Strict-Transport-Security'] =
    'max-age=31536000; includeSubDomains'
}

const handler = createStartHandler(defaultStreamHandler)

const secureHandler: typeof handler = async (request) => {
  const response = await handler(request)
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

const fetch = secureHandler

export default createServerEntry({
  fetch,
})
