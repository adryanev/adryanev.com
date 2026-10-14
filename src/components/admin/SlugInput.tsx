import { slugify } from '@/lib/slugify'
import { FormInput } from './form/FormInput'

import { FormField } from './form/FormField'

export function SlugInput({ title, value, onChange }: { title: string; value: string; onChange: (slug: string) => void }) {
  const autoSlug = slugify(title)
  const isCustom = value !== '' && value !== autoSlug
  return <FormField label="URL slug"><div className="flex gap-2">
    <FormInput value={value || autoSlug} onChange={(event) => onChange(event.target.value)} className="flex-1 font-mono" />
    {isCustom && <button type="button" className="admin-action admin-action--secondary" onClick={() => onChange('')}>Reset</button>}
  </div></FormField>
}
