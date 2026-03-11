import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Briefcase, GraduationCap, Award, Wrench, MapPin, Calendar, Download, Loader2, Mail, Github, Linkedin, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublicResume } from '@/server/functions/public.functions'

export const Route = createFileRoute('/resume')({
  loader: () => getPublicResume(),
  component: ResumePage,
  head: () => ({
    meta: [
      { title: 'Resume — Adryan Eka Vandra' },
      {
        name: 'description',
        content:
          'Resume of Adryan Eka Vandra — Software Engineer. Experience, education, certifications, and skills.',
      },
    ],
  }),
})

const typeConfig = {
  experience: { label: 'Experience', icon: Briefcase },
  education: { label: 'Education', icon: GraduationCap },
  certification: { label: 'Certifications', icon: Award },
  skill: { label: 'Skills', icon: Wrench },
} as const

function ResumePage() {
  const resume = Route.useLoaderData()
  const [generating, setGenerating] = useState(false)

  const sections = [
    { type: 'experience' as const, entries: resume.experience },
    { type: 'education' as const, entries: resume.education },
    { type: 'certification' as const, entries: resume.certification },
    { type: 'skill' as const, entries: resume.skill },
  ].filter((s) => s.entries.length > 0)

  async function handleDownload() {
    setGenerating(true)
    try {
      const { generateResumePDF } = await import(
        '@/components/resume/ResumePDF'
      )
      await generateResumePDF(resume)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Adryan Eka Vandra</h1>
          <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">
            Software Engineer
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
            <a href="mailto:adryanekavandra@gmail.com" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <Mail className="h-3.5 w-3.5" />
              adryanekavandra@gmail.com
            </a>
            <a href="https://linkedin.com/in/adryanev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <Linkedin className="h-3.5 w-3.5" />
              linkedin.com/in/adryanev
            </a>
            <a href="https://github.com/adryanev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <Github className="h-3.5 w-3.5" />
              github.com/adryanev
            </a>
            <a href="https://adryanev.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <Globe className="h-3.5 w-3.5" />
              adryanev.com
            </a>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={generating}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            'bg-accent text-slate-950 hover:bg-accent-hover',
            'disabled:opacity-60',
          )}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {generating ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="mt-12 text-center text-slate-500">
          No resume entries yet.
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {sections.map(({ type, entries }) => {
            const { label, icon: Icon } = typeConfig[type]

            if (type === 'skill') {
              return (
                <section key={type}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-accent" />
                    <h2 className="text-2xl font-bold">{label}</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {entries.map((entry) => (
                      <div key={entry.id}>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{entry.title}</h3>
                        {entry.technology && entry.technology.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {entry.technology.map((tech) => (
                              <span
                                key={tech}
                                className={cn(
                                  'rounded-md px-2.5 py-1 text-xs font-medium',
                                  'bg-slate-100 text-slate-700',
                                  'dark:bg-slate-800 dark:text-slate-300',
                                )}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        ) : entry.description ? (
                          <p className="mt-1 text-sm text-slate-500">{entry.description}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              )
            }

            return (
              <section key={type}>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-accent" />
                  <h2 className="text-2xl font-bold">{label}</h2>
                </div>
                <div className="relative mt-6 ml-3 border-l-2 border-slate-200 pl-8 dark:border-slate-800">
                  {entries.map((entry, i) => (
                    <div
                      key={entry.id}
                      className={cn('relative', i < entries.length - 1 && 'pb-8')}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full border-2 border-accent bg-white dark:bg-slate-950" />

                      <h3 className="text-lg font-semibold">{entry.title}</h3>
                      {entry.organization && (
                        <p className="text-sm text-accent">
                          {entry.organizationUrl ? (
                            <a
                              href={entry.organizationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline decoration-accent/30 hover:decoration-accent"
                            >
                              {entry.organization}
                            </a>
                          ) : (
                            entry.organization
                          )}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                        {(entry.startDate || entry.endDate) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateRange(entry.startDate, entry.endDate)}
                          </span>
                        )}
                        {entry.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {entry.location}
                          </span>
                        )}
                      </div>
                      {entry.description && (
                        <DescriptionList text={entry.description} />
                      )}
                      {entry.technology && entry.technology.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {entry.technology.map((tech) => (
                            <span
                              key={tech}
                              className={cn(
                                'rounded-md px-2 py-0.5 text-xs font-medium',
                                'bg-slate-100 text-slate-600',
                                'dark:bg-slate-800 dark:text-slate-400',
                              )}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Splits a description into sentences and renders the first as a summary
 * paragraph and the rest as bullet points for scannability.
 */
function DescriptionList({ text }: { text: string }) {
  const sentences = text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (sentences.length <= 1) {
    return (
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{text}</p>
    )
  }

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-sm italic text-slate-500 dark:text-slate-500">
        {sentences[0]}
      </p>
      <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600 dark:text-slate-400">
        {sentences.slice(1).map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  )
}

function formatDateRange(start: string | null, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  if (start && end) return `${fmt(start)} — ${fmt(end)}`
  if (start) return `${fmt(start)} — Present`
  if (end) return `Until ${fmt(end)}`
  return ''
}
