---
title: "feat: Build adryanev.com personal website"
type: feat
status: completed
date: 2026-03-10
origin: docs/brainstorms/2026-03-10-personal-website-brainstorm.md
---

# feat: Build adryanev.com Personal Website

## Overview

Build a full-stack personal website for Adryan Eka Vandra using TanStack Start, featuring four equally-weighted sections (Resume, Portfolio, Blog, SaaS Showcase), a built-in admin panel, and developer-themed interactive features (terminal CLI, Cmd+K palette). All content is stored in PostgreSQL, images in S3-compatible storage, deployed on Dokploy.

See brainstorm: `docs/brainstorms/2026-03-10-personal-website-brainstorm.md` for key decisions and rationale.

## Problem Statement

Adryan needs a unified personal platform that:
- Showcases portfolio projects organized by career phase (College, Freelance, Work, ADA, Lexicon)
- Publishes technical blog posts with full SEO
- Displays an interactive resume with downloadable PDF
- Highlights active SaaS products
- Is self-managed via a built-in admin panel (no external CMS)
- Reflects a developer identity through design and interactive features

## Proposed Solution

A monolithic TanStack Start application with SSR, PostgreSQL for all content, Drizzle ORM, Tailwind CSS v4 dark-first theming, Framer Motion animations, and a built-in admin panel with session-based auth.

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────┐
│                    Dokploy VPS                   │
│                                                  │
│  ┌──────────────┐  ┌──────────┐  ┌───────────┐ │
│  │ TanStack     │  │PostgreSQL│  │  MinIO/R2  │ │
│  │ Start App    │──│          │  │  (S3)      │ │
│  │ (Node.js SSR)│  │          │  │            │ │
│  └──────────────┘  └──────────┘  └───────────┘ │
│                                                  │
│  ┌──────────────┐                               │
│  │ Umami        │                               │
│  │ (Analytics)  │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

### Project Structure

Following conventions from sibling project `markdown-to-gdoc`:

```
adryanev.com/
├── src/
│   ├── client.tsx                  # StartClient hydration entry
│   ├── server.tsx                  # Server entry with security headers
│   ├── router.tsx                  # Router creation + type registration
│   ├── routeTree.gen.ts            # Auto-generated route tree
│   ├── app.css                     # Tailwind v4 entry + theme tokens
│   ├── routes/
│   │   ├── __root.tsx              # Root layout (nav, footer, theme, Cmd+K)
│   │   ├── index.tsx               # Home page
│   │   ├── about.tsx               # About page
│   │   ├── resume.tsx              # Resume timeline
│   │   ├── contact.tsx             # Contact form
│   │   ├── saas.tsx                # SaaS showcase
│   │   ├── blog/
│   │   │   ├── index.tsx           # Blog listing
│   │   │   └── $slug.tsx           # Blog post
│   │   ├── portfolio/
│   │   │   ├── index.tsx           # Categories overview
│   │   │   ├── $category.tsx       # Category layout
│   │   │   └── $category/
│   │   │       └── $slug.tsx       # Project detail
│   │   ├── admin/
│   │   │   ├── _layout.tsx         # Auth-guarded layout (beforeLoad check)
│   │   │   ├── index.tsx           # Dashboard
│   │   │   ├── login.tsx           # Login page (outside _layout)
│   │   │   ├── posts/
│   │   │   │   ├── index.tsx       # Post list
│   │   │   │   ├── new.tsx         # New post
│   │   │   │   └── $id.edit.tsx    # Edit post
│   │   │   ├── portfolio/
│   │   │   │   ├── index.tsx       # Project list
│   │   │   │   ├── new.tsx         # New project
│   │   │   │   ├── $id.edit.tsx    # Edit project
│   │   │   │   └── categories.tsx  # Category management
│   │   │   ├── saas/
│   │   │   │   ├── index.tsx       # SaaS list
│   │   │   │   ├── new.tsx         # New listing
│   │   │   │   └── $id.edit.tsx    # Edit listing
│   │   │   ├── resume.tsx          # Resume entry management
│   │   │   └── contacts.tsx        # Contact submissions
│   │   └── api/
│   │       ├── og[.]png.ts         # Dynamic OG image generation
│   │       ├── feed[.]xml.ts       # RSS feed
│   │       ├── resume[.]pdf.ts     # PDF generation
│   │       ├── sitemap[.]xml.ts    # Sitemap
│   │       ├── robots[.]txt.ts     # Robots.txt
│   │       ├── upload.ts           # S3 presigned URL generation
│   │       └── search.ts           # Cmd+K search endpoint
│   ├── components/
│   │   ├── ui/                     # Design system primitives (shadcn pattern)
│   │   ├── layout/                 # Header, Footer, Navigation, MobileNav
│   │   ├── blog/                   # PostCard, PostContent, TagList
│   │   ├── portfolio/              # ProjectCard, ProjectDetail, CategoryCard
│   │   ├── resume/                 # Timeline, TimelineEntry
│   │   ├── saas/                   # SaasCard, StatusBadge
│   │   ├── admin/                  # MarkdownEditor, ImageUploader, DataTable
│   │   ├── terminal/               # TerminalOverlay, CommandLine
│   │   ├── command-palette/        # CommandPalette (cmdk wrapper)
│   │   └── theme/                  # ThemeToggle, ThemeProvider
│   ├── db/
│   │   ├── index.ts                # Drizzle client
│   │   ├── schema.ts               # All table definitions (re-export barrel)
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── sessions.ts
│   │   │   ├── posts.ts
│   │   │   ├── tags.ts
│   │   │   ├── portfolio.ts
│   │   │   ├── resume.ts
│   │   │   ├── saas.ts
│   │   │   ├── contacts.ts
│   │   │   └── settings.ts
│   │   └── seed.ts                 # Seed script (admin user + initial categories)
│   ├── lib/
│   │   ├── utils.ts                # cn() utility
│   │   ├── storage.ts              # S3 client + presigned URL helpers
│   │   ├── og.ts                   # Satori OG image generator
│   │   ├── pdf.tsx                 # React-PDF resume template
│   │   ├── markdown.ts             # Markdown rendering (server-side)
│   │   └── feed.ts                 # RSS feed generator
│   ├── server/
│   │   ├── middleware/
│   │   │   └── auth.ts             # Auth middleware (createMiddleware)
│   │   └── functions/
│   │       ├── auth.functions.ts   # Login, logout, getCurrentUser
│   │       ├── posts.functions.ts  # Blog CRUD
│   │       ├── portfolio.functions.ts
│   │       ├── saas.functions.ts
│   │       ├── resume.functions.ts
│   │       ├── contacts.functions.ts
│   │       └── search.functions.ts # Cmd+K search
│   └── hooks/
│       ├── use-theme.ts            # Theme toggle hook
│       └── use-terminal.ts         # Terminal state hook
├── drizzle/                        # Migration files (generated)
├── public/
│   └── fonts/                      # Self-hosted fonts for OG generation
├── drizzle.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

### Database Schema

```mermaid
erDiagram
    users {
        int id PK "identity"
        text email UK "not null"
        text password_hash "not null"
        timestamp created_at "default now()"
    }
    sessions {
        text id PK "uuid"
        int user_id FK "-> users.id"
        timestamp expires_at "not null"
        timestamp created_at "default now()"
    }
    posts {
        int id PK "identity"
        text title "not null"
        text slug UK "not null"
        text content "not null, markdown"
        text excerpt
        text cover_image "S3 URL"
        content_status status "default draft"
        timestamp published_at
        timestamp deleted_at "null, soft delete"
        timestamp created_at "default now()"
        timestamp updated_at "default now()"
    }
    tags {
        int id PK "identity"
        text name UK "not null"
        text slug UK "not null"
    }
    posts_to_tags {
        int post_id FK PK "-> posts.id cascade"
        int tag_id FK PK "-> tags.id cascade"
    }
    portfolio_categories {
        int id PK "identity"
        text name "not null"
        text slug UK "not null"
        text description
        int sort_order "default 0"
    }
    portfolio_projects {
        int id PK "identity"
        int category_id FK "-> portfolio_categories.id"
        text title "not null"
        text slug UK "not null"
        text description "not null, markdown"
        int year "not null"
        text role "not null"
        text workplace "not null"
        text_arr technology "not null"
        text github_url
        text external_url
        content_status status "default draft"
        int sort_order "default 0"
        timestamp deleted_at "null, soft delete"
        timestamp created_at "default now()"
        timestamp updated_at "default now()"
    }
    project_images {
        int id PK "identity"
        int project_id FK "-> portfolio_projects.id cascade"
        text url "not null, S3 URL"
        text alt
        int sort_order "default 0"
    }
    resume_entries {
        int id PK "identity"
        resume_type type "experience/education/certification/skill"
        text title "not null"
        text organization
        text location
        text description
        date start_date
        date end_date "null for current"
        int sort_order "default 0"
        timestamp created_at "default now()"
        timestamp updated_at "default now()"
    }
    saas_listings {
        int id PK "identity"
        text name "not null"
        text slug UK "not null"
        text description "not null"
        text url
        text github_url
        text logo_url "S3 URL"
        text_arr technology "not null"
        saas_status status "active/beta/retired"
        int sort_order "default 0"
        timestamp deleted_at "null, soft delete"
        timestamp created_at "default now()"
        timestamp updated_at "default now()"
    }
    contacts {
        int id PK "identity"
        text name "not null"
        text email "not null"
        text subject
        text message "not null"
        boolean is_read "default false"
        timestamp created_at "default now()"
    }
    site_settings {
        text key PK
        text value "not null"
        timestamp updated_at "default now()"
    }

    users ||--o{ sessions : "has"
    posts ||--o{ posts_to_tags : "has"
    tags ||--o{ posts_to_tags : "has"
    portfolio_categories ||--o{ portfolio_projects : "contains"
    portfolio_projects ||--o{ project_images : "has"
```

### Enums

```typescript
// src/db/schema/enums.ts
export const contentStatusEnum = pgEnum('content_status', ['draft', 'published'])  // shared by posts + portfolio
export const resumeTypeEnum = pgEnum('resume_type', ['experience', 'education', 'certification', 'skill'])
export const saasStatusEnum = pgEnum('saas_status', ['active', 'beta', 'retired'])
```

### Implementation Phases

#### Phase 1: Project Foundation

**Goal:** Scaffolded TanStack Start app with database, theming, and core layout.

**Tasks:**

- [x] Initialize project with pnpm: `pnpm create @tanstack my-app` or manual setup
- [x] Configure `vite.config.ts` with `tanstackStart()`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths`
- [x] Configure `tsconfig.json`: ES2022, strict, bundler resolution, `@/*` path alias
- [x] Set up Tailwind CSS v4 entry (`src/app.css`):
  - `@import 'tailwindcss'`
  - `@custom-variant dark (&:where(.dark, .dark *))`
  - `@theme` block with dark-first design tokens (developer-themed colors, monospace fonts)
- [x] Install and configure Drizzle ORM + `pg` driver
- [x] Define complete database schema (all tables from ERD above)
- [x] Create `drizzle.config.ts` with PostgreSQL credentials
- [x] Run `drizzle-kit generate` + `drizzle-kit migrate` for initial migration
- [x] Create seed script (`src/db/seed.ts`):
  - Admin user (email from env, password hashed with argon2id)
  - Initial portfolio categories (College, Freelance, TopApp.id, Work, Apple Developer Academy, Lexicon)
  - Site settings (name, email, GitHub URL, LinkedIn URL, etc.)
- [x] Build root layout (`__root.tsx`):
  - HTML document structure with SSR-safe `<head>` meta tags
  - Inline FOUC-prevention script in `<head>` (reads `localStorage.theme` before paint)
  - Navigation header (responsive: desktop nav + mobile hamburger)
  - Footer with contact info / social links (from `site_settings` DB table)
  - Theme toggle component (Light / Dark / System — three-state)
- [x] Set up `cn()` utility with `clsx` + `tailwind-merge`
- [x] Install `lucide-react` for icons
- [x] Create `.env.example` with all required env vars
- [x] Create `.gitignore`
- [x] Initialize git repo + first commit

**Key files:**
- `vite.config.ts`, `tsconfig.json`, `package.json`
- `src/app.css`, `src/client.tsx`, `src/server.tsx`, `src/router.tsx`
- `src/routes/__root.tsx`
- `src/db/index.ts`, `src/db/schema/*.ts`, `src/db/seed.ts`
- `drizzle.config.ts`
- `src/lib/utils.ts`
- `src/components/theme/ThemeToggle.tsx`
- `src/components/layout/Header.tsx`, `Footer.tsx`, `MobileNav.tsx`

**Success criteria:**
- App boots with `pnpm dev`, renders root layout with nav + footer
- Dark/light/system theme toggle works without FOUC
- Database migrations run, seed creates admin user + categories
- Tailwind v4 dark mode utilities (`dark:bg-*`) function correctly

---

#### Phase 2: Auth + Admin Shell

**Goal:** Working admin authentication with protected routes and admin layout.

**Tasks:**

- [x] Implement auth server functions (`src/server/functions/auth.functions.ts`):
  - `login`: validate email + password (argon2id verify), create session row, set HTTP-only cookie
  - `logout`: delete session row, clear cookie
  - `getCurrentUser`: read session cookie, look up session in DB, return user or null
- [x] Cookie configuration: `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'`, `maxAge: 7 days`, `path: '/'`
- [x] Implement sliding session renewal: extend `expires_at` on each authenticated request
- [x] Create auth middleware (`src/server/middleware/auth.ts`):
  - Uses `beforeLoad` in `_layout.tsx` to call `getCurrentUser`
  - Passes user to route context on success
  - Throws `redirect({ to: '/admin/login' })` on failure
- [x] Build admin login page (`src/routes/admin/login.tsx` — **must be outside `_layout.tsx` auth guard**; place at `admin.login.tsx` or use a pathless layout so login is not protected):
  - Email + password form
  - Rate limiting: 5 attempts per 15 minutes per IP (server-side check)
  - Error display for invalid credentials
  - Redirect to `/admin` on success (or to `?redirect=` param)
- [x] Build admin layout route (`src/routes/admin/_layout.tsx`):
  - `beforeLoad` calls `getCurrentUser()` server function
  - Redirects to `/admin/login` if no session
  - Admin sidebar navigation (Posts, Portfolio, SaaS, Resume, Contacts)
  - Logout button
- [x] Build admin dashboard (`src/routes/admin/_layout/index.tsx`):
  - Summary cards: total posts, total projects, unread contacts, draft count
  - Quick links to each admin section

**Key files:**
- `src/server/functions/auth.functions.ts`
- `src/server/middleware/auth.ts`
- `src/routes/admin/login.tsx`
- `src/routes/admin/_layout.tsx`
- `src/routes/admin/index.tsx`

**Security measures:**
- Password hashing: argon2id (via `@node-rs/argon2` or `argon2` package)
- CSRF: TanStack Start server functions use POST for mutations (inherent CSRF mitigation via `sameSite: 'lax'` cookies)
- Brute force: IP-based rate limiting on login endpoint
- Session: DB-backed with sliding expiration, 7-day max

**Success criteria:**
- Admin can log in with seeded credentials
- Session persists across page reloads (cookie-based)
- Unauthenticated access to `/admin/*` redirects to login
- Logout destroys session

---

#### Phase 3: Content Management (Admin)

**Goal:** Full CRUD for all content types in the admin panel.

**Tasks:**

##### Blog Post Management
- [x] Post list page (`/admin/posts`): DataTable with title, status, date, actions (edit, delete)
- [x] New post page (`/admin/posts/new`):
  - Title field (auto-generates slug, slug is editable)
  - Markdown editor with live preview (side-by-side layout)
  - Tag selector (create-on-type, multi-select)
  - Cover image upload (S3 presigned URL)
  - Excerpt field (optional, auto-generated from first 160 chars of content if blank)
  - Status toggle: Draft / Published
  - Published date picker (defaults to now when status changes to Published)
  - Auto-save to localStorage every 30 seconds (visual indicator)
- [x] Edit post page (`/admin/posts/$id.edit`): same form, pre-populated
- [x] Delete: soft-delete with confirmation dialog (sets `deleted_at`, excluded from queries)
- [x] Server functions: `createPost`, `updatePost`, `deletePost`, `getPosts`, `getPostById`
- [x] Slug uniqueness validation (server-side check before save)
- [x] Markdown sanitization: use `rehype-sanitize` in rendering pipeline

##### S3 Image Upload System
- [x] Create S3 client (`src/lib/storage.ts`) using AWS SDK v3:
  - `forcePathStyle: true` for S3-compatible providers
  - Presigned URL generation (PUT, 5-minute expiry)
  - File type allowlist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Max file size: 10MB (validated server-side before generating URL)
- [x] Upload API route (`src/routes/api/upload.ts`):
  - Protected by auth middleware
  - Accepts: filename, contentType
  - Returns: presigned URL, final S3 key
- [x] Reusable `ImageUploader` component:
  - Drag-and-drop + file picker
  - Client-side file type/size validation
  - Direct upload to S3 via presigned URL
  - Progress indicator
  - Returns S3 URL on completion

##### Portfolio Management
- [x] Category management page (`/admin/portfolio/categories.tsx`):
  - List categories with sort order
  - Add/edit/delete categories (inline or modal)
- [x] Project list page (`/admin/portfolio`): DataTable grouped by category
- [x] New project page (`/admin/portfolio/new`):
  - Title, slug (auto-generated), category (dropdown), year, role, workplace
  - Technology tags (multi-input, free-text)
  - Description (markdown editor, simpler than blog — no live preview needed)
  - GitHub URL, external URL
  - Screenshot gallery: multi-image upload with drag-to-reorder, alt text per image
  - Status: Draft / Published
  - Sort order within category
- [x] Edit project page (`/admin/portfolio/$id.edit`)
- [x] Server functions: `createProject`, `updateProject`, `deleteProject`, project image CRUD

##### SaaS Listing Management
- [x] SaaS list page (`/admin/saas`): DataTable with name, status badge, actions
- [x] New listing page (`/admin/saas/new`):
  - Name, slug, description, URL, GitHub URL
  - Logo upload (S3)
  - Technology tags
  - Status: Active / Beta / Retired
  - Sort order
- [x] Edit listing page (`/admin/saas/$id.edit`)
- [x] Server functions: `createSaasListing`, `updateSaasListing`, `deleteSaasListing`

##### Resume Management
- [x] Resume entries page (`/admin/resume`):
  - Grouped by type (Experience, Education, Certification, Skill)
  - Add/edit/delete entries (modal or inline)
  - Fields: type, title, organization, location, description, start_date, end_date (null = current), sort_order
  - Drag-to-reorder within each type group
- [x] Server functions: `createResumeEntry`, `updateResumeEntry`, `deleteResumeEntry`, `reorderEntries`

##### Contact Submissions
- [x] Contacts page (`/admin/contacts`):
  - List with name, email, subject, date, read/unread status
  - Click to view full message (expandable row or side panel)
  - Mark as read/unread
  - Delete with confirmation
  - Unread count badge in admin sidebar
- [x] Server functions: `getContacts`, `markContactRead`, `deleteContact`

**Key files:**
- `src/server/functions/posts.functions.ts`
- `src/server/functions/portfolio.functions.ts`
- `src/server/functions/saas.functions.ts`
- `src/server/functions/resume.functions.ts`
- `src/server/functions/contacts.functions.ts`
- `src/routes/api/upload.ts`
- `src/lib/storage.ts`
- `src/components/admin/MarkdownEditor.tsx`
- `src/components/admin/ImageUploader.tsx`
- `src/components/admin/DataTable.tsx`

**Success criteria:**
- Admin can create, edit, and delete blog posts (with draft/published workflow)
- Images upload directly to S3 via presigned URLs
- Portfolio projects can be created with multiple screenshots
- All content types have full CRUD
- Auto-save prevents data loss in blog editor

---

#### Phase 4: Public Pages

**Goal:** All visitor-facing pages with SSR and proper SEO.

**Tasks:**

##### Home Page (`/`)
- [x] Hero section: animated developer-themed intro with name, title, and brief tagline
- [x] Section previews: latest blog posts, featured projects, active SaaS, resume highlights
- [x] CTA links to each section

##### About Page (`/about`)
- [x] Bio content (from `site_settings` or hardcoded initially)
- [x] Skills/technologies overview
- [x] Social links

##### Blog Pages
- [x] Blog listing (`/blog`):
  - Page-based pagination (12 posts per page, `?page=N`)
  - Post cards: title, excerpt, date, tags, cover image
  - Tag filter (optional query param: `?tag=typescript`)
  - Only `status = 'published'` posts shown
- [x] Blog post (`/blog/$slug`):
  - SSR-rendered markdown content using `unified` + `remark-gfm` + `rehype-sanitize` + `rehype-shiki` (Shiki for syntax highlighting)
  - Post metadata: title, date, tags, reading time estimate
  - Cover image
  - Previous/next post navigation
  - Dynamic `<head>` meta tags: title, description, canonical URL, OG image URL

##### Portfolio Pages
- [x] Categories overview (`/portfolio`):
  - Grid of category cards with name, description, project count
  - Category slugs: `college`, `freelance`, `topapp-id`, `work`, `apple-developer-academy`, `lexicon`
- [x] Category listing (`/portfolio/$category`):
  - All published projects in the category, ordered by `sort_order`
  - Project cards with title, year, role, technology tags, thumbnail
- [x] Project detail (`/portfolio/$category/$slug`):
  - **Following Figma template structure:**
  - Left sidebar: project name (h1), year, role, workplace, technology tags, GitHub/external links (with icons)
  - Right area: project description + screenshot gallery (grid layout)
  - Footer: consistent site footer
  - Dynamic meta tags + OG image
  - 404 if project doesn't exist or isn't published

##### Resume Page (`/resume`)
- [x] Interactive timeline: vertical timeline with entries grouped by type
- [x] Experience entries: expandable cards with company, title, dates, description
- [x] Education entries: similar layout
- [x] Skills section: grouped tags
- [ ] "Download PDF" button: links to `/api/resume.pdf`
- [ ] PDF generation route (`/api/resume.pdf`):
  - Uses `@react-pdf/renderer` with `renderToStream`
  - Reads resume data from DB
  - Returns PDF with `Content-Disposition: inline`
  - Cache with `Cache-Control: public, max-age=3600` (1 hour)

##### SaaS Showcase (`/saas`)
- [x] Card grid: active first, then beta, then retired (within each group: by sort_order)
- [x] Each card: name, description, tech tags, status badge (color-coded), links
- [x] Retired listings shown with reduced opacity
- [x] Empty state if no listings

##### Contact Page (`/contact`)
- [x] Form fields: name (required), email (required, validated), subject (optional), message (required, 10-5000 chars)
- [x] Spam protection:
  - Honeypot field (hidden CSS field, reject if filled)
  - Rate limiting: 3 submissions per IP per hour (server-side)
- [x] Client-side validation with error messages
- [x] Server-side validation (Zod schema via `drizzle-zod` or manual)
- [x] Success state: inline confirmation message
- [x] Error state: user-friendly error with retry option

##### SEO Infrastructure
- [x] Dynamic `<head>` meta tags per route (title, description, canonical, OG)
- [ ] OG image generation (`/api/og.png?title=...&type=...`):
  - Satori + Sharp pipeline
  - Dark gradient background with site typography
  - Title + section label
  - Cached with `Cache-Control: public, max-age=86400, s-maxage=604800`
  - Font loaded from `public/fonts/`
- [x] RSS feed (`/api/feed.xml`):
  - Uses `feed` npm package
  - RSS 2.0 format with full post content
  - Cached for 1 hour
  - `<link rel="alternate" type="application/rss+xml">` in root layout
- [x] Sitemap (`/api/sitemap.xml`):
  - Auto-generated from all published pages, posts, and projects
  - Cached for 1 hour
- [x] Robots.txt (`/api/robots.txt`):
  - Disallow `/admin/*`
  - Sitemap reference
- [x] Custom 404 page: developer-themed "page not found" with navigation links
- [ ] JSON-LD structured data: `Person` (home/about), `Article` (blog posts), `SoftwareApplication` (SaaS)

**Key files:**
- `src/routes/index.tsx`, `about.tsx`, `resume.tsx`, `contact.tsx`, `saas.tsx`
- `src/routes/blog/index.tsx`, `blog/$slug.tsx`
- `src/routes/portfolio/index.tsx`, `portfolio/$category.tsx`, `portfolio/$category/$slug.tsx`
- `src/routes/api/og[.]png.ts`, `feed[.]xml.ts`, `resume[.]pdf.ts`, `sitemap[.]xml.ts`, `robots[.]txt.ts`
- `src/lib/og.ts`, `src/lib/feed.ts`, `src/lib/pdf.tsx`, `src/lib/markdown.ts`
- `src/components/blog/*`, `portfolio/*`, `resume/*`, `saas/*`

**Success criteria:**
- All public pages render with SSR (view source shows full HTML)
- Blog posts render markdown with syntax highlighting
- Portfolio detail page matches Figma structure (reinterpreted in dark theme)
- PDF downloads with current resume data
- OG images generate correctly for all page types
- RSS feed validates with feed validators
- 404 page displays for invalid routes/slugs
- Contact form submits with spam protection

---

#### Phase 5: Interactive Features

**Goal:** Developer-themed interactions that differentiate the site.

**Tasks:**

##### Framer Motion Animations
- [x] Install `motion` (rebranded Framer Motion)
- [ ] Configure `LazyMotion` with `domAnimation` features (reduce bundle ~15kb)
- [ ] Configure `MotionConfig reducedMotion="user"` for accessibility
- [ ] Page transitions:
  - `AnimatePresence mode="wait"` wrapping route outlet
  - Fade + slide transitions between pages
  - Unique `key` per route
- [ ] Scroll-triggered animations:
  - `whileInView` with `viewport={{ once: true, margin: '-100px' }}` for section reveals
  - Staggered entrance for card grids
- [ ] Hero section: creative animated intro (typing effect, code-themed visuals)
- [ ] Timeline entries: scroll-triggered reveal with stagger
- [ ] Parallax effects on hero/section backgrounds using `useScroll` + `useTransform`
- [ ] SSR safety: use `initial={false}` where needed to prevent hydration flash

##### Cmd+K Command Palette
- [x] Install `cmdk`
- [x] Build `CommandPalette` component wrapping `Command.Dialog`:
  - Keyboard shortcut: `Cmd+K` (desktop) / search icon button (mobile)
  - Groups: Navigation, Blog Posts, Projects, Theme
  - Navigation items: all public routes with icons
  - Blog posts: search titles via server function (debounced, `ILIKE` query)
  - Projects: search titles via server function
  - Theme toggle items: Light, Dark, System
  - `keywords` prop for alias-based filtering
- [x] Style with Tailwind using `[cmdk-*]` data attribute selectors
- [ ] Animate `--cmdk-list-height` for smooth height transitions
- [x] Mount in root layout (available on all pages)
- [x] Search endpoint (`/api/search`): queries posts + projects by title `ILIKE '%query%'`

##### Terminal CLI Easter Egg
> **Scope warning:** This is the highest-risk feature for scope creep. Start with core commands (`help`, `ls`, `cd`, `cat`, `clear`, `pwd`, `whoami`). Add tab completion and `history` only if time permits.

- [x] Build `TerminalOverlay` component:
  - Toggle: keyboard shortcut (`` Ctrl+` ``) + hint in footer ("Press Ctrl+` for terminal")
  - Overlay: semi-transparent backdrop with terminal window (monospace font, green-on-black aesthetic)
  - State persisted in `sessionStorage` (current directory, command history)
- [x] Command parser supporting:
  - `help` — list available commands
  - `whoami` — display name, role, and bio
  - `ls` — list items in current "directory" (maps to site sections)
  - `cd <path>` — change directory (navigates browser to corresponding route)
  - `cat <file>` — display content (e.g., `cat about.md` shows about text)
  - `open <url>` — open external link (GitHub, LinkedIn)
  - `clear` — clear terminal output
  - `pwd` — show current path
  - `history` — show command history
  - Arrow keys for command history navigation
  - Tab completion for commands and paths
- [x] Virtual file system mapping site structure:
  ```
  /
  ├── about.md
  ├── resume/
  ├── blog/
  │   ├── post-1.md
  │   └── post-2.md
  ├── portfolio/
  │   ├── college/
  │   ├── freelance/
  │   └── ...
  ├── saas/
  └── contact.md
  ```
- [x] Hide on mobile (touch devices) — show only on desktop
- [x] Accessible: terminal is decorative, not the primary navigation

**Key files:**
- `src/components/command-palette/CommandPalette.tsx`
- `src/components/terminal/TerminalOverlay.tsx`, `CommandParser.ts`, `FileSystem.ts`
- `src/routes/api/search.ts`
- `src/server/functions/search.functions.ts`

**Success criteria:**
- Page transitions animate smoothly without layout shift
- Cmd+K opens, searches posts/projects, navigates correctly
- Terminal opens with `Ctrl+``, commands work, `cd` navigates the browser
- All animations respect `prefers-reduced-motion`
- Terminal hidden on mobile, Cmd+K accessible via search icon on mobile

---

#### Phase 6: Infrastructure & Deployment

**Goal:** Production-ready deployment with monitoring.

**Tasks:**

- [x] Create `Dockerfile` (multi-stage build):
  - Stage 1: Install dependencies with pnpm
  - Stage 2: Build app (`vite build`)
  - Stage 3: Production image (node:22-alpine, non-root user)
  - Include `drizzle/` migrations folder
  - Run migrations on startup
- [x] Create `docker-compose.yml`:
  - App service (TanStack Start)
  - PostgreSQL service (with volume for persistence)
  - MinIO service (optional, for local S3 development)
- [x] Create `docker-compose.prod.yml` (Dokploy-compatible):
  - App service with production env vars
  - PostgreSQL with backup volume
  - Health check: `GET /api/health` endpoint
- [ ] Configure S3 bucket public read policy (images must be publicly accessible for portfolio/blog/OG images; set bucket policy or use CDN proxy)
- [x] Add health check endpoint (`/api/health`): returns 200 + DB connection status
- [ ] Configure Umami analytics:
  - Add Umami script tag in root layout
  - Track custom events: theme toggle, Cmd+K usage, terminal usage, PDF download, contact form submit
- [x] Security headers in `src/server.tsx`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` (strict, allow self + S3 bucket + Umami)
  - `Strict-Transport-Security` (production only)
- [x] Performance optimization:
  - Lazy load below-fold images with `loading="lazy"`
  - Responsive images with `srcset` for portfolio screenshots
  - Code-split admin routes (not loaded for visitors)
  - Static asset caching headers
- [x] Create `CLAUDE.md` with project conventions:
  - Package manager: pnpm
  - Code style: no semicolons, single quotes, ESM
  - Path alias: `@/*` → `./src/*`
  - Component pattern: shadcn/ui style with `cn()` utility
  - Server code in `.functions.ts` and `.server.ts` files
  - Drizzle schema in `src/db/schema/`
  - Test files co-located: `*.test.ts`
- [x] Create `.env.example` documenting all required environment variables

**Key files:**
- `Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`
- `src/routes/api/health.ts`
- `CLAUDE.md`
- `.env.example`

**Success criteria:**
- `docker compose up` starts app + PostgreSQL + MinIO locally
- Migrations run on startup
- Health check returns 200
- Umami tracks page views and custom events
- Lighthouse score: 90+ on Performance, Accessibility, SEO, Best Practices
- Admin routes are code-split (not in visitor bundle)

---

## System-Wide Impact

### Interaction Graph

1. **Visitor page request** → TanStack Start SSR → route loader (server function) → Drizzle query → PostgreSQL → render HTML → send response
2. **Admin creates post** → login check (middleware) → validate input (Zod) → generate slug → check uniqueness → Drizzle insert → invalidate cache
3. **Admin uploads image** → auth middleware → generate presigned URL → client uploads to S3 → client sends S3 key back → store URL in DB
4. **OG image request** → parse query params → Satori JSX → SVG → Sharp PNG → response with Cache-Control
5. **Contact form submit** → honeypot check → rate limit check → validate input → Drizzle insert → success response

### Error & Failure Propagation

| Error | Where Handled | User Sees |
|-------|--------------|-----------|
| DB connection failure | Server function try/catch | 500 page with "temporarily unavailable" |
| S3 unreachable | Upload function | Toast: "Upload failed, please retry" |
| Invalid slug (404) | Route loader `notFound()` | Custom 404 page |
| Session expired | Auth middleware | Redirect to `/admin/login` |
| Validation failure | Zod validator | Inline form error messages |
| OG generation failure | API route catch | Fallback to static default OG image |
| PDF generation failure | API route catch | Error message with retry link |

### State Lifecycle Risks

- **Blog editor auto-save**: localStorage auto-save runs every 30 seconds. If server save fails, localStorage retains the draft. On next edit page load, check localStorage for newer content and offer to restore.
- **Image upload + project save**: Images upload to S3 first, then URLs are saved to DB. If DB save fails after upload, orphaned images remain in S3. Mitigation: S3 lifecycle rule to delete objects older than 24 hours without DB references (can implement as a cron job later).
- **Session deletion on logout**: Session row is deleted from DB and cookie is cleared. If cookie clear fails, the stale cookie will fail authentication on next request (graceful degradation to login redirect).

## Acceptance Criteria

### Functional Requirements

- [ ] Visitor can browse all four sections (Resume, Portfolio, Blog, SaaS) with SSR
- [ ] Portfolio detail pages follow Figma template structure (metadata sidebar + screenshot gallery)
- [ ] Blog posts render markdown with syntax highlighting
- [ ] Resume page displays interactive timeline and downloads auto-generated PDF
- [ ] Contact form submits with validation and spam protection (honeypot + rate limit)
- [ ] Admin can log in, create/edit/delete all content types
- [ ] Blog posts support draft/published workflow
- [ ] Images upload to S3 via presigned URLs
- [ ] Cmd+K palette searches blog posts and projects, navigates to any route
- [ ] Terminal CLI responds to `cd`, `ls`, `cat`, `help`, `whoami`, `clear`, `pwd`
- [ ] Dark/light/system theme toggle persists across sessions without FOUC
- [ ] RSS feed validates and includes all published blog posts
- [ ] OG images generate dynamically for all public pages
- [ ] Sitemap includes all published content
- [ ] Site deploys on Dokploy via Docker

### Non-Functional Requirements

- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 90+ (WCAG 2.1 AA target)
- [ ] Lighthouse SEO: 95+
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Admin routes are code-split from visitor bundle
- [ ] SSR renders complete HTML (no client-only content for SEO-critical pages)
- [ ] Terminal hidden on mobile, Cmd+K accessible via search icon on mobile

### Quality Gates

- [ ] All server functions have input validation (Zod)
- [ ] Auth-protected routes redirect correctly when unauthenticated
- [ ] SQL injection prevented by Drizzle's parameterized queries
- [ ] XSS prevented by `rehype-sanitize` in markdown rendering
- [ ] No secrets in client bundle (verified by inspecting build output)

## Dependencies & Prerequisites

| Dependency | Version | Purpose |
|-----------|---------|---------|
| `@tanstack/react-start` | ^1.154+ | Full-stack framework |
| `@tanstack/react-router` | ^1.x | Type-safe routing |
| `react` / `react-dom` | ^19 | UI library |
| `drizzle-orm` | ^0.45+ | Database ORM |
| `drizzle-kit` | ^0.31+ | Migration tooling |
| `pg` | ^8 | PostgreSQL driver |
| `tailwindcss` | ^4.2+ | Styling |
| `motion` | ^12+ | Animations (Framer Motion) |
| `cmdk` | ^1+ | Command palette |
| `satori` | latest | OG image SVG generation |
| `sharp` | latest | Image processing (OG PNG) |
| `@react-pdf/renderer` | latest | Resume PDF generation |
| `@aws-sdk/client-s3` | ^3 | S3 image uploads |
| `@aws-sdk/s3-request-presigner` | ^3 | Presigned URLs |
| `feed` | latest | RSS feed generation |
| `unified` / `remark-gfm` / `rehype-sanitize` / `rehype-shiki` | latest | Markdown rendering |
| `argon2` | latest | Password hashing |
| `zod` | latest | Input validation |
| `clsx` / `tailwind-merge` | latest | className utility |
| `lucide-react` | latest | Icons |

**Infrastructure:**
- VPS with Dokploy
- PostgreSQL 16+
- S3-compatible storage (MinIO or Cloudflare R2)
- Umami instance (self-hosted)

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| TanStack Start breaking changes | Medium | High | Pin version, follow changelog |
| S3 provider downtime | Low | Medium | Serve cached/fallback images |
| OG image generation perf | Medium | Low | Aggressive Cache-Control headers |
| Blog editor data loss | Medium | High | localStorage auto-save + visual indicator |
| Contact form spam | High | Medium | Honeypot + IP rate limiting |
| Session hijacking | Low | High | HTTP-only, secure, sameSite cookies |

## Out of Scope (v1)

Per brainstorm decision:
- Multi-user auth / user accounts
- External CMS integration
- i18n / multi-language
- Blog comments system
- Full-text search engine (Cmd+K uses simple DB queries)
- Email notifications for contact form
- Blog post scheduling
- Revision history for content

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-10-personal-website-brainstorm.md](docs/brainstorms/2026-03-10-personal-website-brainstorm.md)
  - Key decisions carried forward: monolithic TanStack Start architecture, PostgreSQL for all content, Drizzle ORM, developer-themed dark UI, Cmd+K + terminal CLI, Figma portfolio structure

### External References

- [TanStack Start Documentation](https://tanstack.com/start/latest/docs/framework/react/overview)
- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Start Middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/sql-schema-declaration)
- [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Motion for React Documentation](https://motion.dev/docs/react)
- [cmdk GitHub](https://github.com/pacocoursey/cmdk)
- [Satori OG Image Generation](https://github.com/vercel/satori)
- [React-PDF Node API](https://react-pdf.org/node)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)

### Internal References

- Sibling project conventions: `/Users/adryanev/Code/personal/markdown-to-gdoc` (pnpm, TanStack Start structure, Tailwind v4 patterns, `cn()` utility, `lucide-react` icons)
- Figma portfolio template: `fileKey: Hj1Gep23GQsDxGjmMHlo1G`
