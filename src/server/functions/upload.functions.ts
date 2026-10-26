import { createServerFn } from '@tanstack/react-start'
import { uploadFile } from '@/lib/storage'
import { getCurrentUser } from '@/server/functions/auth.functions'

export const upload = createServerFn({ method: 'POST' })
  .inputValidator((data: FormData) => {
    const file = data.get('file')
    if (!(file instanceof File)) {
      throw new Error('Expected an image file')
    }
    return file
  })
  .handler(async ({ data: file }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const result = await uploadFile(file)

    return {
      publicUrl: result.publicUrl,
      key: result.key,
    }
  })
