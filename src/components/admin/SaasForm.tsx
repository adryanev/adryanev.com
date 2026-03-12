import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { SlugInput } from './SlugInput'
import { ImageUploader } from './ImageUploader'
import { FormField } from './form/FormField'
import { FormInput } from './form/FormInput'
import { FormTextarea } from './form/FormTextarea'
import { FormSelect } from './form/FormSelect'
import { FormError } from './form/FormError'
import { FormActions } from './form/FormActions'
import { TagInput } from './form/TagInput'
import { createSaasListing, updateSaasListing } from '@/server/functions/saas.functions'

type SaasData = {
  id?: number
  name: string
  slug: string
  description: string
  url: string
  githubUrl: string
  logoUrl: string
  technology: string[]
  status: 'active' | 'beta' | 'retired'
  sortOrder: number
}

export function SaasForm({ initial }: { initial?: SaasData }) {
  const navigate = useNavigate()
  const isEditing = !!initial?.id

  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? '')
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? '')
  const [technology, setTechnology] = useState<string[]>(initial?.technology ?? [])
  const [status, setStatus] = useState<'active' | 'beta' | 'retired'>(initial?.status ?? 'active')
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  const initialRef = useRef(initial)

  useEffect(() => {
    const init = initialRef.current
    const changed = name !== (init?.name ?? '') ||
      slug !== (init?.slug ?? '') ||
      description !== (init?.description ?? '') ||
      url !== (init?.url ?? '') ||
      githubUrl !== (init?.githubUrl ?? '') ||
      logoUrl !== (init?.logoUrl ?? '') ||
      sortOrder !== (init?.sortOrder ?? 0) ||
      status !== (init?.status ?? 'active') ||
      JSON.stringify(technology) !== JSON.stringify(init?.technology ?? [])
    setDirty(changed)
  }, [name, slug, description, url, githubUrl, logoUrl, sortOrder, status, technology])

  useUnsavedChanges(dirty)

  const createFn = useServerFn(createSaasListing)
  const updateFn = useServerFn(updateSaasListing)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        name,
        slug: slug || undefined,
        description,
        url: url || undefined,
        githubUrl: githubUrl || undefined,
        logoUrl: logoUrl || undefined,
        technology,
        status,
        sortOrder,
      }
      if (isEditing) return updateFn({ data: { ...data, id: initial!.id! } })
      return createFn({ data })
    },
    onSuccess: () => navigate({ to: '/admin/saas' }),
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to save'),
  })

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setError(''); saveMutation.mutate() }}
      className="space-y-6 max-w-4xl"
    >
      <FormError message={error} />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Name">
          <FormInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>
        <SlugInput title={name} value={slug} onChange={setSlug} />
      </div>

      <FormField label="Description">
        <FormTextarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
        />
      </FormField>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="URL" optional>
          <FormInput
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </FormField>
        <FormField label="GitHub URL" optional>
          <FormInput
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </FormField>
      </div>

      <ImageUploader value={logoUrl} onChange={setLogoUrl} label="Logo" />

      <FormField label="Technologies">
        <TagInput.Root value={technology} onChange={setTechnology}>
          <TagInput.List />
          <TagInput.Input placeholder="Type and press Enter" />
        </TagInput.Root>
      </FormField>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Status">
          <FormSelect
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'beta' | 'retired')}
          >
            <option value="active">Active</option>
            <option value="beta">Beta</option>
            <option value="retired">Retired</option>
          </FormSelect>
        </FormField>
        <FormField label="Sort Order">
          <FormInput
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </FormField>
      </div>

      <FormActions
        isPending={saveMutation.isPending}
        isEditing={isEditing}
        onCancel={() => navigate({ to: '/admin/saas' })}
      />
    </form>
  )
}
