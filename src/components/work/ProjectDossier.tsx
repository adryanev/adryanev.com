import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowUpRight, ImageOff } from 'lucide-react'
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
        <section
          className="project-dossier__gallery"
          aria-labelledby="project-images-heading"
        >
          <h2 id="project-images-heading">Project images</h2>
          <div>
            {project.images.map((image, index) => (
              <ProjectImage
                key={image.id}
                image={image}
                title={project.title}
                number={index + 1}
              />
            ))}
          </div>
        </section>
      )}

      <nav className="project-dossier__footer" aria-label="Project navigation">
        <Link to="/portfolio">All projects</Link>
        <Link to="/contact">Get in touch</Link>
      </nav>
    </div>
  )
}
