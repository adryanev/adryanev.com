
import { useBlocker } from '@tanstack/react-router'
import { useRef, useCallback } from 'react'

export function useUnsavedChanges(dirty: boolean) {
  const saved = useRef(false)
  useBlocker({
    shouldBlockFn: () => dirty && !saved.current && !window.confirm('Leave this page and discard your unsaved changes?'),
    enableBeforeUnload: () => dirty && !saved.current,
  })
  return useCallback(() => { saved.current = true }, [])
}
