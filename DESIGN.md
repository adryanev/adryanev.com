---
name: adryanev.com
description: A software engineering portfolio with an interactive 3D workstation
colors:
  ink: '#142027'
  paper: '#fff8e7'
  ground: '#f8e9bd'
  red: '#cf3924'
  yellow: '#f6ce4a'
  blue: '#8fd9e3'
  secondary-text: '#445057'
typography:
  display:
    fontFamily: 'Bricolage Grotesque, system-ui, sans-serif'
    fontSize: 'clamp(3.6rem, 8vw, 6rem)'
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: '-0.04em'
  body:
    fontFamily: 'Bricolage Grotesque, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: 'DM Mono, ui-monospace, monospace'
    fontSize: '0.7rem'
    fontWeight: 500
    letterSpacing: '0.04em'
rounded:
  control: '0'
  speech-bubble: '46px'
spacing:
  compact: '8px'
  control: '12px'
  section: 'clamp(72px, 10vw, 144px)'
components:
  button-primary:
    backgroundColor: '{colors.yellow}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '0 20px'
    height: '52px'
  paper-panel:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
---

# Design system: adryanev.com

## Overview

The approved visual world is a clear-line coding adventure. The homepage's Blender workstation is the interactive landmark: the laptop opens work, the notebook opens writing, and the rocket opens contact. These destinations remain ordinary links below the model. The Resume page extends this world with a Blender worktable whose pull-out tray shows factual role records inside the scene. The rest of the site uses the same ink, paper, flat color, and confident borders to keep reading and navigation direct.

This is a portfolio for evaluating actual work. Copy names roles, projects, decisions, and ways to contact Adryan; it does not ask visitors to play a character or learn a game.

## Colors

Ink carries text and outlines; paper and warm ground hold content. Yellow marks primary actions and work, blue marks writing and supporting layers, and red marks contact or a focused accent. Dark mode maps the same roles to the darker values in `src/app.css` while retaining legible foregrounds.

## Typography

Bricolage Grotesque carries headlines and body copy. DM Mono is reserved for short metadata, dates, code, and technical labels. Page titles are sentence case, heavy, and capped at 6rem. Long form reading stays near 72 characters per line.

## Layout

Public pages use a centered container up to 80rem with side padding that grows from 18px to 62px. A broad chapter header introduces each major route. Work uses linked directory rows, writing uses a two-column index that becomes one column on narrow screens, and case studies and articles prioritize a readable main column. At 820px and below, headers and major grids stack; at 560px controls and work rows get larger touch-friendly layouts.

## Elevation & Depth

Borders and offset color blocks make panels read like separated sheets. The homepage workstation and Resume worktable supply spatial depth where the scene helps visitors inspect content. On public content, shadows are used on major panels and hover states, not every text element.

## Shapes

Navigation, cards, controls, and content panels are square-cornered with dark outlines. The homepage speech bubble is the single large rounded exception. Icons use the same Lucide stroke vocabulary throughout.

## Components

The split masthead is persistent across public routes. Chapter headers use yellow, blue, red, or paper according to destination, with title and concise context. Primary actions are yellow with ink outlines; secondary actions use blue or paper. Work rows and article cards respond with a short lift and directional arrow movement. Forms use labeled rectangular fields, visible focus, and inline errors. The search palette and optional terminal borrow the paper, ink, and color-block treatment.

The Blender scenes load when visible and have static rendered fallbacks. Their animation pauses offscreen and follows reduced-motion preferences. On Resume, the worktable's pull-out tray displays the selected role's organization, dates, title, and work excerpt. Labeled role buttons provide keyboard access to the same selection. The full timeline follows the worktable, and the PDF control remains in the page header. Other motion is brief, provides feedback, and never hides content before JavaScript loads.

## Do's and Don'ts

- Do lead with work evidence, clear paths, and factual copy.
- Do keep navigation, content, and contact usable without WebGL.
- Do preserve keyboard access, visible focus, and reduced-motion behavior.
- Don't invent project claims, performance numbers, testimonials, or client endorsements.
- Don't spread the homepage's 3D runtime to reading pages without a content purpose.
