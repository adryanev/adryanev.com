import { createFileRoute } from '@tanstack/react-router'
import { Github, Linkedin, Mail } from 'lucide-react'
import { Reveal, StaggerChildren, StaggerItem } from '@/components/motion/Reveal'

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'About — Adryan Eka Vandra' },
      {
        name: 'description',
        content:
          'About Adryan Eka Vandra — Software Engineer specializing in web and mobile development.',
      },
    ],
  }),
})

const skills = [
  { category: 'Languages', items: ['TypeScript', 'Dart', 'Go', 'Kotlin', 'Swift', 'Python'] },
  { category: 'Frontend', items: ['React', 'Next.js', 'TanStack', 'Tailwind CSS', 'Flutter'] },
  { category: 'Backend', items: ['Node.js', 'Express', 'Hono', 'PostgreSQL', 'Redis'] },
  { category: 'DevOps', items: ['Docker', 'CI/CD', 'Linux', 'Nginx', 'AWS'] },
  { category: 'Tools', items: ['Git', 'Figma', 'VS Code', 'Neovim'] },
]

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/adryanev', icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/adryanev', icon: Linkedin },
  { label: 'Email', href: 'mailto:me@adryanev.com', icon: Mail },
]

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24">
      {/* Header */}
      <Reveal>
        <div className="mb-16 border-b-4 border-text-primary pb-8">
          <h1 className="font-serif text-6xl font-medium tracking-tight md:text-8xl lg:text-[10rem] uppercase">
            About
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-4 w-4 bg-accent brutal-border" />
            <span className="font-mono text-sm text-text-secondary tracking-wider">
              Adryan Eka Vandra · Software Engineer
            </span>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-16 md:grid-cols-[1fr_2fr] lg:gap-24">
        {/* Left Column - Image/Stats */}
        <div className="space-y-8">
          <Reveal>
            <div className="aspect-[3/4] w-full brutal-border brutal-shadow-lg bg-bg-secondary relative overflow-hidden group flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <span className="font-serif text-[8rem] font-bold italic text-accent leading-none">A</span>
                <p className="font-mono text-sm text-text-secondary tracking-widest uppercase">Adryan Eka Vandra</p>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-bg-primary p-4 brutal-border">
                <p className="font-mono text-xs text-text-primary tracking-wider">
                  Software Engineer · Indonesia
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="brutal-border bg-bg-primary p-6 space-y-4">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-mono text-sm text-text-secondary">Status</span>
                <span className="font-mono text-sm font-bold text-accent">Available</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-mono text-sm text-text-secondary">Location</span>
                <span className="font-mono text-sm text-text-primary">Indonesia</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="font-mono text-sm text-text-secondary">Role</span>
                <span className="font-mono text-sm text-text-primary">Software Engineer</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-12 w-12 items-center justify-center bg-bg-primary brutal-border text-text-primary transition-colors hover:bg-accent hover:text-accent-fg hover:border-text-primary"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right Column - Text content */}
        <div>
          <Reveal>
            <div className="font-serif text-2xl leading-relaxed text-text-primary md:text-4xl">
              <p className="mb-8">
                <span className="text-accent font-bold font-sans">01.</span> I engineer systems that don't just work — they <span className="italic">perform</span> under pressure. With a foundation in robust backend architectures and a keen eye for distinctive frontend experiences, I build software that commands attention.
              </p>
              <p className="mb-8 text-text-secondary">
                <span className="text-accent font-bold font-sans">02.</span> My approach is rooted in the belief that digital products should feel tactile, responsive, and undeniably fast. I reject generic boilerplate in favor of crafted, purpose-built solutions.
              </p>
              <p>
                <span className="text-accent font-bold font-sans">03.</span> Whether it's architecting a high-throughput API or designing an unforgettable user interface, my goal remains the same: to create software that leaves a lasting impact.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-16 pt-16 border-t-2 border-text-primary space-y-8">
              <h2 className="font-serif text-2xl font-bold italic text-text-primary">
                Skills & Tools
              </h2>
              {skills.map((group) => (
                <div key={group.category} className="space-y-4">
                  <h3 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
                    {group.category}
                  </h3>
                  <StaggerChildren className="flex flex-wrap gap-3">
                    {group.items.map((item) => (
                      <StaggerItem key={item}>
                        <span className="bg-bg-secondary px-4 py-2 font-mono text-sm brutal-border transition-colors hover:text-accent hover:border-accent">
                          {item}
                        </span>
                      </StaggerItem>
                    ))}
                  </StaggerChildren>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
