import { cn } from '@/lib/utils'

import { Input } from '@/components/ui'

interface StatusOption<T extends string> {
  value: T
  label: string
  activeColor?: string
}

export function StatusRadio<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string
  value: T
  onChange: (value: T) => void
  options: StatusOption<T>[]
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'admin-status-choice',
            value === option.value && 'is-selected',
          )}
        >
          <Input
            appearance="plain"
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )
}
