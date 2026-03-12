import { Github, Linkedin, Mail } from 'lucide-react'

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/adryanev', icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/adryanev', icon: Linkedin },
  { label: 'Email', href: 'mailto:me@adryanev.com', icon: Mail },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-text-primary bg-bg-secondary relative overflow-hidden">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-12 md:flex-row md:py-16">
        <div className="text-center md:text-left z-10">
          <p className="font-serif text-3xl font-bold italic text-text-primary">
            Adryan Eka Vandra
          </p>
          <p className="mt-2 font-mono text-xs text-text-secondary tracking-wider">
            Software Engineer · {new Date().getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-4 z-10">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-12 w-12 items-center justify-center bg-bg-primary brutal-border text-text-primary transition-colors hover:bg-accent hover:text-accent-fg hover:border-text-primary"
              aria-label={label}
              title={label}
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
            </a>
          ))}
        </div>
        <div className="text-center sm:text-right z-10">
          <p className="font-mono text-xs text-text-secondary tracking-wider">
            &copy; {new Date().getFullYear()} All rights reserved
          </p>
          <p className="mt-1 hidden font-mono text-xs text-text-secondary tracking-wider sm:block pointer-coarse:hidden">
            Press{' '}
            <kbd className="rounded bg-bg-primary px-1.5 py-0.5 border border-border text-text-primary">Ctrl+`</kbd>{' '}
            for terminal
          </p>
        </div>
      </div>
    </footer>
  )
}
