import { useState, useEffect, useMemo, useRef } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight, Eye } from 'lucide-react'
import type { OutputData } from '@editorjs/editorjs'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { SlugInput } from './SlugInput'
import { EditorJsEditor, type EditorJsEditorHandle } from './EditorJsEditor'
import { ImageUploader } from './ImageUploader'
import { PostPreviewSheet } from './PostPreviewSheet'
import { TagInput } from './form/TagInput'
import {
  Button,
  Field,
  FormError,
  Input,
  Textarea,
} from '@/components/ui'
import {
  createPost,
  deletePost,
  updatePost,
} from '@/server/functions/posts.functions'
import { editorContentSignature } from '@/lib/editor-content'
import { estimateReadingTime } from '@/lib/editorjs-renderer'
import { formatPostDate } from '@/lib/post-dates'
import { AUTO_EXCERPT_LENGTH } from '@/lib/post-excerpt'
import {
  buildPostPreview,
  countWords,
  parsePostContent,
  type PostDraft,
} from '@/lib/post-preview'
import { slugify } from '@/lib/slugify'
import './post-editor.css'

type PostStatus = 'draft' | 'published'

type PostData = PostDraft & {
  id?: number
  status: PostStatus
  publishedAt?: Date | null
  updatedAt?: Date
}

const AUTOSAVE_KEY = 'admin_post_draft:v1'
const AUTOSAVE_INTERVAL_MS = 30_000

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
]

function isPreviewShortcut(event: KeyboardEvent): boolean {
  return (
    (event.metaKey || event.ctrlKey) &&
    event.shiftKey &&
    event.key.toLowerCase() === 'p'
  )
}

function usePreviewShortcutLabel(): string {
  const [label, setLabel] = useState('⌘⇧P')
  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setLabel('Ctrl⇧P')
  }, [])
  return label
}

export function PostForm({ initial }: { initial?: PostData }) {
  const navigate = useNavigate()
  const isEditing = !!initial?.id

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '')
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? 'draft')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [error, setError] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  // Restoring a browser copy remounts the editor, which reads its value once
  const [editorKey, setEditorKey] = useState(0)
  const [previewOpen, setPreviewOpen] = useState<{ animate: boolean } | null>(
    null,
  )
  const initialRef = useRef(initial)
  const editorRef = useRef<EditorJsEditorHandle>(null)
  const shortcutLabel = usePreviewShortcutLabel()

  const dirty =
    title !== (initialRef.current?.title ?? '') ||
    slug !== (initialRef.current?.slug ?? '') ||
    editorContentSignature(content) !==
      editorContentSignature(initialRef.current?.content ?? '') ||
    excerpt !== (initialRef.current?.excerpt ?? '') ||
    coverImage !== (initialRef.current?.coverImage ?? '') ||
    status !== (initialRef.current?.status ?? 'draft') ||
    JSON.stringify(tags) !== JSON.stringify(initialRef.current?.tags ?? [])

  const allowNavigation = useUnsavedChanges(dirty)

  const createFn = useServerFn(createPost)
  const updateFn = useServerFn(updatePost)
  const deleteFn = useServerFn(deletePost)

  const saveMutation = useMutation({
    mutationFn: async (latestContent: string) => {
      const data = {
        title,
        slug: slug || undefined,
        content: latestContent,
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
      allowNavigation()
      try {
        localStorage.removeItem(AUTOSAVE_KEY)
      } catch {
        /* private browsing or storage unavailable */
      }
      navigate({ to: '/admin/posts' })
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : 'Failed to save post'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteFn({ data: { id: initial!.id! } }),
    onSuccess: () => {
      allowNavigation()
      navigate({ to: '/admin/posts' })
    },
    onError: () => setError('The post could not be moved to trash.'),
  })

  // Autosave
  const formDataRef = useRef({
    title,
    slug,
    content,
    excerpt,
    coverImage,
    status,
    tags,
  })
  formDataRef.current = {
    title,
    slug,
    content,
    excerpt,
    coverImage,
    status,
    tags,
  }

  useEffect(() => {
    if (isEditing) return
    const interval = setInterval(() => {
      const data = formDataRef.current
      if (data.title || data.content) {
        try {
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data))
          setLastSaved(new Date())
        } catch {
          /* quota exceeded or private browsing */
        }
      }
    }, AUTOSAVE_INTERVAL_MS)
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
          setEditorKey((key) => key + 1)
        }
      }
    } catch {
      /* private browsing or storage unavailable */
    }
  }, [isEditing])

  const previewOpenRef = useRef(previewOpen)
  previewOpenRef.current = previewOpen

  // Pointer opens slide in; keyboard opens appear at once
  const openPreview = (animate: boolean) => {
    if (previewOpenRef.current) return
    void editorRef.current?.flush()
    setPreviewOpen({ animate })
  }
  const openPreviewRef = useRef(openPreview)
  openPreviewRef.current = openPreview

  // Captured before EditorJS sees the keys, so it works with the caret in a block
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPreviewShortcut(event)) return
      event.preventDefault()
      openPreviewRef.current(false)
    }
    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () =>
      window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [])

  const body = useMemo(() => parsePostContent(content), [content])
  const words = countWords(body)
  const readingTime = estimateReadingTime(body)

  const preview = useMemo(() => {
    if (!previewOpen) return null
    const saved = initialRef.current
    return buildPostPreview(
      { title, slug, content, excerpt, coverImage, tags },
      saved?.updatedAt
        ? {
            title: saved.title,
            excerpt: saved.excerpt || null,
            content: saved.content,
            publishedAt: saved.publishedAt ?? null,
            updatedAt: saved.updatedAt,
          }
        : null,
      new Date(),
    )
  }, [previewOpen, title, slug, content, excerpt, coverImage, tags])

  const savedSlug = initialRef.current?.slug
  const publishedUrl =
    initialRef.current?.status === 'published' && savedSlug
      ? `/blog/${savedSlug}`
      : null

  // Keystrokes still inside the editor's debounce are part of the save
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    const flushed = await editorRef.current?.flush()
    const latestContent = flushed ? JSON.stringify(flushed) : content
    if (parsePostContent(latestContent).blocks.length === 0) {
      setError('Content is required')
      return
    }
    saveMutation.mutate(latestContent)
  }

  const saveState = saveMutation.isPending
    ? 'Saving…'
    : dirty
      ? lastSaved && !isEditing
        ? `Unsaved · browser copy ${lastSaved.toLocaleTimeString()}`
        : 'Unsaved changes'
      : initial?.updatedAt
        ? `Saved · ${formatPostDate(initial.updatedAt)}`
        : 'Not saved yet'

  return (
    <form onSubmit={handleSubmit} className="admin-screen post-editor">
      <div className="admin-bar">
        <nav className="post-editor__crumb" aria-label="Breadcrumb">
          <Link to="/admin/posts">Posts</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <b aria-current="page">
            {title || (isEditing ? 'Untitled post' : 'New post')}
          </b>
        </nav>
        <span className="admin-bar__space" />
        <span
          className="post-editor__save"
          data-dirty={dirty || undefined}
          role="status"
        >
          {saveState}
        </span>
        <Button
          size="sm"
          variant="secondary"
          aria-keyshortcuts="Meta+Shift+P Control+Shift+P"
          onClick={() => openPreview(true)}
        >
          <Eye size={16} aria-hidden="true" />
          Preview
        </Button>
        <kbd className="post-editor__kbd" aria-hidden="true">
          {shortcutLabel}
        </kbd>
        <Button
          size="sm"
          variant="primary"
          type="submit"
          pending={saveMutation.isPending}
        >
          {isEditing ? 'Update' : 'Save'}
        </Button>
      </div>

      <div className="post-editor__body">
        <div className="post-editor__canvas">
          <div className="post-editor__doc">
            <FormError message={error} />
            <Textarea
              appearance="plain"
              className="post-editor__title"
              aria-label="Title"
              rows={1}
              value={title}
              onChange={(event) =>
                setTitle(event.target.value.replace(/\s*\n\s*/g, ' '))
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault()
              }}
              placeholder="Post title"
              required
            />
            <p className="post-editor__count">
              {words.toLocaleString()} {words === 1 ? 'word' : 'words'} ·{' '}
              {readingTime} min read
            </p>
            <EditorJsEditor
              key={editorKey}
              ref={editorRef}
              className="post-editor__blocks"
              value={content ? (body as OutputData) : null}
              onChange={(data) => setContent(JSON.stringify(data))}
            />
          </div>
        </div>

        <aside className="post-editor__inspector" aria-label="Post settings">
          <section className="post-editor__section">
            <fieldset className="post-editor__status">
              <legend className="ui-field__label">Publishing</legend>
              <div className="post-editor__segment">
                {STATUS_OPTIONS.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={() => setStatus(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {initial?.updatedAt && (
              <dl className="post-editor__facts">
                <dt>Published</dt>
                <dd>
                  {initial.publishedAt
                    ? formatPostDate(initial.publishedAt)
                    : 'Not yet'}
                </dd>
                <dt>Last edit</dt>
                <dd>{formatPostDate(initial.updatedAt)}</dd>
              </dl>
            )}
          </section>

          <section className="post-editor__section">
            <SlugInput title={title} value={slug} onChange={setSlug} />
            <p className="post-editor__hint">
              adryanev.com/blog/{slug || slugify(title) || '…'}
            </p>
          </section>

          <section className="post-editor__section">
            <Field
              label="Excerpt"
              htmlFor="excerpt"
              optional
              hint={`Left empty, the first ${AUTO_EXCERPT_LENGTH} characters of the body.`}
            >
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={4}
                placeholder="Brief summary…"
              />
            </Field>
          </section>

          <section className="post-editor__section">
            <Field label="Tags">
              <TagInput.Root value={tags} onChange={setTags}>
                <TagInput.List />
                <TagInput.Input placeholder="Add tag…" />
              </TagInput.Root>
            </Field>
          </section>

          <section className="post-editor__section">
            <ImageUploader
              value={coverImage}
              onChange={setCoverImage}
              label="Cover image"
            />
            <Field label="Or paste an image URL" htmlFor="coverImage">
              <Input
                id="coverImage"
                type="text"
                inputMode="url"
                value={coverImage}
                onChange={(event) => setCoverImage(event.target.value)}
                placeholder="https://…"
              />
            </Field>
          </section>

          {isEditing && (
            <section className="post-editor__section">
              <Button
                size="sm"
                variant="ghost"
                className="post-editor__trash"
                pending={deleteMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Move “${initial.title}” to trash?`)) {
                    deleteMutation.mutate()
                  }
                }}
              >
                Move to trash
              </Button>
            </section>
          )}
        </aside>
      </div>

      {previewOpen && preview && (
        <PostPreviewSheet
          preview={preview}
          animateOpen={previewOpen.animate}
          publishedUrl={publishedUrl}
          onClosed={() => setPreviewOpen(null)}
        />
      )}
    </form>
  )
}
