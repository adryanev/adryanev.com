import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for S3-compatible providers like MinIO
})

export async function createPresignedUploadUrl(
  filename: string,
  contentType: string,
  fileSize: number,
): Promise<{ url: string; key: string }> {
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`)
  }
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size: 10MB')
  }

  const ext = filename.split('.').pop() ?? 'bin'
  const key = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  })

  const url = await getSignedUrl(s3, command, { expiresIn: 300 }) // 5 minutes

  return { url, key }
}

export function getPublicUrl(key: string): string {
  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`
}
