import { useState, useRef } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUploadUrl } from '@/server/functions/upload.functions'

export function ImageUploader({
  value,
  onChange,
  label = 'Image',
}: {
  value: string
  onChange: (url: string) => void
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const getUrlFn = useServerFn(getUploadUrl)

  const uploadFile = async (file: File) => {
    setError('')
    setUploading(true)

    try {
      const result = await getUrlFn({
        data: {
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        },
      })

      // Upload directly to S3
      const uploadResponse = await fetch(result.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!uploadResponse.ok) {
        setError('Upload failed. Please try again.')
        return
      }

      onChange(result.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Uploaded"
            className="h-32 w-auto border border-[var(--border-color)] object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed p-8 text-center transition-colors',
            dragOver
              ? 'border-[var(--accent)] bg-[var(--accent)]/5'
              : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]',
            uploading && 'pointer-events-none opacity-60',
          )}
        >
          {uploading ? (
            <span className="inline-block h-6 w-6 animate-spin border-2 border-[var(--accent)] border-t-transparent" />
          ) : (
            <Upload className="h-6 w-6 text-[var(--text-secondary)]" />
          )}
          <span className="text-sm text-[var(--text-secondary)]">
            {uploading
              ? 'Uploading\u2026'
              : 'Drop an image here or click to select'}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            JPEG, PNG, WebP, GIF — max 10MB
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
