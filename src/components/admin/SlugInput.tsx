import { slugify } from '@/lib/slugify'
import { FormInput } from './form/FormInput'

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
      <label className="mb-1.5 block text-xs font-semibold uppercase text-[var(--text-secondary)]">
        Slug
      </label>
      <div className="flex gap-2">
        <FormInput
          type="text"
          value={value || autoSlug}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono"
        />
        {isCustom && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-semibold uppercase text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
