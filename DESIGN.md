---
name: "adryanev.com"
description: "A coding-adventure portfolio and content studio built from paper, ink, and authored 3D"
colors:
  brand-ink: "#142027"
  brand-paper: "#fff8e7"
  brand-ground: "#f8e9bd"
  brand-yellow: "#f6ce4a"
  brand-blue: "#8fd9e3"
  brand-red: "#cf3924"
  foreground-muted: "#445057"
  color-link: "#9c2b1c"
  color-outline: "rgb(20 32 39 / 22%)"
  color-success: "#276239"
  color-success-surface: "#e0eddf"
  color-warning: "#795515"
  color-warning-surface: "#f8e9bd"
  color-danger: "#9c2b1c"
  color-danger-surface: "#f9e3da"
  color-info: "#245560"
  color-info-surface: "#e2f2f2"
  brand-ink-dark: "#0b1214"
  brand-paper-dark: "#edf1dc"
  brand-yellow-dark: "#c8e64a"
  brand-blue-dark: "#56c8c9"
  brand-red-dark: "#ff6840"
  surface-canvas-dark: "#111a1b"
  surface-paper-dark: "#1b2828"
  foreground-dark: "#edf1dc"
  foreground-muted-dark: "#b7c6bd"
  color-link-dark: "#ff9b7c"
  color-outline-dark: "rgb(237 241 220 / 22%)"
  color-success-dark: "#a2d6ad"
  color-success-surface-dark: "#203a2b"
  color-warning-dark: "#e5cc81"
  color-warning-surface-dark: "#3a3321"
  color-danger-dark: "#ff9b7c"
  color-danger-surface-dark: "#402a26"
  color-info-dark: "#a0dce2"
  color-info-surface-dark: "#203b3e"
  accent-fg-dark: "#141718"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(3.6rem, 8vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, -apple-system, sans-serif"
    fontSize: "2rem"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Bricolage Grotesque, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Bricolage Grotesque, system-ui, -apple-system, sans-serif"
    fontSize: ".875rem"
    fontWeight: 600
  metadata:
    fontFamily: "DM Mono, ui-monospace, monospace"
    fontSize: ".75rem"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  control: "0"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.brand-yellow}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
  button-secondary:
    backgroundColor: "{colors.brand-paper}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
  button-accent:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
  button-inverse:
    backgroundColor: "{colors.brand-ink}"
    textColor: "{colors.brand-ground}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
  button-danger:
    backgroundColor: "{colors.color-danger-surface}"
    textColor: "{colors.color-danger}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
  button-plain: {}
  button-primary-public:
    backgroundColor: "{colors.brand-yellow}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
    height: "48px"
  button-primary-admin:
    backgroundColor: "{colors.brand-yellow}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
    height: "44px"
  paper-panel:
    backgroundColor: "{colors.brand-paper}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "24px"
  text-field:
    backgroundColor: "{colors.brand-ground}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  badge:
    backgroundColor: "{colors.brand-paper}"
    textColor: "{colors.foreground-muted}"
    padding: "4px 8px"
    typography: "{typography.metadata}"
  public-navigation:
    backgroundColor: "{colors.brand-ink}"
    textColor: "{colors.brand-paper}"
    height: "66px"
    padding: "0 10px"
  chapter-header:
    backgroundColor: "{colors.brand-yellow}"
    textColor: "{colors.brand-ink}"
    padding: "clamp(28px, 5vw, 60px)"
---

# Design system: adryanev.com

## Overview

**Creative North Star: "Clear-line coding adventure"**

The site uses ink outlines, warm paper, yellow and blue sheets, and Bricolage Grotesque type. Authored Blender scenes give the homepage workstation and Resume worktable a spatial role. Ordinary links, readable content, and keyboard controls remain available alongside them.

The content studio uses the same materials at a denser scale. Shared controls change height, border weight, and field background by context. Public chapter layouts and 3D controls keep their own composition while consuming the canonical tokens.

The implementation source of truth is `src/design-system/tokens.css` and `src/design-system/components.css`. `src/app.css` imports them and bridges Tailwind and legacy aliases. This record describes the implementation; it does not certify completed browser or production validation.

**Key Characteristics:**

- Paper and ink in light and dark themes
- Bricolage Grotesque with DM Mono metadata
- Shared controls with public and admin density
- Authored 3D with readable fallbacks

## Colors

### Primary

Action yellow marks primary controls and work-related sheets. Ink supplies the foreground on yellow and blue. The foreground and surface roles supply readable page text and backgrounds.

### Secondary

Writing blue marks supporting actions and writing or product chapter sheets. Contact red identifies the contact chapter and selected accents. Destructive controls use the separate danger pair.

### Neutral

Paper holds content; warm ground separates it from the page. Muted foreground supports descriptions and labels. The outline token is a translucent divider, while control outlines use stronger foreground roles.

Success, warning, danger, and info each have foreground and background tokens. The sidecar color ramps are synthesized preview strips, not additional CSS tokens. Dark theme values appear under the corresponding `-dark` keys above; the actual CSS overrides the same variable names under `.dark`. Brand paper and semantic paper diverge in dark mode. Use `--surface-paper` for a panel and `--brand-paper` for the printed material role.

**The role color rule.** Use semantic foreground, surface, and feedback tokens for shared controls. Brand ink on a colored sheet is a different role from readable text on a dark page.

## Typography

Bricolage Grotesque carries display, headings, labels, and body copy. DM Mono carries short metadata and code. Public chapter titles use the display role. Shared page headings use weight 750 and the heading rhythm, with a context-dependent size. Admin headings use the headline size; shared public page headings use the display size. The badge uses the metadata role.

The available size tokens run through micro, xs, sm, base, lg, xl, 2xl, 3xl, 4xl, title, 5xl, and 6xl. They live in the canonical token file. Reading measure is 72ch. Existing small public captions are route-specific and do not define a new shared label style.

## Layout

The public masthead and page system retain a centered width up to 80rem. Chapter introductions, open project rows, writing grids, article reading columns, and the Studio overview retain their own layouts. The shared system standardizes controls and records without replacing those compositions.

Spacing follows the four-pixel scale in the frontmatter. Public chapter headers stack at 820px and use compact title sizing at 560px. Shared table guidance appears below 768px. Tables preserve a minimum width of 580px inside a focusable horizontal scroll region so columns remain readable.

Admin contexts use 44px default controls, hairline borders, and paper fields. Public contexts use 48px default controls, stronger borders, and ground-colored fields. Admin login uses 48px controls. Explicit small, large, feature, and icon sizes use 40px, 48px, 56px, and 44px respectively. These are minimum heights, so multiline content can grow.

## Elevation & Depth

Printed public sheets use hard offset colored shadows. The chapter shadow offsets by 12px on each axis; the compact sheet treatment offsets by 8px and 9px. Work rows and authored public interactions retain their existing short feedback motion. The Blender scenes provide spatial depth where it helps inspect content.

**The printed depth rule.** Keep hard offset color shadows on the established public sheets. Shared forms and studio panels use borders without adding a shadow.

Shared color and border transitions take 160ms. The existing settle motion takes 260ms with the settle easing. Shared control transitions turn off under reduced motion. Motion values and shadows are recorded in the sidecar.

## Shapes

Shared controls and panels have square corners. Shared borders use one or two pixels by context. Public printed chapter sheets retain their established five-pixel outline, becoming four pixels on phones. The homepage speech bubble remains an authored rounded exception. Lucide supplies the interface icon vocabulary.

## Components

### Shared API

Import from `@/components/ui`. The protected `/admin/design-system` catalog previews public and studio density, theme colors, control states, local validation, tables, and page states. Catalog examples do not save content.

**The context rule.** Use the shared component API for repeated controls. Keep route composition and authored 3D behavior in their domain components.

### Buttons

`Button` supports `primary`, `secondary`, `accent`, `inverse`, `danger`, `ghost`, and `plain`. Primary is yellow; secondary is paper; accent is blue; inverse swaps the semantic foreground and canvas. Danger uses its semantic pair. Ghost has a transparent background and border. Plain preserves domain styling while sharing blocked and pending behavior.

Use `size="sm" | "md" | "lg" | "feature" | "icon"`. The default `md` inherits context density. Non-plain controls use square borders, centered content, and the frontmatter padding. Hover uses blue with ink text; danger hover uses danger with paper text. Visible keyboard focus uses a three-pixel link-colored outline with a three-pixel offset.

`pending` blocks activation and sets `aria-busy`. `disabled` blocks activation. The default native button type is `button`; set `type="submit"` for form submission. `asChild` requires exactly one immediate element child, such as an anchor or router link. It preserves blocked activation and removal from tab order while disabled. Place adjacent actions beside the wrapper, not inside it.

```tsx
<Button type="submit" pending={saving}>Save changes</Button>
<Button asChild variant="secondary"><Link to="/blog">Read writing</Link></Button>
<Button variant="ghost" size="icon" aria-label="Open search"><Search size={18} /></Button>
```

### Inputs and fields

`Field` supplies a label, optional marker, and either an error or hint description. It creates an ID when `htmlFor` is omitted. A nested `Input`, `Select`, or `Textarea` inherits the ID and description association. When supplying an explicit control ID, give `Field` the matching `htmlFor`.

```tsx
<Field label="Email address" hint="Used to reply to your message." error={error}>
  <Input name="email" type="email" required />
</Field>
```

Error takes precedence over hint and marks the control invalid. Checkbox, radio, and file inputs do not inherit the field ID. Give those controls their own IDs and labels, or wrap a checkbox in its label. `appearance="plain"` allows existing domain styling while retaining the input's semantics. Textareas resize vertically. Native disabled fields use reduced opacity.

### Panels and records

`Panel` provides paper fill, a context border, and shared padding. `asChild` preserves a semantic element such as a form. `PageHeader` aligns a title, description, and actions above a rule. `PageState` and `EmptyState` provide readable loading, failure, and empty content containers; callers supply meaningful headings, roles, and actions.

`Table` preserves semantic table markup. Wrap it in `TableScroll aria-label="..."` for keyboard access and mobile overflow guidance. Supply a caption, column scopes, and text labels for row actions.

### Status and feedback

`Badge` supports neutral, accent, success, warning, danger, and info tones. `Feedback` supports info, success, warning, and danger; danger defaults to an alert and the other tones to status. `FormError` and `FieldError` provide the shared error treatments. Keep the status name or error message visible alongside color.

### Navigation and authored scenes

The public split masthead pairs a yellow identity block with ink navigation. Blue marks hover, focus, and the active route. Mobile navigation retains ordinary links. The studio retains its compact navigation rail and overview layout.

The downloadable resume is a separate print medium. `ResumePDF.tsx` retains fixed point units, Helvetica, and white paper. Website controls and the resume header use the shared system; the PDF renderer does not consume the website CSS.

The workstation, Resume worktable, search palette, terminal, and public chapter compositions retain domain CSS. They consume canonical tokens through the `--adventure-*`, `--bg-*`, and `--text-*` aliases where needed. The scene controls keep their authored sizing through the plain button variant. Static fallbacks, role-selection buttons, the resume timeline, and the PDF route preserve access to content.

## Do's and Don'ts

### Do:

- Do import shared controls from @/components/ui and reuse the canonical CSS tokens.
- Do keep ordinary links, keyboard access, visible focus, and reduced-motion behavior alongside 3D.
- Do give icon controls an accessible name and horizontal table regions a useful label.
- Do preserve factual project and role content.

### Don't:

- Don't restate brand colors, field styling, or control sizes in each route.
- Don't apply shared button dimensions to a domain control that intentionally uses the plain variant.
- Don't use color alone to convey validation or publication state.
- Don't invent testimonials, project results, or client endorsements.
