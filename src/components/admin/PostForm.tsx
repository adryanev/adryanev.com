import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Save, Eye, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SlugInput } from './SlugInput'
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

const AUTOSAVE_KEY = 'admin_post_draft'

export function PostForm({
  initial,
}: {
  initial?: PostData
}) {
  const navigate = useNavigate()
  const isEditing = !!initial?.id

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(
    initial?.status ?? 'draft',
  )
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [error, setError] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

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
      // Clear autosave on successful save
      localStorage.removeItem(AUTOSAVE_KEY)
      navigate({ to: '/admin/posts' })
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to save post'),
  })

  // Autosave to localStorage every 30 seconds (new posts only)
  useEffect(() => {
    if (isEditing) return
    const interval = setInterval(() => {
      if (title || content) {
        localStorage.setItem(
          AUTOSAVE_KEY,
          JSON.stringify({ title, slug, content, excerpt, coverImage, status, tags }),
        )
        setLastSaved(new Date())
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [isEditing, title, slug, content, excerpt, coverImage, status, tags])

  // Restore autosave on mount (new posts only)
  useEffect(() => {
    if (isEditing) return
    const saved = localStorage.getItem(AUTOSAVE_KEY)
    if (saved) {
      try {
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
      } catch { /* ignore corrupt data */ }
    }
  }, [isEditing])

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }, [tagInput, tags])

  const handleSubmit = (e: React.FormEvent) => {
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className={cn(
            'rounded-md border px-4 py-3 text-sm',
            'border-red-200 bg-red-50 text-red-700',
            'dark:border-red-900 dark:bg-red-950 dark:text-red-400',
          )}
        >
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={cn(
            'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
            'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent',
            'dark:border-slate-700 dark:bg-slate-800 dark:focus:border-accent',
          )}
          placeholder="Post title"
        />
      </div>

      {/* Slug */}
      <SlugInput title={title} value={slug} onChange={setSlug} />

      {/* Content */}
      <div>
        <label htmlFor="content" className="mb-1.5 block text-sm font-medium">
          Content (Markdown)
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={20}
          className={cn(
            'w-full rounded-md border px-3 py-2 font-mono text-sm outline-none transition-colors',
            'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent',
            'dark:border-slate-700 dark:bg-slate-800 dark:focus:border-accent',
          )}
          placeholder="Write your post content in Markdown..."
        />
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium">
          Excerpt{' '}
          <span className="text-slate-400">(optional, auto-generated if blank)</span>
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className={cn(
            'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
            'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent',
            'dark:border-slate-700 dark:bg-slate-800 dark:focus:border-accent',
          )}
          placeholder="Brief summary..."
        />
      </div>

      {/* Cover image URL */}
      <div>
        <label htmlFor="coverImage" className="mb-1.5 block text-sm font-medium">
          Cover Image URL{' '}
          <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="coverImage"
          type="text"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className={cn(
            'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
            'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent',
            'dark:border-slate-700 dark:bg-slate-800 dark:focus:border-accent',
          )}
          placeholder="https://..."
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addTag()
              }
            }}
            className={cn(
              'flex-1 rounded-md border px-3 py-2 text-sm outline-none transition-colors',
              'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent',
              'dark:border-slate-700 dark:bg-slate-800 dark:focus:border-accent',
            )}
            placeholder="Type tag and press Enter"
          />
          <button
            type="button"
            onClick={addTag}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Add
          </button>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Status</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => setStatus('draft')}
              className="accent-accent"
            />
            Draft
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === 'published'}
              onChange={() => setStatus('published')}
              className="accent-accent"
            />
            Published
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
        <div className="text-xs text-slate-400">
          {lastSaved && !isEditing && (
            <>Auto-saved {lastSaved.toLocaleTimeString()}</>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: '/admin/posts' })}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              'bg-accent text-slate-950 hover:bg-accent-hover',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  )
}
