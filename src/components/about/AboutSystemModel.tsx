import { useEffect, useRef, useState } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import type { AboutSystemScene } from './about-system-scene'

import { Button } from '@/components/ui'

// three.js stays out of the Worker bundle
const loadAboutScene = createClientOnlyFn(() => import('./about-system-scene'))

const practices =['Applications', 'Backend', 'Delivery'] as const

type AboutSystemModelProps = {
  active: number
  onSelect: (index: number) => void
}

export function AboutSystemModel({ active, onSelect }: AboutSystemModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<AboutSystemScene | null>(null)
  const onSelectRef = useRef(onSelect)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>(
    'loading',
  )

  onSelectRef.current = onSelect

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const controller = new AbortController()
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    let started = false
    let visible = false
    let scene: AboutSystemScene | null = null

    const start = async () => {
      if (started) return
      started = true
      try {
        const { mountAboutSystemScene } = await loadAboutScene()
        if (controller.signal.aborted) return
        scene = await mountAboutSystemScene({
          canvas,
          signal: controller.signal,
          motionEnabled: !motionPreference.matches,
          onSelect: (index) => onSelectRef.current(index),
          onFailure: () => {
            sceneRef.current = null
            setStatus('fallback')
          },
        })
        if (controller.signal.aborted) {
          scene.dispose()
          return
        }
        sceneRef.current = scene
        scene.setVisible(visible)
        setStatus('ready')
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('About model could not load; showing its render.', error)
          setStatus('fallback')
        }
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      scene?.setVisible(visible)
      if (visible) void start()
    })
    observer.observe(canvas)

    const motionChanged = () => scene?.setMotion(!motionPreference.matches)
    motionPreference.addEventListener('change', motionChanged)

    return () => {
      controller.abort()
      observer.disconnect()
      motionPreference.removeEventListener('change', motionChanged)
      scene?.dispose()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.select(active)
  }, [active, status])

  return (
    <div className="about-model" data-status={status}>
      <span className="about-model__hint">
        Click a practice to focus the model
      </span>
      <span className="about-model__status" aria-live="polite">
        {practices[active]}
      </span>
      <img
        className="about-model__poster"
        src="/models/about-system-poster.webp"
        width="1400"
        height="750"
        alt="A model connecting application interfaces, a backend core, and a delivery rack"
        data-hidden={status === 'ready' ? '' : undefined}
      />
      <canvas
        ref={canvasRef}
        className="about-model__canvas"
        data-ready={status === 'ready' ? '' : undefined}
        aria-hidden="true"
      />
      <div
        className="about-model__controls"
        role="group"
        aria-label="Focus a practice in the model"
      >
        {practices.map((practice, index) => (
          <Button
            variant="plain"
            key={practice}
            type="button"
            aria-pressed={active === index}
            onClick={() => onSelect(index)}
          >
            {practice}
          </Button>
        ))}
      </div>
    </div>
  )
}
