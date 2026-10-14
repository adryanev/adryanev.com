import { useEffect, useRef, type ReactNode, type RefObject } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface EntranceOptions {
  selector?: string
  direction?: Direction
  delay?: number
  stagger?: number
  once?: boolean
}

const offsets: Record<Direction, string> = {
  up: '0 10px', down: '0 -10px', left: '10px 0', right: '-10px 0', none: '0 0',
}

// SSR and unobserved content stay readable. Never hide a section until scroll.
export function useEntrance(
  ref: RefObject<HTMLElement>,
  { selector, direction = 'up', delay = 0, stagger = 0, once = true }: EntranceOptions = {},
) {
  useEffect(() => {
    const root = ref.current
    if (!root || !('IntersectionObserver' in window) || !root.animate) return

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations = new Map<Element, Animation>()
    const targets = selector ? [...root.querySelectorAll<HTMLElement>(selector)] : [root]
    const observer = new IntersectionObserver((entries) => {
      let order = 0
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          animations.get(entry.target)?.cancel()
          animations.delete(entry.target)
          continue
        }
        if (once) observer.unobserve(entry.target)
        if (preference.matches) continue
        const target = entry.target as HTMLElement
        const animation = target.animate([
          { opacity: 0.8, translate: offsets[direction] },
          { opacity: 1, translate: '0 0' },
        ], {
          duration: target.dataset.enter === 'bubble' ? 480 : 360,
          delay: Math.min((delay + order++ * stagger) * 1000, 160),
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        })
        animations.set(target, animation)
        animation.onfinish = () => animations.delete(target)
      }
    }, { threshold: 0, rootMargin: '0px 0px -16px 0px' })

    targets.forEach((target) => observer.observe(target))
    const cancel = () => {
      animations.forEach((animation) => animation.cancel())
      animations.clear()
    }
    const onPreference = () => { if (preference.matches) cancel() }
    const onVisibility = () => { if (document.hidden) cancel() }
    preference.addEventListener('change', onPreference)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      cancel()
      preference.removeEventListener('change', onPreference)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ref, selector, direction, delay, stagger, once])
}

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
  direction?: Direction
  once?: boolean
}

export function Reveal({ children, className, ...options }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEntrance(ref, options)
  return <div ref={ref} className={className}>{children}</div>
}

interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  stagger?: number
  once?: boolean
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.045,
  once = true,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEntrance(ref, { selector: ':scope > [data-stagger-item]', stagger, once })
  return <div ref={ref} className={className}>{children}</div>
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div data-stagger-item className={className}>{children}</div>
}
