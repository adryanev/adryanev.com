import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

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

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
})

export async function uploadFile(
  contentType: string,
  fileSize: number,
  body: Uint8Array,
): Promise<{ key: string; publicUrl: string }> {
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`)
  }
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size: 10MB')
  }

  const ext = EXT_MAP[contentType] ?? 'bin'
  const key = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
    Body: body,
  }))

  return { key, publicUrl: getPublicUrl(key) }
}

export function getPublicUrl(key: string): string {
  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`
}
