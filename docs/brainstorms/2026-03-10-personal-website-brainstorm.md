# Brainstorm: Personal Website — adryanev.com

**Date:** 2026-03-10
**Status:** Final

---

## What We're Building

A full-stack personal website for Adryan Eka Vandra (adryanev.com) built with **TanStack Start** that serves as a unified platform combining four equally-weighted sections:

1. **Resume** — Interactive career timeline + downloadable PDF
2. **Portfolio** — Project case studies organized by category (College, Freelance, Work, Apple Developer Academy, Lexicon)
3. **Blog** — Technical articles managed via built-in admin panel
4. **Active SaaS Showcase** — Directory of SaaS products built/maintained with status indicators

### Target Audience
- Potential employers and clients
- Fellow developers and tech community
- Anyone interested in Adryan's work and writing

---

## Why This Approach

**Architecture: Monolithic Full-Stack TanStack Start App**

Single codebase with all sections as routes. TanStack Start handles SSR for SEO, PostgreSQL stores all content, and Tailwind CSS v4 for styling. A built-in admin panel provides content management.

**Rationale:**
- Single deployment on Dokploy — app + PostgreSQL
- Shared design system, layouts, and components
- All content in PostgreSQL = single source of truth, easy backup
- Built-in admin panel means no external CMS dependency
- TanStack Start's file-based routing + SSR handles both public and admin routes

---

## Key Decisions

### Design & UX
- **Visual style:** Developer-themed — dark mode primary, terminal/code aesthetics, monospace fonts, subtle tech references
- **Theme:** System preference auto-detect with manual toggle (dark default)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion — page transitions, scroll reveals, creative hero sections, parallax effects
- **Terminal easter egg:** Full navigation CLI — visitors can `cd /blog`, `ls projects`, `cat about.md` to explore the entire site via terminal commands
- **Command palette:** Cmd+K (⌘K) — full site search across blog posts and projects + quick navigation to any route (like Vercel/Linear style)
- **Portfolio design reference:** Figma template (fileKey: Hj1Gep23GQsDxGjmMHlo1G) — preserve the project detail structure (metadata sidebar + screenshot gallery + footer) but reinterpret in dark developer aesthetic

### Content & Data
- **Database:** PostgreSQL for ALL content (blog posts, portfolio projects, SaaS listings, contact submissions, resume data)
- **ORM:** Drizzle ORM — lightweight, SQL-like API, strong TypeScript inference
- **Blog content:** Stored as markdown in PostgreSQL, rendered server-side (SSR) for SEO
- **Image storage:** S3-compatible object storage (MinIO self-hosted on Dokploy, or Cloudflare R2) for portfolio screenshots and blog images
- **Portfolio:** Organized by category:
  - College (5 projects)
  - Freelance (5+ projects)
  - TopApp.id
  - Work (3 projects)
  - Apple Developer Academy (7 projects)
  - Lexicon (2 projects)
- **Resume:** Interactive timeline as primary view + auto-generated PDF from resume data (React-PDF or similar)
- **SaaS Showcase:** Cards with status badges (active/beta/retired), descriptions, tech stack, links

### Admin Panel
- **Route:** `/admin/*` (protected routes)
- **Auth:** Simple email + password, cookie-based sessions (single admin user)
- **Features:**
  - Blog post editor (markdown editor with preview)
  - Portfolio project CRUD (metadata + image upload)
  - SaaS listing management
  - Resume/timeline entry management
  - Contact form submissions viewer

### Portfolio Detail Page Structure (from Figma)
Each project page includes:
- Project name (large heading)
- Year accomplished
- Role
- Workplace
- Technology used
- Publication/GitHub links (with icons)
- Project description
- Screenshot gallery (grid layout)
- Consistent footer (name, position, contact info, social links)
- Page/project count indicator

### Infrastructure & Deployment
- **Deployment:** Self-hosted on VPS via Dokploy
- **Runtime:** Node.js with TanStack Start SSR
- **Database:** PostgreSQL (on Dokploy)
- **Object storage:** S3-compatible (MinIO on Dokploy or Cloudflare R2)
- **Analytics:** Umami (self-hosted on same VPS)
- **OG Images:** Dynamic generation with Satori + Sharp
- **RSS:** Auto-generated Atom/RSS feed for blog

---

## Site Structure (Routes)

```
Public Routes:
/                              → Home (hero + section previews)
/about                         → About Me
/resume                        → Interactive timeline + PDF download
/portfolio                     → Portfolio categories overview
/portfolio/[category]          → Category listing (College, Freelance, etc.)
/portfolio/[category]/[slug]   → Project detail page
/blog                          → Blog listing
/blog/[slug]                   → Blog post
/saas                          → Active SaaS showcase
/contact                       → Contact form
/rss.xml                       → RSS feed

Admin Routes (protected):
/admin                         → Dashboard
/admin/posts                   → Blog post management
/admin/posts/new               → New blog post
/admin/posts/[id]/edit         → Edit blog post
/admin/portfolio               → Portfolio management
/admin/portfolio/new           → New project
/admin/portfolio/[id]/edit     → Edit project
/admin/saas                    → SaaS listing management
/admin/resume                  → Resume/timeline management
/admin/contacts                → Contact submissions
/admin/login                   → Login page
```

---

## Tech Stack Summary

| Layer         | Choice                              |
|--------------|--------------------------------------|
| Framework    | TanStack Start                       |
| Language     | TypeScript                           |
| Styling      | Tailwind CSS v4                      |
| Database     | PostgreSQL                           |
| ORM          | Drizzle                             |
| Image Storage| S3-compatible (MinIO or R2)         |
| Animations   | Framer Motion                        |
| OG Images    | Satori + Sharp                       |
| Theme        | System-aware dark/light toggle       |
| Auth         | Session-based (email + password)     |
| Deployment   | Dokploy (self-hosted VPS)            |
| Analytics    | Umami (self-hosted)                  |
| SEO          | Dynamic OG images, meta tags, RSS    |

---

## Out of Scope (for v1)

- Multi-user authentication / user accounts
- External CMS integration
- i18n / multi-language
- Comments system on blog posts
- Full-text search engine (Cmd+K will use simple DB queries initially)
- Email notifications for contact form (DB storage only for v1)
