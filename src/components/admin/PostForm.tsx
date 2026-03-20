import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { SlugInput } from './SlugInput'
import { MarkdownEditor } from './MarkdownEditor'
import { FormField } from './form/FormField'
import { FormInput } from './form/FormInput'
import { FormTextarea } from './form/FormTextarea'
import { FormError } from './form/FormError'
import { FormActions } from './form/FormActions'
import { TagInput } from './form/TagInput'
import { StatusRadio } from './form/StatusRadio'
import { createPost, updatePost } from '@/server/functions/posts.functions'

type PostData = {
  id?: number
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  status: 'draft' | 'published'
  tags: string[]
}

const AUTOSAVE_KEY = 'admin_post_draft:v1'

const STATUS_OPTIONS = [
  { value: 'draft' as const, label: 'Draft' },
  { value: 'published' as const, label: 'Published', activeColor: 'var(--accent)' },
]

export function PostForm({ initial }: { initial?: PostData }) {
  const navigate = useNavigate()
  const isEditing = !!initial?.id

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(initial?.status ?? 'draft')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [error, setError] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const initialRef = useRef(initial)

  const dirty = title !== (initialRef.current?.title ?? '') ||
    slug !== (initialRef.current?.slug ?? '') ||
    content !== (initialRef.current?.content ?? '') ||
    excerpt !== (initialRef.current?.excerpt ?? '') ||
    coverImage !== (initialRef.current?.coverImage ?? '') ||
    status !== (initialRef.current?.status ?? 'draft') ||
    JSON.stringify(tags) !== JSON.stringify(initialRef.current?.tags ?? [])

  useUnsavedChanges(dirty)

  const createFn = useServerFn(createPost)
  const updateFn = useServerFn(updatePost)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        title,
        slug: slug || undefined,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
        status,
        tags,
      }
      if (isEditing) {
        return updateFn({ data: { ...data, id: initial!.id! } })
      }
      return createFn({ data })
    },
    onSuccess: () => {
      try {
        localStorage.removeItem(AUTOSAVE_KEY)
      } catch { /* private browsing or storage unavailable */ }
      navigate({ to: '/admin/posts' })
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to save post'),
  })

  // Autosave
  const formDataRef = useRef({ title, slug, content, excerpt, coverImage, status, tags })
  formDataRef.current = { title, slug, content, excerpt, coverImage, status, tags }

  useEffect(() => {
    if (isEditing) return
    const interval = setInterval(() => {
      const data = formDataRef.current
      if (data.title || data.content) {
        try {
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data))
          setLastSaved(new Date())
        } catch { /* quota exceeded or private browsing */ }
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [isEditing])

  // Restore autosave
  useEffect(() => {
    if (isEditing) return
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.title || data.content) {
          setTitle(data.title || '')
          setSlug(data.slug || '')
          setContent(data.content || '')
          setExcerpt(data.excerpt || '')
          setCoverImage(data.coverImage || '')
          setStatus(data.status || 'draft')
          setTags(data.tags || [])
          setLastSaved(new Date())
        }
      }
    } catch { /* private browsing or storage unavailable */ }
  }, [isEditing])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!content.trim()) {
      setError('Content is required')
      return
    }
    saveMutation.mutate()
  }, [title, content, saveMutation])

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <FormError message={error} />

      <div className="space-y-4">
        <FormField label="Title" htmlFor="title">
          <FormInput
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Post Title"
          />
        </FormField>

        <SlugInput title={title} value={slug} onChange={setSlug} />

        <FormField label="Content (Markdown)">
          <MarkdownEditor value={content} onChange={setContent} />
        </FormField>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Excerpt" htmlFor="excerpt" optional>
            <FormTextarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Brief summary..."
            />
          </FormField>

          <FormField label="Cover Image URL" htmlFor="coverImage" optional>
            <FormInput
              id="coverImage"
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
            />
          </FormField>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Tags">
            <TagInput.Root value={tags} onChange={setTags}>
              <TagInput.Input placeholder="Add tag..." />
              <div className="mt-3">
                <TagInput.List />
              </div>
            </TagInput.Root>
          </FormField>

          <FormField label="Status">
            <StatusRadio
              name="status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
            />
          </FormField>
        </div>
      </div>

      <FormActions
        isPending={saveMutation.isPending}
        isEditing={isEditing}
        onCancel={() => navigate({ to: '/admin/posts' })}
        saveLabel={isEditing ? 'Update' : 'Save'}
      >
        {lastSaved && !isEditing && `Auto-saved at ${lastSaved.toLocaleTimeString()}`}
      </FormActions>
    </form>
  )
}
