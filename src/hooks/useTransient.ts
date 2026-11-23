import { useCallback, useEffect, useRef, useState } from 'react'

// A value that clears itself after durationMs, for success notices and
// row highlights
export function useTransient<T>(
  durationMs: number,
): [T | null, (value: T) => void] {
  const [value, setValue] = useState<T | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  const show = useCallback(
    (next: T) => {
      clearTimeout(timer.current)
      setValue(next)
      timer.current = setTimeout(() => setValue(null), durationMs)
    },
    [durationMs],
  )
  return [value, show]
}
