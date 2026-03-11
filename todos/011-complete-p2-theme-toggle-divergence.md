---
status: complete
priority: p2
issue_id: "011"
tags: [code-review, architecture, consistency]
dependencies: []
---

# Theme Toggle Logic Diverges Between CommandPalette and ThemeToggle

## Problem Statement

The CommandPalette and ThemeToggle components have different theme-switching logic. One removes the localStorage key to reset to system theme, while the other stores `'system'` explicitly. This inconsistency can cause confusing behavior when users switch themes via different UI paths.

**Why it matters:** Users may experience inconsistent theme behavior depending on whether they use Cmd+K or the toggle button.

## Findings

- **Flagged by:** pattern-recognition-specialist, kieran-typescript-reviewer
- **Locations:**
  - `src/components/command-palette/CommandPalette.tsx` — removes localStorage key
  - `src/components/layout/ThemeToggle.tsx` — stores `'system'` value

## Proposed Solutions

### Solution A: Unify into shared theme utility (Recommended)
- Create `src/lib/theme.ts` with `setTheme(mode: 'light' | 'dark' | 'system')` function
- Both components call the same function
- **Pros:** Single source of truth, consistent behavior
- **Cons:** Minor refactor
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/components/command-palette/CommandPalette.tsx`, `src/components/layout/ThemeToggle.tsx`

## Acceptance Criteria

- [ ] Both components use the same theme-switching logic
- [ ] Theme state is consistent regardless of which UI is used

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | UI consistency issue |

## Resources

- PR #1
