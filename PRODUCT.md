# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary visitors are hiring managers and potential clients who need to judge Adryan Eka Vandra's engineering work. Their main task is to inspect relevant projects, understand how Adryan works, and make contact.

Developers and professional peers are a secondary audience for technical articles, project details, and product updates.

## Product purpose

The site presents Adryan's software engineering work, experience, writing, and active products in one place. It should help a visitor move from a first impression to concrete evidence, then to contact.

Success means that a qualified visitor can find relevant work, understand Adryan's role and technical judgment, and choose to start a conversation.

## Positioning

The site combines project case studies, technical writing, an interactive resume, and active product work. Visitors can inspect the work instead of relying on a short biography or a list of technologies.

## Operating context

Most visitors arrive through a shared link, a job application, a professional profile, or search. They may scan the home page first, then open a project, the resume, an article, or the contact page.

The public site includes keyboard navigation, site search through the command palette, theme controls, and an optional terminal interface. The admin area manages the portfolio, blog, products, resume, images, and other site content.

## Capabilities and constraints

- Preserve the portfolio, project case studies, blog, resume, products, about, contact, search, theme support, and admin content workflows.
- Preserve server-rendered routes, PostgreSQL-backed content, S3-compatible image storage, and the current TanStack Start application structure.
- Preserve the downloadable resume and the current content relationships.
- Rework the terminal and command palette as parts of the coding-adventure experience without making either one the only navigation method.
- Keep the site usable when 3D assets load slowly or cannot render.

## Brand commitments

The product name is `adryanev.com`, and the person represented is Adryan Eka Vandra, Software Engineer.

The replacement visual identity uses a coding-adventure theme with authored 3D design. The theme should demonstrate engineering work rather than turn the portfolio into a game that visitors must learn before they can use it.

## Evidence on hand

- Portfolio and project content comes from the database and renders through `src/routes/portfolio/`.
- Technical articles render through `src/routes/blog/`.
- Resume content and PDF generation live in `src/routes/resume.tsx` and `src/components/resume/ResumePDF.tsx`. The Resume worktable reads the same experience records through `src/components/resume/ResumeWorktable.tsx`; the full timeline and PDF remain available.
- Product content renders through `src/routes/saas.tsx`.
- The current terminal interface lives in `src/components/terminal/TerminalOverlay.tsx`.
- The command palette, contact form, theme controls, and admin workflows already exist in the application.

The site has no approved testimonials, client logos, performance benchmarks, or commercial claims. Future design work must not invent them.

## Product principles

- Put proof of work before self-description.
- Make the visitor's next action obvious.
- Use the adventure theme to reveal content, not hide it.
- Keep core navigation and content available without 3D effects.
- Preserve factual content and working admin workflows during the redesign.

## Accessibility and inclusion

Preserve keyboard access, visible focus, reduced-motion behavior, semantic page structure, and readable fallbacks for visual and 3D content.
