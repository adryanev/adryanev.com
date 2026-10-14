import { Link } from '@tanstack/react-router'
import { Github, Linkedin, Mail } from 'lucide-react'
import { useRef } from 'react'
import { useEntrance } from '@/components/motion/Reveal'

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/adryanev', icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/adryanev', icon: Linkedin },
  { label: 'Email', href: 'mailto:me@adryanev.com', icon: Mail },
]

export function Footer() {
  const ref = useRef<HTMLDivElement>(null)
  useEntrance(ref, { direction: 'none' })
  return (
    <footer className="site-footer">
      <div ref={ref} className="site-footer__inner">
        <div>
          <strong>Adryan Eka Vandra</strong>
          <span>Software Engineer · Jakarta · {new Date().getFullYear()}</span>
        </div>

        <nav aria-label="Footer navigation">
          <Link to="/portfolio">Work</Link>
          <Link to="/blog" search={{ page: undefined, tag: undefined }}>
            Writing
          </Link>
          <Link to="/resume">Resume</Link>
          <Link to="/contact">Contact</Link>
          {socialLinks.slice(0, 2).map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ))}
        </nav>
        <div className="site-tools" aria-label="Website tools">
          <button onClick={() => window.dispatchEvent(new Event('site:search'))}>Search <span aria-hidden="true">⌘K</span></button>
          <button onClick={() => window.dispatchEvent(new Event('site:terminal'))}>Open terminal</button>
        </div>
      </div>
    </footer>
  )
}
