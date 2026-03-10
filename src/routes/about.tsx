import { createFileRoute } from '@tanstack/react-router'
import { Github, Linkedin, Mail, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  { label: 'Email', href: 'mailto:hello@adryanev.com', icon: Mail },
]

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">About Me</h1>

      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300">
        <p className="text-lg leading-relaxed">
          I'm <strong>Adryan Eka Vandra</strong>, a Software Engineer based in
          Indonesia. I build web and mobile applications, with a focus on
          clean architecture, developer experience, and shipping products
          that people actually use.
        </p>
        <p className="leading-relaxed">
          My journey spans from college projects to freelance work, through
          Apple Developer Academy and professional roles at various companies.
          Currently, I'm working on SaaS products and exploring the
          intersection of developer tooling and AI.
        </p>
        <p className="leading-relaxed">
          When I'm not coding, I write about software engineering on my blog,
          contribute to open source, and experiment with new technologies.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <MapPin className="h-4 w-4" />
        <span>Indonesia</span>
      </div>

      {/* Skills */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">Skills & Technologies</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-accent">
                {group.category}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className={cn(
                      'rounded-md px-2 py-1 text-sm',
                      'bg-slate-100 text-slate-700',
                      'dark:bg-slate-800 dark:text-slate-300',
                    )}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">Connect</h2>
        <div className="mt-4 flex gap-4">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                'border-slate-200 hover:border-accent hover:text-accent',
                'dark:border-slate-800 dark:hover:border-accent',
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
