import { useEffect, useRef, useState } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import type { WorkCategory } from './work-types'
import type { mountWorkArchive } from './work-archive-scene'

type ArchiveScene = Awaited<ReturnType<typeof mountWorkArchive>>

// three.js stays out of the Worker bundle
const loadArchiveScene = createClientOnlyFn(() => import('./work-archive-scene'))

export function WorkArchive({ categories, selected, onSelect }: {
  categories: WorkCategory[]
  selected: string | null
  onSelect: (slug: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<ArchiveScene | null>(null)
  const selectionRef = useRef(selected)
  const onSelectRef = useRef(onSelect)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  selectionRef.current = selected
  onSelectRef.current = onSelect

  useEffect(() => { sceneRef.current?.select(selected) }, [selected])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || categories.length === 0) return
    const controller = new AbortController()
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let scene: ArchiveScene | null = null
    let started = false
    let visible = false
    setStatus('loading')

    const start = async () => {
      if (started) return
      started = true
      try {
        const { mountWorkArchive } = await loadArchiveScene()
        if (controller.signal.aborted) return
        scene = await mountWorkArchive({
          canvas, categories, selected: selectionRef.current,
          signal: controller.signal, motion: !preference.matches,
          onSelect: (slug) => onSelectRef.current(slug),
          onContextLost: () => setStatus('fallback'),
        })
        if (controller.signal.aborted) { scene.dispose(); return }
        sceneRef.current = scene
        scene.select(selectionRef.current)
        scene.setVisible(visible && !document.hidden)
        setStatus('ready')
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('Work archive unavailable; category buttons remain available.', error)
          setStatus('fallback')
        }
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      scene?.setVisible(visible && !document.hidden)
      if (visible) void start()
    })
    observer.observe(canvas)
    const motionChanged = () => scene?.setMotion(!preference.matches)
    const visibilityChanged = () => scene?.setVisible(visible && !document.hidden)
    preference.addEventListener('change', motionChanged)
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => {
      controller.abort()
      observer.disconnect()
      preference.removeEventListener('change', motionChanged)
      document.removeEventListener('visibilitychange', visibilityChanged)
      scene?.dispose()
      sceneRef.current = null
    }
  }, [categories])

  return (
    <figure className="work-archive" data-status={status}>
      <div className="work-archive__model">
        <img src="/models/work-archive-poster.webp" width="1400" height="900" alt="An illustrated archive of project folders, devices, and books, made in Blender" />
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      <figcaption className="work-archive__help">
        <span>{status === 'ready' ? 'Select a folder' : status === 'loading' && categories.length ? 'Loading 3D archive' : 'Archive illustration'}</span>
        <span>{status === 'fallback' ? '3D unavailable. Use the category buttons below.' : 'Or use the category buttons below'}</span>
      </figcaption>
    </figure>
  )
}
