import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { X } from 'lucide-react'
import { SlugInput } from './SlugInput'
import { ImageUploader } from './ImageUploader'
import {
  Field as FormField,
  Input as FormInput,
  Select as FormSelect,
  FormError,
} from '@/components/ui'
import { RowAction } from './RowActions'
import { SortableList } from './SortableList'

import { EditorJsEditor } from './EditorJsEditor'
import type { OutputData } from '@editorjs/editorjs'

import { FormActions } from './form/FormActions'
import { TagInput } from './form/TagInput'
import { StatusRadio } from './form/StatusRadio'
import {
  createProject,
  updateProject,
} from '@/server/functions/portfolio.functions'

type ProjectData = {
  id?: number
  title: string
  slug: string
  categoryId: number
  description: string
  year: number
  role: string
  workplace: string
  technology: string[]
  githubUrl: string
  externalUrl: string
  status: 'draft' | 'published'
  images: { url: string; alt?: string }[]
}

const STATUS_OPTIONS = [
  { value: 'draft' as const, label: 'Draft' },
  {
    value: 'published' as const,
    label: 'Published',
    activeColor: 'var(--accent)',
  },
]

import { editorContent, editorContentSignature } from '@/lib/editor-content'

export function ProjectForm({
  initial,
  categories,
}: {
  initial?: ProjectData
  categories: { id: number; name: string }[]
}) {
  const navigate = useNavigate()
  const isEditing = !!initial?.id

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? 0,
  )
  const [description, setDescription] = useState(() =>
    initial?.description
      ? JSON.stringify(editorContent(initial.description))
      : '',
  )
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear())
  const [role, setRole] = useState(initial?.role ?? '')
  const [workplace, setWorkplace] = useState(initial?.workplace ?? '')
  const [technology, setTechnology] = useState<string[]>(
    initial?.technology ?? [],
  )
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? '')
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(
    initial?.status ?? 'draft',
  )
  const [images, setImages] = useState<{ url: string; alt?: string }[]>(
    initial?.images ?? [],
  )
  const [error, setError] = useState('')
  const initialRef = useRef(initial)

  const dirty =
    title !== (initialRef.current?.title ?? '') ||
    slug !== (initialRef.current?.slug ?? '') ||
    editorContentSignature(description) !==
      editorContentSignature(initialRef.current?.description ?? '') ||
    categoryId !== (initialRef.current?.categoryId ?? categories[0]?.id ?? 0) ||
    role !== (initialRef.current?.role ?? '') ||
    workplace !== (initialRef.current?.workplace ?? '') ||
    status !== (initialRef.current?.status ?? 'draft') ||
    JSON.stringify(technology) !==
      JSON.stringify(initialRef.current?.technology ?? []) ||
    year !== (initialRef.current?.year ?? new Date().getFullYear()) ||
    githubUrl !== (initialRef.current?.githubUrl ?? '') ||
    externalUrl !== (initialRef.current?.externalUrl ?? '') ||
    JSON.stringify(images) !== JSON.stringify(initialRef.current?.images ?? [])

  const allowNavigation = useUnsavedChanges(dirty)
  const createFn = useServerFn(createProject)
  const updateFn = useServerFn(updateProject)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        title,
        slug: slug || undefined,
        categoryId,
        description,
        year,
        role,
        workplace,
        technology,
        githubUrl: githubUrl || undefined,
        externalUrl: externalUrl || undefined,
        status,
        images,
      }
      if (isEditing) return updateFn({ data: { ...data, id: initial!.id! } })
      return createFn({ data })
    },
    onSuccess: () => {
      allowNavigation()
      return navigate({ to: '/admin/portfolio' })
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : 'Failed to save project'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (saveMutation.isPending) return
    setError('')
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!description.trim()) {
      setError('Description is required')
      return
    }
    try {
      const parsed = JSON.parse(description) as OutputData
      if (!parsed.blocks || parsed.blocks.length === 0) {
        setError('Description is required')
        return
      }
    } catch {
      setError('Description is required')
      return
    }
    saveMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <FormError message={error} />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Title">
          <FormInput
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>
        <SlugInput title={title} value={slug} onChange={setSlug} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Category">
          <FormSelect
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField label="Year">
          <FormInput
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            required
          />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Role">
          <FormInput
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            placeholder="e.g. Lead Developer"
          />
        </FormField>
        <FormField label="Workplace">
          <FormInput
            type="text"
            value={workplace}
            onChange={(e) => setWorkplace(e.target.value)}
            required
            placeholder="e.g. Lexicon"
          />
        </FormField>
      </div>

      <FormField label="Description">
        <EditorJsEditor
          value={editorContent(description)}
          onChange={(data) => setDescription(JSON.stringify(data))}
        />
      </FormField>

      <FormField label="Technologies">
        <TagInput.Root value={technology} onChange={setTechnology}>
          <TagInput.List />
          <TagInput.Input placeholder="Type and press Enter" />
        </TagInput.Root>
      </FormField>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="GitHub URL" optional>
          <FormInput
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </FormField>
        <FormField label="External URL" optional>
          <FormInput
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Screenshots">
        <SortableList
          as="ul"
          itemAs="li"
          className="space-y-3"
          items={images}
          getKey={(img) => img.url}
          itemLabel={(img) => img.alt || img.url.split('/').pop() || img.url}
          onMove={setImages}
          onDrop={setImages}
        >
          {(img, handle) => {
            const position = images.indexOf(img) + 1
            return (
              <div className="flex items-start gap-3 border border-[var(--border-color)] bg-[var(--surface-paper)] p-3">
                {handle}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-20 w-20 object-cover"
                />
                <div className="flex-1">
                  <FormInput
                    type="text"
                    aria-label={`Caption for image ${position}`}
                    value={img.alt ?? ''}
                    onChange={(e) =>
                      setImages(
                        images.map((image) =>
                          image === img ? { ...img, alt: e.target.value } : image,
                        ),
                      )
                    }
                    placeholder="Alt text"
                  />
                </div>
                <RowAction
                  type="button"
                  label={`Remove image ${position}`}
                  onClick={() => setImages(images.filter((image) => image !== img))}
                >
                  <X size={16} aria-hidden="true" />
                </RowAction>
              </div>
            )
          }}
        </SortableList>
        <div className="mt-3">
          <ImageUploader
            value=""
            onChange={(url) => setImages([...images, { url }])}
            label="Add Screenshot"
          />
        </div>
      </FormField>

      <FormField label="Status">
        <StatusRadio
          name="status"
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
        />
      </FormField>

      <FormActions
        isPending={saveMutation.isPending}
        isEditing={isEditing}
        onCancel={() => navigate({ to: '/admin/portfolio' })}
      />
    </form>
  )
}
