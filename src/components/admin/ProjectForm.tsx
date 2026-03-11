import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SlugInput } from './SlugInput'
import { ImageUploader } from './ImageUploader'
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
  sortOrder: number
  images: { url: string; alt?: string }[]
}

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
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? 0)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear())
  const [role, setRole] = useState(initial?.role ?? '')
  const [workplace, setWorkplace] = useState(initial?.workplace ?? '')
  const [techInput, setTechInput] = useState('')
  const [technology, setTechnology] = useState<string[]>(initial?.technology ?? [])
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? '')
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(initial?.status ?? 'draft')
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
  const [images, setImages] = useState<{ url: string; alt?: string }[]>(initial?.images ?? [])
  const [error, setError] = useState('')

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
        sortOrder,
        images,
      }
      if (isEditing) return updateFn({ data: { ...data, id: initial!.id! } })
      return createFn({ data })
    },
    onSuccess: () => {
      navigate({ to: '/admin/portfolio' })
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to save project'),
  })

  const addTech = useCallback(() => {
    const t = techInput.trim()
    if (t && !technology.includes(t)) setTechnology([...technology, t])
    setTechInput('')
  }, [techInput, technology])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    saveMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
        </div>
        <SlugInput title={title} value={slug} onChange={setSlug} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Year</label>
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Sort Order</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Role</label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)} required className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} placeholder="e.g. Lead Developer" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Workplace</label>
          <input type="text" value={workplace} onChange={(e) => setWorkplace(e.target.value)} required className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} placeholder="e.g. Lexicon" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Description (Markdown)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={10} className={cn('w-full rounded-md border px-3 py-2 font-mono text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
      </div>

      {/* Technology tags */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Technologies</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {technology.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {t}
              <button type="button" onClick={() => setTechnology(technology.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTech() } }} className={cn('flex-1 rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} placeholder="Type and press Enter" />
          <button type="button" onClick={addTech} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Add</button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">GitHub URL <span className="text-slate-400">(optional)</span></label>
          <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">External URL <span className="text-slate-400">(optional)</span></label>
          <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
        </div>
      </div>

      {/* Screenshots */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Screenshots</label>
        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <img src={img.url} alt={img.alt} className="h-20 w-20 rounded object-cover" />
              <div className="flex-1">
                <input type="text" value={img.alt ?? ''} onChange={(e) => { const newImages = [...images]; newImages[i] = { ...img, alt: e.target.value }; setImages(newImages) }} className={cn('w-full rounded-md border px-2 py-1 text-sm', 'border-slate-300 dark:border-slate-700 dark:bg-slate-800')} placeholder="Alt text" />
              </div>
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <ImageUploader value="" onChange={(url) => setImages([...images, { url }])} label="Add Screenshot" />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Status</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="status" value="draft" checked={status === 'draft'} onChange={() => setStatus('draft')} className="accent-accent" /> Draft
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="status" value="published" checked={status === 'published'} onChange={() => setStatus('published')} className="accent-accent" /> Published
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
        <button type="button" onClick={() => navigate({ to: '/admin/portfolio' })} className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
        <button type="submit" disabled={saveMutation.isPending} className={cn('flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium', 'bg-accent text-slate-950 hover:bg-accent-hover', 'disabled:opacity-60')}>
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
