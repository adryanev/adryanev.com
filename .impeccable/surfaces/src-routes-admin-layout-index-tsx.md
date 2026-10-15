---
version: 1
slug: src-routes-admin-layout-index-tsx
primary_target: src/routes/admin/_layout/index.tsx
related_targets:
  - src/server/functions/dashboard.functions.ts
  - src/server/functions/views.functions.ts
---

# Dashboard redesign

Mode: Operate. The owner explicitly wants a full redesign of the dashboard composition, with equal importance for content management and statistics. The existing overview was primarily recolored and retained its old stat-card and quick-action grids.

Preserve the coding-adventure visual system, authentication and native admin workflows. Replace the overview body structure. Metrics must describe article views rather than unique visitors; figures, content and links come from the database. No commercial, audience-growth or system-health claims.

Three visual composition candidates were generated with the built-in image tool, anchored to the existing admin screenshot: Studio overview, Reading pulse, Content ledger. The decision seed is `7b49d8e7`, dealt structures 4, 6, 3. Comps and exact prompts live in `.impeccable/mocks/dashboard-decision/`. The illustrated preview content is not production evidence.

The user approved **1 — Studio overview** on 2026-10-14. Approved comp: `docs/images/dashboard-redesign/approved-studio-overview.png`; its `.png.json` prompt sidecar records explicit approval. The original checkout retains `.impeccable/mocks/dashboard-decision/split.png` and the normalized 1280×900 comparison copy `.impeccable/mocks/comp-1.png` as historical local evidence. Build path is comp.

## Direction contract

THESIS: Content work and article readership carry equal weight in one practical overview.

OWN-WORLD: Retain the coding-adventure palette, Bricolage Grotesque and DM Mono, square controls and ruled paper sheets. Yellow carries primary actions, blue emphasizes recent views and the existing attention color identifies unread messages.

STORY: The owner sees which content to resume and which published articles readers open, then follows real links to continue a draft, create content, read messages or manage a collection.

FIRST VIEWPORT: A concise Dashboard header with New post and New project. Two adjacent columns separated by a fine vertical rule. Left: three ruled collection rows followed by draft continuation and unread-message actions. Right: seven-day and all-time article views, published popular articles and confirmed subscribers. A low-height Resume, Categories and Webhooks row closes the sheet.

FORM: The user approved candidate 1, Studio overview, from the established candidates Studio overview, Reading pulse and Content ledger. Decision seed `7b49d8e7`; dealt structures 4, 6, 3. This records the existing choice, not a new direction decision.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

INTERACTION: Every inventory row, draft, message summary and article is a real link to its task. Show the latest draft title and open that draft directly. When empty, explain how the region fills and preserve its next action. Retain full article titles, keyboard focus and readable dark mode. On narrow screens, stack content before readership.

TRANSLATION: The comp's illustrative counts and its mistaken popular-draft example are not product truth. Use database values and published-only article links. Views are article-view counts, not unique visitors. Preserve the pinned Bricolage Grotesque even though automated font ranking suggested an unrelated serif. The generated image's faint light variation is incidental, not a request for texture or gradients. All dashboard regions are semantic HTML and CSS; no raster plates are required.

IMPLEMENTED: `DashboardOverview.tsx` and `dashboard.css` express the approved two-column overview with existing admin tokens and pinned Bricolage typography. At 1050px and below, content stacks before readership. Authenticated loaders provide real counts, the latest non-deleted draft's direct edit link, published-only popular articles and separate confirmed/pending subscription counts. The recent view total includes seven UTC buckets, today minus six through today; views are article opens, not unique visitors. Empty regions preserve their next action, and the route announces its loading state. All regions use HTML/CSS and Lucide icons; the approved raster remains a design reference.

VERIFICATION: Retained evidence records 12 passing tests and passing typecheck before the final CSS-only CTA adjustment, task-link checks, the UTC boundary check, pending state and mobile navigation/focus/overflow checks. The final Node 22.23.1 production build passed with exit 0. Compiled-runtime desktop, 1440px, mobile, dark and empty captures have no recorded overflow; the 800px header DOM check passed. Committed captures are in `docs/images/dashboard-redesign/`; all seven documentation PNGs have embedded provenance. `detector.json` retains 21 advisory font-size findings, which are not added to the global system.

REVIEW STATUS: The independent verdict is `ship` for SCORED FIXES ONLY. Contract, persistence and CTA findings are resolved, with no visible regression in recaptured normal, dark or empty views. The hero gate closed with `gate.ok=true`, score `0.864`, without force. The separate responsive gate remains open and failed: uniform downscaling and padding misalign the fixed rail and fluid content in the 1440px comparison, a calibration limitation acknowledged by the reviewer. The entire automated phase workflow is not claimed passed. See `docs/dashboard-redesign-verification.md`. PR #17 is draft with CI ongoing at `2582a5f`. The VPS is off and this work is not deployed. `DESIGN.md` and `.impeccable/design.json` are preserved.
