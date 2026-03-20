import { useEffect } from 'react'

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const locks = Number(document.body.dataset.scrollLocks || 0)
    document.body.dataset.scrollLocks = String(locks + 1)
    document.body.style.overflow = 'hidden'
    return () => {
      const remaining = Number(document.body.dataset.scrollLocks || 0) - 1
      document.body.dataset.scrollLocks = String(remaining)
      if (remaining <= 0) document.body.style.overflow = ''
    }
  }, [active])
}
