import { cn } from '@/lib/utils'

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
      {options.map((option) => {
        const isActive = value === option.value
        const color = option.activeColor ?? 'var(--text-primary)'

        return (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-3 border p-3 cursor-pointer transition-colors',
              isActive
                ? `border-[${color}] bg-[var(--bg-secondary)]`
                : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isActive}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <div
              className={cn(
                'h-3 w-3 border flex items-center justify-center transition-colors rounded-none',
                isActive ? `border-[${color}]` : 'border-[var(--border-color)]',
              )}
            >
              {isActive && (
                <div
                  className="h-1.5 w-1.5"
                  style={{ backgroundColor: color }}
                />
              )}
            </div>
            <span
              className="text-sm font-medium"
              style={isActive && option.activeColor ? { color: option.activeColor } : undefined}
            >
              {option.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}
