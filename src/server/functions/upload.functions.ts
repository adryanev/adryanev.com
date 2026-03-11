import { createServerFn } from '@tanstack/react-start'
import { createPresignedUploadUrl, getPublicUrl } from '@/lib/storage'
import { getCurrentUser } from '@/server/functions/auth.functions'

export const getUploadUrl = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { filename: string; contentType: string; fileSize: number }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const result = await createPresignedUploadUrl(
      data.filename,
      data.contentType,
      data.fileSize,
    )

    return {
      uploadUrl: result.url,
      publicUrl: getPublicUrl(result.key),
      key: result.key,
    }
  })
