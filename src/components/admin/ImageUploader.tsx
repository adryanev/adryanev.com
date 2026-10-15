import { useState, useRef } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Upload, X } from 'lucide-react'
import { upload } from '@/server/functions/upload.functions'

import { Button, Input, Feedback } from '@/components/ui'

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
  const uploadFn = useServerFn(upload)
  const uploadFile = async (file: File) => {
    if (uploading) return
    setError('')
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
        file.type,
      ) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError('Choose a JPEG, PNG, WebP, or GIF image smaller than 10 MB.')
      return
    }
    setUploading(true)
    try {
      const buffer = await file.arrayBuffer()
      const result = await uploadFn({
        data: {
          contentType: file.type,
          fileSize: file.size,
          bytes: Array.from(new Uint8Array(buffer)),
        },
      })
      onChange(result.publicUrl)
    } catch {
      setError(
        'Image upload failed. Your existing images are unchanged. Please try again.',
      )
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }
  return (
    <div className="admin-upload">
      <p className="ui-field__label">{label}</p>
      {value ? (
        <div className="admin-upload__preview">
          <img src={value} alt={label + ' preview'} loading="lazy" />
          <div className="page-actions">
            <a href={value} target="_blank" rel="noopener noreferrer">
              Open image
            </a>
            <Button
              variant="secondary"
              type="button"
              onClick={() => onChange('')}
            >
              <X size={16} />
              Remove image
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="plain"
          type="button"
          className="admin-upload__drop"
          data-dragging={dragOver}
          disabled={uploading}
          aria-label={'Choose ' + label.toLowerCase()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            const file = event.dataTransfer.files[0]
            if (file) void uploadFile(file)
          }}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={24} aria-hidden="true" />
          <strong>
            {uploading ? 'Uploading image…' : 'Choose an image or drop it here'}
          </strong>
          <span>JPEG, PNG, WebP, GIF · Up to 10 MB</span>
        </Button>
      )}
      <Input
        appearance="plain"
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        aria-label={label}
        className="hidden"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void uploadFile(file)
        }}
      />
      {uploading && (
        <Feedback tone="info" role="status">
          Uploading image. Keep this page open.
        </Feedback>
      )}
      {error && (
        <Feedback tone="danger" role="alert">
          {error}
        </Feedback>
      )}
    </div>
  )
}
