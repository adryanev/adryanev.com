import { createServerFn } from '@tanstack/react-start'
import { createPresignedUploadUrl, getPublicUrl } from '@/lib/storage'

export const getUploadUrl = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { filename: string; contentType: string; fileSize: number }) => data,
  )
  .handler(async ({ data }) => {
    const result = await createPresignedUploadUrl(
      data.filename,
      data.contentType,
      data.fileSize,
    )

    if ('error' in result) {
      return result
    }

    return {
      uploadUrl: result.url,
      publicUrl: getPublicUrl(result.key),
      key: result.key,
    }
  })
