---
status: complete
priority: p3
issue_id: "016"
tags: [code-review, ssr, bug]
dependencies: []
---

# Hydration Mismatch Risk — Terminal Touch Detection

## Problem Statement

The terminal overlay uses touch detection (`'ontouchstart' in window`) to conditionally render UI. This check only runs client-side, but if the component renders differently based on it, React hydration will mismatch between SSR output and client render.

**Why it matters:** Hydration mismatches cause React warnings and potential UI flicker.

## Findings

- **Flagged by:** kieran-typescript-reviewer
- **Location:** `src/components/terminal/TerminalOverlay.tsx`

## Proposed Solutions

### Solution A: Use useEffect for touch detection (Recommended)
- Default to showing the component during SSR
- Detect touch in `useEffect` and hide if touch device
- **Pros:** No hydration mismatch
- **Cons:** Brief flash on touch devices
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/components/terminal/TerminalOverlay.tsx`

## Acceptance Criteria

- [ ] No React hydration warnings related to terminal component
- [ ] Terminal still hidden on touch devices

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Standard SSR pattern issue |

## Resources

- PR #1
