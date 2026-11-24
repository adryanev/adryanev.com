import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, ArrowUpRight, ImageOff } from 'lucide-react'
import './project-dossier.css'

import { useMermaidRenderer } from '@/hooks/useMermaidRenderer'
import { useCodeHighlighter } from '@/hooks/useCodeHighlighter'
import type { ProjectMetric as ProjectMetricData } from '@/lib/project-metrics'
import { ProjectMetric } from '@/components/work/ProjectMetric'

import { Button } from '@/components/ui'

export interface ProjectDossierData {
  title: string
  role: string
  year: number
  workplace: string
  technology: string[]
  ledeHtml: string
  descriptionHtml: string
  metrics: ProjectMetricData[]
  metricsNote: string | null
  externalUrl: string | null
  githubUrl: string | null
  category: { name: string; slug: string }
  images: { id: number; url: string; alt: string | null }[]
  nextProject: { slug: string; title: string; role: string; year: number } | null
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
    <figure className="project-dossier__shot">
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
            loading={number === 1 ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
      </a>
      {image.alt && <figcaption>{image.alt}</figcaption>}
    </figure>
  )
}

function NextProjectCard({ project }: { project: ProjectDossierData }) {
  const { category, nextProject } = project

  if (!nextProject) {
    return (
      <Link
        to="/portfolio/$category"
        params={{ category: category.slug }}
        className="project-dossier__next"
      >
        <div>
          <small>Last project in {category.name}</small>
          <h2>Back to {category.name}</h2>
        </div>
        <ArrowRight aria-hidden="true" />
      </Link>
    )
  }

  return (
    <Link
      to="/portfolio/$category/$slug"
      params={{ category: category.slug, slug: nextProject.slug }}
      className="project-dossier__next"
    >
      <div>
        <small>Next in {category.name}</small>
        <h2>{nextProject.title}</h2>
        <small>
          {nextProject.role} · {nextProject.year}
        </small>
      </div>
      <ArrowRight aria-hidden="true" />
    </Link>
  )
}

export function ProjectDossier({ project }: { project: ProjectDossierData }) {
  const contentRef = useRef<HTMLDivElement>(null)
  useMermaidRenderer(contentRef, project.descriptionHtml, true)
  useCodeHighlighter(contentRef, project.descriptionHtml)
  const hasImages = project.images.length > 0
  const hasNotes = Boolean(project.ledeHtml || project.descriptionHtml)

  return (
    <div className="project-dossier">
      <Link
        to="/portfolio/$category"
        params={{ category: project.category.slug }}
        className="project-dossier__back"
      >
        <ArrowLeft aria-hidden="true" /> {project.category.name}
      </Link>

      <div className="project-dossier__grid" data-solo={!hasImages || undefined}>
        <article className="project-dossier__story">
          <h1>{project.title}</h1>
          <p className="project-dossier__meta">
            {project.role}{' '}
            <span>
              · {project.workplace} · {project.year}
            </span>
          </p>

          {project.ledeHtml && (
            <p
              className="project-dossier__lede"
              dangerouslySetInnerHTML={{ __html: project.ledeHtml }}
            />
          )}

          {project.metrics.length > 0 && (
            <div className="project-dossier__metrics">
              {project.metrics.map((metric, index) => (
                <ProjectMetric key={index} metric={metric} />
              ))}
              {project.metricsNote && (
                <p className="project-dossier__metrics-note">
                  {project.metricsNote}
                </p>
              )}
            </div>
          )}

          {project.descriptionHtml && (
            <div
              ref={contentRef}
              className="project-dossier__prose prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
            />
          )}
          {!hasNotes && (
            <p className="project-dossier__empty">
              Project notes are currently unavailable.
            </p>
          )}

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

          <ul className="project-dossier__facts" aria-label="Category and technologies">
            <li>
              <b>{project.category.name}</b>
            </li>
            {project.technology.map((technology, index) => (
              <li key={`${technology}-${index}`}>{technology}</li>
            ))}
          </ul>
        </article>

        {hasImages && (
          <section
            className="project-dossier__shots"
            aria-label={`${project.title} images`}
          >
            {project.images.map((image, index) => (
              <ProjectImage
                key={image.id}
                image={image}
                title={project.title}
                number={index + 1}
              />
            ))}
          </section>
        )}
      </div>

      <NextProjectCard project={project} />
    </div>
  )
}
