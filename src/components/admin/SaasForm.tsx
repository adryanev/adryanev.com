import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SlugInput } from './SlugInput'
import { ImageUploader } from './ImageUploader'
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
  const [techInput, setTechInput] = useState('')
  const [technology, setTechnology] = useState<string[]>(initial?.technology ?? [])
  const [status, setStatus] = useState<'active' | 'beta' | 'retired'>(initial?.status ?? 'active')
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
  const [error, setError] = useState('')

  const createFn = useServerFn(createSaasListing)
  const updateFn = useServerFn(updateSaasListing)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = { name, slug: slug || undefined, description, url: url || undefined, githubUrl: githubUrl || undefined, logoUrl: logoUrl || undefined, technology, status, sortOrder }
      if (isEditing) return updateFn({ data: { ...data, id: initial!.id! } })
      return createFn({ data })
    },
    onSuccess: () => {
      navigate({ to: '/admin/saas' })
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to save'),
  })

  const addTech = useCallback(() => {
    const t = techInput.trim()
    if (t && !technology.includes(t)) setTechnology([...technology, t])
    setTechInput('')
  }, [techInput, technology])

  return (
    <form onSubmit={(e) => { e.preventDefault(); setError(''); saveMutation.mutate() }} className="space-y-6">
      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
        </div>
        <SlugInput title={name} value={slug} onChange={setSlug} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">URL <span className="text-slate-400">(optional)</span></label>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">GitHub URL <span className="text-slate-400">(optional)</span></label>
          <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
        </div>
      </div>

      <ImageUploader value={logoUrl} onChange={setLogoUrl} label="Logo" />

      {/* Technology tags */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Technologies</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {technology.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {t}<button type="button" onClick={() => setTechnology(technology.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
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
          <label className="mb-1.5 block text-sm font-medium">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'beta' | 'retired')} className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white', 'dark:border-slate-700 dark:bg-slate-800')}>
            <option value="active">Active</option>
            <option value="beta">Beta</option>
            <option value="retired">Retired</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Sort Order</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none', 'border-slate-300 bg-white focus:border-accent', 'dark:border-slate-700 dark:bg-slate-800')} />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
        <button type="button" onClick={() => navigate({ to: '/admin/saas' })} className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Cancel</button>
        <button type="submit" disabled={saveMutation.isPending} className={cn('flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium', 'bg-accent text-slate-950 hover:bg-accent-hover', 'disabled:opacity-60')}>
          <Save className="h-4 w-4" />{saveMutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
