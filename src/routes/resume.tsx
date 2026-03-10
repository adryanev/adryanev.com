import { createFileRoute } from '@tanstack/react-router'
import { Briefcase, GraduationCap, Award, Wrench, MapPin, Calendar } from 'lucide-react'
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

  const sections = [
    { type: 'experience' as const, entries: resume.experience },
    { type: 'education' as const, entries: resume.education },
    { type: 'certification' as const, entries: resume.certification },
    { type: 'skill' as const, entries: resume.skill },
  ].filter((s) => s.entries.length > 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Resume</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        My professional journey.
      </p>

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
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entries.map((entry) => (
                      <span
                        key={entry.id}
                        className={cn(
                          'rounded-md px-3 py-1.5 text-sm font-medium',
                          'bg-slate-100 text-slate-700',
                          'dark:bg-slate-800 dark:text-slate-300',
                        )}
                      >
                        {entry.title}
                      </span>
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
                        <p className="text-sm text-accent">{entry.organization}</p>
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
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {entry.description}
                        </p>
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

function formatDateRange(start: string | null, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  if (start && end) return `${fmt(start)} — ${fmt(end)}`
  if (start) return `${fmt(start)} — Present`
  if (end) return `Until ${fmt(end)}`
  return ''
}
