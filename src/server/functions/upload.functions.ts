import { createServerFn } from '@tanstack/react-start'
import { uploadFile } from '@/lib/storage'
import { getCurrentUser } from '@/server/functions/auth.functions'

export const upload = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { contentType: string; fileSize: number; bytes: number[] }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const body = new Uint8Array(data.bytes)
    const result = await uploadFile(data.contentType, data.fileSize, body)

    return {
      publicUrl: result.publicUrl,
      key: result.key,
    }
  })
