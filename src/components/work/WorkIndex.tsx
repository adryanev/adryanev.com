import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { WorkArchive } from './WorkArchive'
import type { WorkCategory } from './work-types'

export function WorkIndex({ categories }: { categories: WorkCategory[] }) {
  const [selected, setSelected] = useState<string | null>(() =>
    categories.find((category) => category.slug === 'work')?.slug ?? categories[0]?.slug ?? null,
  )
  const active = categories.find((category) => category.slug === selected)
  const visible = active ? [active] : categories
  const count = visible.reduce((total, category) => total + category.projects.length, 0)

  return (
    <div className="work-page">
      <header className="work-intro">
        <h1>Work,<br />in <em>context.</em></h1>
        <p>Mobile applications, backend systems, and the projects behind them.</p>
      </header>

      <div className="work-bench">
        <WorkArchive categories={categories} selected={active?.slug ?? null} onSelect={setSelected} />
        <section className="work-results" aria-labelledby="work-results-title">
          <div className="work-results__heading">
            <h2 id="work-results-title">{active?.name ?? 'All projects'}</h2>
            <span className="work-count">{count} project{count === 1 ? '' : 's'}</span>
          </div>
          <p className="work-caption">{active?.description || 'Explore the full project archive.'}</p>
          <p className="sr-only" role="status">{active?.name ?? 'All projects'}. {count} projects.</p>

          {count > 0 ? (
            <ul className="work-ledger">
              {visible.flatMap((category) => category.projects.map((project) => (
                <li key={project.id}>
                  <Link
                    className="work-ledger__row"
                    to="/portfolio/$category/$slug"
                    params={{ category: category.slug, slug: project.slug }}
                  >
                    <span className="work-ledger__identity">
                      <strong>{project.title}</strong>
                      <span className="work-ledger__meta">{project.role}{project.workplace ? ` · ${project.workplace}` : ''}</span>
                    </span>
                    <span className="work-ledger__tail"><time>{project.year}</time><ArrowUpRight size={22} aria-hidden="true" /></span>
                    {project.technology.length > 0 ? (
                      <span className="work-technologies" aria-label="Technologies">
                        {project.technology.map((technology, index) => <span key={`${technology}-${index}`}>{technology}</span>)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              )))}
            </ul>
          ) : (
            <div className="work-empty">
              <h3>{categories.length ? 'No projects in this view.' : 'No projects yet.'}</h3>
              <p>{categories.length ? 'Choose another category or browse all projects.' : 'Projects will appear here when they are published.'}</p>
            </div>
          )}
          {active ? <button type="button" className="work-all" onClick={() => setSelected(null)}>Browse all projects <ArrowUpRight size={22} aria-hidden="true" /></button> : null}
        </section>
      </div>

      {categories.length > 0 ? (
        <nav className="work-categories" aria-label="Project categories">
          {categories.map((category) => (
            <button type="button" key={category.id} aria-pressed={active?.slug === category.slug} onClick={() => setSelected(category.slug)}>
              <strong>{category.name}</strong>
              <span>{category.projects.length} project{category.projects.length === 1 ? '' : 's'}</span>
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
