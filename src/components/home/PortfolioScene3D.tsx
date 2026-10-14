import { Link } from '@tanstack/react-router'
import { ArrowUpRight, MoveHorizontal, Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { PortfolioScene, SceneDestination } from './portfolio-scene'

export function PortfolioScene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<PortfolioScene | null>(null)
  const navigationRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState<SceneDestination | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const controller = new AbortController()
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let started = false
    let visible = false
    let scene: PortfolioScene | null = null

    setReducedMotion(preference.matches)
    const motionChanged = () => setReducedMotion(preference.matches)
    preference.addEventListener('change', motionChanged)

    const start = async () => {
      if (started) return
      started = true
      try {
        const { mountPortfolioScene } = await import('./portfolio-scene')
        if (controller.signal.aborted) return
        scene = await mountPortfolioScene({
          canvas,
          signal: controller.signal,
          motionEnabled: !preference.matches,
          onSelect: setActive,
          onNavigate: (destination) => {
            navigationRef.current
              ?.querySelector<HTMLAnchorElement>('[data-scene-link="' + destination + '"]')
              ?.click()
          },
          onFailure: () => setStatus('fallback'),
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
          console.warn('Interactive portfolio could not load; using its static view.', error)
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

    return () => {
      controller.abort()
      observer.disconnect()
      preference.removeEventListener('change', motionChanged)
      scene?.dispose()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.setMotion(!paused && !reducedMotion)
  }, [paused, reducedMotion, status])

  const select = (destination: SceneDestination | null) => {
    setActive(destination)
    sceneRef.current?.select(destination)
  }

  return (
    <figure className="adventure-scene" aria-label="Explore Adryan's workbench">
      <div className="adventure-scene__viewport">
        <img
          className="adventure-scene__fallback"
          src="/images/portfolio-atelier.webp"
          width="1400"
          height="1050"
          alt="A blue coding laptop, bound notebook, articulated lamp, and red rocket on a cream workbench"
          data-hidden={status === 'ready' ? '' : undefined}
        />
        <canvas
          ref={canvasRef}
          className="adventure-scene__canvas"
          data-ready={status === 'ready' ? '' : undefined}
          aria-hidden="true"
        />
        <div className="adventure-scene__toolbar">
          <span className="adventure-scene__hint">
            <MoveHorizontal size={14} aria-hidden="true" />
            {status === 'ready' ? 'Drag to explore · pick an object' : 'The workspace'}
          </span>
          {status === 'ready' && !reducedMotion ? (
            <button
              className="adventure-scene__pause"
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? 'Play scene animation' : 'Pause scene animation'}
              title={paused ? 'Play animation' : 'Pause animation'}
            >
              {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
            </button>
          ) : null}
        </div>
      </div>

      <nav ref={navigationRef} className="adventure-scene__nav" aria-label="Explore this portfolio">
        <a
          href="#selected-work"
          data-scene-link="work"
          data-active={active === 'work' ? '' : undefined}
          onPointerEnter={() => select('work')}
          onPointerLeave={() => select(null)}
          onFocus={() => select('work')}
          onBlur={() => select(null)}
        >
          <strong>Work <ArrowUpRight size={15} aria-hidden="true" /></strong>
          <span>Selected projects</span>
        </a>
        <Link
          to="/blog"
          search={{ page: undefined, tag: undefined }}
          data-scene-link="writing"
          data-active={active === 'writing' ? '' : undefined}
          onPointerEnter={() => select('writing')}
          onPointerLeave={() => select(null)}
          onFocus={() => select('writing')}
          onBlur={() => select(null)}
        >
          <strong>Writing <ArrowUpRight size={15} aria-hidden="true" /></strong>
          <span>Technical notes</span>
        </Link>
        <Link
          to="/contact"
          data-scene-link="contact"
          data-active={active === 'contact' ? '' : undefined}
          onPointerEnter={() => select('contact')}
          onPointerLeave={() => select(null)}
          onFocus={() => select('contact')}
          onBlur={() => select(null)}
        >
          <strong>Contact <ArrowUpRight size={15} aria-hidden="true" /></strong>
          <span>Start a conversation</span>
        </Link>
      </nav>
      <figcaption className="sr-only">
        The laptop opens selected work, the notebook opens writing, and the rocket opens contact.
        The same links are available below the scene.
      </figcaption>
    </figure>
  )
}
