import { useEffect, useMemo, useRef, useState } from 'react'
import { MoveHorizontal } from 'lucide-react'
import { experiencePoints } from './experience-points'
import './resume-worktable.css'

import { Button } from '@/components/ui'
export type ResumeExperience = {
  id: number
  title: string
  organization: string | null
  startDate: string | null
  endDate: string | null
  description: string | null
}

export const WORKTABLE_SLOTS = [
  {
    index: 0,
    short: 'SawitPRO',
    match: 'digital sawit pro',
    position: [2.34, -0.85, 0.29],
  },
  {
    index: 1,
    short: 'EngageMedia',
    match: 'engagemedia',
    position: [3.38, 0.9, 0.29],
  },
  { index: 2, short: 'Majoo', match: 'majoo', position: [0.1, -0.85, 0.29] },
  {
    index: 3,
    short: 'Academy',
    match: 'apple developer academy',
    position: [1.17, 0.9, 0.29],
  },
  {
    index: 4,
    short: 'Sprint Asia',
    match: 'sprint asia',
    position: [-0.96, 0.9, 0.29],
  },
  { index: 5, short: 'TopApp', match: 'topapp', position: [-3.05, 0.9, 0.29] },
  {
    index: 6,
    short: 'Flashsoft',
    match: 'flashsoft',
    position: [-2.02, -0.85, 0.29],
  },
] as const

export type WorktableRole = {
  index: number
  short: string
  match: string
  position: readonly [number, number, number]
  job: ResumeExperience
}

type WorktableScene = {
  select: (index: number, pointIndex: number) => void
  setVisible: (visible: boolean) => void
  setMotion: (enabled: boolean) => void
  dispose: () => void
}

export function ResumeWorktable({
  experience,
}: {
  experience: ResumeExperience[]
}) {
  const roles = useMemo<WorktableRole[]>(
    () =>
      WORKTABLE_SLOTS.flatMap((slot) => {
        const job = experience.find((entry) =>
          entry.organization?.toLowerCase().includes(slot.match),
        )
        return job ? [{ ...slot, job }] : []
      }),
    [experience],
  )
  const [selected, setSelected] = useState<number>(
    () => roles.find((role) => role.index === 2)?.index ?? roles[0]?.index ?? 0,
  )
  const [pointIndex, setPointIndex] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>(
    'loading',
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<WorktableScene | null>(null)
  const selectedRef = useRef(selected)
  const selectRef = useRef<(index: number) => void>(() => {})

  selectedRef.current = selected

  const select = (index: number) => {
    setSelected(index)
    setPointIndex(0)
    sceneRef.current?.select(index, 0)
  }
  const selectPoint = (index: number) => {
    setPointIndex(index)
    sceneRef.current?.select(selected, index)
  }
  selectRef.current = select

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || roles.length === 0) return
    const controller = new AbortController()
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let started = false
    let visible = false
    let scene: WorktableScene | null = null

    const start = async () => {
      if (started) return
      started = true
      try {
        const { mountResumeWorktableScene } =
          await import('./resume-worktable-scene')
        if (controller.signal.aborted) return
        scene = await mountResumeWorktableScene({
          canvas,
          roles,
          selected: selectedRef.current,
          signal: controller.signal,
          motionEnabled: !preference.matches,
          onSelect: (index) => selectRef.current(index),
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
          console.warn(
            'Resume worktable could not load; the resume remains below.',
            error,
          )
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
    const motionChanged = () => scene?.setMotion(!preference.matches)
    preference.addEventListener('change', motionChanged)

    return () => {
      controller.abort()
      observer.disconnect()
      preference.removeEventListener('change', motionChanged)
      scene?.dispose()
      sceneRef.current = null
    }
  }, [roles])

  if (roles.length === 0) return null
  const active = roles.find((role) => role.index === selected) ?? roles[0]
  const points = experiencePoints(active.job.description)

  return (
    <section
      className="resume-worktable"
      aria-labelledby="resume-worktable-title"
    >
      <div className="resume-worktable__layout">
        <figure className="resume-worktable__stage" data-status={status}>
          <img
            className="resume-worktable__poster"
            src="/models/resume-worktable-poster.png"
            width="1400"
            height="750"
            alt="A three-dimensional worktable with small devices and a pull-out record tray"
            data-hidden={status === 'ready' ? '' : undefined}
          />
          <canvas
            ref={canvasRef}
            className="resume-worktable__canvas"
            aria-hidden="true"
            data-ready={status === 'ready' ? '' : undefined}
          />
          <span className="resume-worktable__hint">
            <MoveHorizontal size={15} aria-hidden="true" />{' '}
            {status === 'ready'
              ? 'Drag to rotate · select an object'
              : 'The worktable'}
          </span>
          {status === 'fallback' ? (
            <span className="resume-worktable__error">
              3D view unavailable. Choose a role below or read the full resume.
            </span>
          ) : null}
          <figcaption className="sr-only">
            Select a role to read its real organization, dates, title, and each
            experience point on the 3D pull-out tray. The points are also listed
            beside the scene.
          </figcaption>
        </figure>
        <div className="resume-worktable__intro">
          <h2 id="resume-worktable-title">Worktable</h2>
          <p>Pick an object to open a record of the work behind it.</p>
          <p className="resume-worktable__note">
            The objects are illustrative. The roles and dates come from this
            resume.
          </p>
          <div className="resume-worktable__current" aria-live="polite">
            <span>
              {active.job.startDate?.slice(0, 4) ?? 'Undated'}
              {active.job.endDate
                ? `–${active.job.endDate.slice(0, 4)}`
                : '–now'}
            </span>
            <strong>{active.job.organization}</strong>
            <span>{active.job.title}</span>
          </div>
          {points.length > 0 ? (
            <div className="resume-worktable__details">
              <div className="resume-worktable__details-heading">
                <h3>Experience points</h3>
                <span>
                  {pointIndex + 1} / {points.length}
                </span>
              </div>
              <ol>
                {points.map((point, index) => (
                  <li
                    key={`${active.job.id}-${index}`}
                    data-current={pointIndex === index ? '' : undefined}
                  >
                    {point}
                  </li>
                ))}
              </ol>
              {points.length > 1 ? (
                <div
                  className="resume-worktable__pagination"
                  role="group"
                  aria-label="Browse points on the 3D tray"
                >
                  <Button
                    variant="plain"
                    type="button"
                    onClick={() => selectPoint(Math.max(0, pointIndex - 1))}
                    disabled={pointIndex === 0}
                  >
                    Previous point
                  </Button>
                  <Button
                    variant="plain"
                    type="button"
                    onClick={() =>
                      selectPoint(Math.min(points.length - 1, pointIndex + 1))
                    }
                    disabled={pointIndex === points.length - 1}
                  >
                    Next point
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div
        className="resume-worktable__roles"
        role="group"
        aria-label="Choose a resume role on the worktable"
      >
        {roles.map((role) => (
          <Button
            variant="plain"
            type="button"
            key={role.job.id}
            aria-pressed={selected === role.index}
            onClick={() => select(role.index)}
          >
            <span>{role.job.startDate?.slice(0, 4) ?? '—'}</span>
            <strong>{role.short}</strong>
          </Button>
        ))}
      </div>
    </section>
  )
}
