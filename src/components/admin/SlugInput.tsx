import { cn } from '@/lib/utils'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function SlugInput({
  title,
  value,
  onChange,
}: {
  title: string
  value: string
  onChange: (slug: string) => void
}) {
  const autoSlug = slugify(title)
  const isCustom = value !== '' && value !== autoSlug

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">Slug</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value || autoSlug}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'flex-1 rounded-md border px-3 py-2 font-mono text-sm outline-none transition-colors',
            'border-slate-300 bg-white focus:border-accent focus:ring-1 focus:ring-accent',
            'dark:border-slate-700 dark:bg-slate-800 dark:focus:border-accent',
          )}
        />
        {isCustom && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-md px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
