import { env } from 'cloudflare:workers'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const MEDIA_PATH_PREFIX = '/media/'

export async function uploadFile(
  file: File,
): Promise<{ key: string; publicUrl: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size: 10MB')
  }

  const ext = EXT_MAP[file.type] ?? 'bin'
  const key = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  // R2 needs a known length; a File (Blob) carries its size, file.stream() does not
  await env.MEDIA.put(key, file, {
    httpMetadata: { contentType: file.type },
  })

  return { key, publicUrl: getPublicUrl(key) }
}

export function getPublicUrl(key: string): string {
  return `${MEDIA_PATH_PREFIX}${key}`
}

// Keys are timestamped and never overwritten, so responses are immutable
export async function serveMedia(key: string): Promise<Response> {
  const object = await env.MEDIA.get(key)
  if (!object) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return new Response(object.body, { headers })
}
