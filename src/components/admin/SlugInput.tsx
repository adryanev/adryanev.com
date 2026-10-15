import { slugify } from '@/lib/slugify'
import { Input as FormInput, Field as FormField, Button } from '@/components/ui'

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
    <FormField label="URL slug">
      <div className="flex gap-2">
        <FormInput
          value={value || autoSlug}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 font-mono"
        />
        {isCustom && (
          <Button
            variant="secondary"
            type="button"
            onClick={() => onChange('')}
          >
            Reset
          </Button>
        )}
      </div>
    </FormField>
  )
}
