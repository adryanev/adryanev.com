import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { getPublicResume } from '@/server/functions/public.functions'
import { Reveal, StaggerChildren, StaggerItem } from '@/components/motion/Reveal'

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

function ResumePage() {
  const resume = Route.useLoaderData()
  const [generating, setGenerating] = useState(false)

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
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24">
      <Reveal>
        <div className="mb-16 border-b-4 border-text-primary pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-serif text-6xl font-medium tracking-tight md:text-8xl lg:text-[10rem] uppercase">
              CV
            </h1>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-4 w-4 bg-text-primary brutal-border" />
              <span className="font-mono text-sm text-text-secondary tracking-wider">
                Curriculum Vitae · Experience & Education
              </span>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex w-full md:w-auto items-center justify-center gap-2 bg-text-primary text-bg-primary px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest brutal-border transition-colors hover:bg-accent hover:text-accent-fg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {generating ? 'Generating\u2026' : 'Download PDF'}
          </button>
        </div>
      </Reveal>

      <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-8">
          {resume.education.length > 0 && (
            <Reveal>
              <div className="brutal-border bg-bg-secondary p-6">
                <h2 className="font-serif text-xl font-bold italic text-text-primary border-b-2 border-text-primary pb-2 mb-4">
                  Education
                </h2>
                <div className="space-y-6 font-sans">
                  {resume.education.map(edu => (
                    <div key={edu.id}>
                      <p className="font-bold text-text-primary">{edu.title}</p>
                      <p className="text-text-secondary">{edu.organization}</p>
                      <p className="font-mono text-xs text-text-secondary mt-1">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {resume.certification.length > 0 && (
            <Reveal delay={0.1}>
              <div className="brutal-border bg-bg-secondary p-6">
                <h2 className="font-serif text-xl font-bold italic text-text-primary border-b-2 border-text-primary pb-2 mb-4">
                  Certifications
                </h2>
                <div className="space-y-6 font-sans">
                  {resume.certification.map(cert => (
                    <div key={cert.id}>
                      <p className="font-bold text-text-primary">{cert.title}</p>
                      <p className="text-text-secondary">{cert.organization}</p>
                      <p className="font-mono text-xs text-text-secondary mt-1">
                        {formatDateRange(cert.startDate, cert.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {resume.skill.length > 0 && (
            <Reveal delay={0.15}>
              <div className="brutal-border bg-bg-secondary p-6">
                <h2 className="font-serif text-xl font-bold italic text-text-primary border-b-2 border-text-primary pb-2 mb-4">
                  Skills
                </h2>
                <div className="space-y-6 font-sans">
                  {resume.skill.map(skill => (
                    <div key={skill.id}>
                      <p className="font-bold text-text-primary mb-2">{skill.title}</p>
                      {skill.technology && skill.technology.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {skill.technology.map(tech => (
                            <span key={tech} className="bg-bg-primary border border-border px-2 py-1 font-mono text-xs text-text-secondary">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <div className="space-y-12">
          <Reveal>
            <h2 className="font-serif text-3xl font-bold italic text-text-primary border-b-2 border-text-primary pb-4">
              Experience
            </h2>
          </Reveal>

          <StaggerChildren className="space-y-10 relative before:absolute before:top-0 before:bottom-0 before:left-[19px] before:w-[2px] before:bg-border">
            {resume.experience.map((job) => (
              <StaggerItem key={job.id}>
                <div className="relative pl-14 group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg-primary bg-accent group-hover:scale-125 transition-all text-accent-fg absolute left-0 top-0 z-10" />

                  <div className="p-6 brutal-border bg-bg-primary group-hover:brutal-shadow transition-all">
                    <div className="flex flex-col gap-1 mb-4">
                      <span className="font-mono text-xs font-bold text-accent">{formatDateRange(job.startDate, job.endDate)}</span>
                      <h3 className="font-serif text-3xl font-bold text-text-primary italic">{job.title}</h3>
                      <span className="font-mono text-sm text-text-secondary">{job.organization}</span>
                    </div>
                    {job.description && <DescriptionList text={job.description} />}
                    {job.technology && job.technology.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.technology.map(tech => (
                          <span key={tech} className="bg-bg-secondary border border-border px-2 py-1 font-mono text-xs text-text-secondary">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </div>
  )
}

function DescriptionList({ text }: { text: string }) {
  const sentences = text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (sentences.length <= 1) {
    return (
      <p className="mt-2 text-text-secondary font-sans">{text}</p>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      <p className="text-text-primary font-bold font-sans">
        {sentences[0]}
      </p>
      <ul className="list-inside list-disc space-y-1 text-text-secondary font-sans pl-2">
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
