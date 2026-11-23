import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from 'lucide-react'
import './project-dossier.css'

import { useMermaidRenderer } from '@/hooks/useMermaidRenderer'
import { useCodeHighlighter } from '@/hooks/useCodeHighlighter'

import { Button } from '@/components/ui'

export interface ProjectDossierData {
  title: string
  role: string
  year: number
  workplace: string
  technology: string[]
  descriptionHtml: string
  externalUrl: string | null
  githubUrl: string | null
  category: { name: string; slug: string }
  images: { id: number; url: string; alt: string | null }[]
}

function ProjectImage({
  image,
  title,
  number,
}: {
  image: ProjectDossierData['images'][number]
  title: string
  number: number
}) {
  const ref = useRef<HTMLImageElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = ref.current
    setFailed(Boolean(element?.complete && element.naturalWidth === 0))
  }, [image.url])

  return (
    <figure className="project-dossier__image">
      <a
        href={image.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${title} image ${number} in a new tab`}
      >
        {failed ? (
          <div className="project-dossier__image-error">
            <ImageOff aria-hidden="true" />
            <p>Image unavailable</p>
            <span>
              Open original image <ArrowUpRight aria-hidden="true" />
            </span>
          </div>
        ) : (
          <img
            ref={ref}
            src={image.url}
            alt={image.alt || `${title}, project image ${number}`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
      </a>
      {image.alt && <figcaption>{image.alt}</figcaption>}
    </figure>
  )
}

const SUBPIXEL_SCROLL_TOLERANCE = 0.01

function slidePosition(track: HTMLElement) {
  return track.scrollLeft / track.clientWidth
}

function ProjectGallery({
  images,
  title,
}: {
  images: ProjectDossierData['images']
  title: string
}) {
  const trackRef = useRef<HTMLUListElement>(null)
  // The slide a button click is still scrolling to, so repeated clicks during
  // a smooth scroll keep stepping instead of retargeting the same slide.
  const pendingSlideRef = useRef<number | null>(null)
  const [current, setCurrent] = useState(0)
  const hasMultipleImages = images.length > 1

  function showAdjacentSlide(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    const from = pendingSlideRef.current ?? Math.round(slidePosition(track))
    const index = Math.min(Math.max(from + direction, 0), images.length - 1)
    pendingSlideRef.current = index
    track.scrollTo({ left: index * track.clientWidth })
  }

  function syncCurrentSlide(track: HTMLElement) {
    const position = slidePosition(track)
    setCurrent(Math.round(position))
    const pendingSlide = pendingSlideRef.current
    const reachedPendingSlide =
      pendingSlide !== null &&
      Math.abs(position - pendingSlide) < SUBPIXEL_SCROLL_TOLERANCE
    if (reachedPendingSlide) pendingSlideRef.current = null
  }

  function releasePendingSlide() {
    pendingSlideRef.current = null
  }

  return (
    <section
      className="project-dossier__gallery"
      aria-labelledby="project-images-heading"
    >
      <div className="project-dossier__gallery-header">
        <h2 id="project-images-heading">Project images</h2>
        {hasMultipleImages && (
          <div className="project-dossier__gallery-controls">
            <p aria-live="polite">
              {current + 1} / {images.length}
            </p>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous image"
              disabled={current === 0}
              onClick={() => showAdjacentSlide(-1)}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next image"
              disabled={current === images.length - 1}
              onClick={() => showAdjacentSlide(1)}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      <ul
        ref={trackRef}
        className="project-dossier__gallery-track"
        tabIndex={hasMultipleImages ? 0 : undefined}
        aria-label={`${title} images`}
        onScroll={(event) => syncCurrentSlide(event.currentTarget)}
        onPointerDown={releasePendingSlide}
        onWheel={releasePendingSlide}
        onKeyDown={releasePendingSlide}
      >
        {images.map((image, index) => (
          <li key={image.id}>
            <ProjectImage image={image} title={title} number={index + 1} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ProjectDossier({ project }: { project: ProjectDossierData }) {
  const contentRef = useRef<HTMLDivElement>(null)
  useMermaidRenderer(contentRef, project.descriptionHtml, true)
  useCodeHighlighter(contentRef, project.descriptionHtml)

  return (
    <div className="project-dossier">
      <Link
        to="/portfolio/$category"
        params={{ category: project.category.slug }}
        className="project-dossier__back"
      >
        <ArrowLeft aria-hidden="true" /> Back to {project.category.name}
      </Link>

      <header className="project-dossier__header">
        <div>
          <h1>{project.title}</h1>
          <p className="project-dossier__role">{project.role}</p>
        </div>
        {(project.externalUrl || project.githubUrl) && (
          <div className="project-dossier__actions">
            {project.externalUrl && (
              <Button asChild size="lg">
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open project <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="secondary" size="lg">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
            )}
          </div>
        )}
      </header>

      <div className="project-dossier__body">
        <article
          className="project-dossier__notes"
          aria-labelledby="project-notes-heading"
        >
          <h2 id="project-notes-heading">Project notes</h2>
          {project.descriptionHtml ? (
            <div
              ref={contentRef}
              className="project-dossier__prose prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
            />
          ) : (
            <p className="project-dossier__empty">
              Project notes are currently unavailable.
            </p>
          )}
        </article>

        <aside className="project-dossier__record" aria-label="Project details">
          <dl>
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Workplace</dt>
              <dd>{project.workplace}</dd>
            </div>
          </dl>
          <section
            className="project-dossier__technology"
            aria-labelledby="project-technologies-heading"
          >
            <h2 id="project-technologies-heading">Technologies</h2>
            {project.technology.length ? (
              <ul>
                {project.technology.map((technology, index) => (
                  <li key={`${technology}-${index}`}>{technology}</li>
                ))}
              </ul>
            ) : (
              <p className="project-dossier__empty">
                No technology details listed.
              </p>
            )}
          </section>
        </aside>
      </div>

      {project.images.length > 0 && (
        <ProjectGallery images={project.images} title={project.title} />
      )}

      <nav className="project-dossier__footer" aria-label="Project navigation">
        <Link to="/portfolio">All projects</Link>
        <Link to="/contact">Get in touch</Link>
      </nav>
    </div>
  )
}
