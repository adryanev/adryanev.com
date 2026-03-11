---
status: complete
priority: p3
issue_id: "015"
tags: [code-review, simplicity, yagni]
dependencies: []
---

# Over-Engineered Terminal Virtual Filesystem

## Problem Statement

The terminal easter egg implements a full virtual filesystem (`FILE_SYSTEM` object + `PATH_MAP` mapping) with `cd`, `ls`, `cat` commands. This is complex for an easter egg and makes the component ~285 lines.

**Why it matters:** Maintenance burden for a non-essential feature. Could be simplified significantly.

## Findings

- **Flagged by:** code-simplicity-reviewer
- **Location:** `src/components/terminal/TerminalOverlay.tsx`

## Proposed Solutions

### Solution A: Simplify to flat command map
- Remove virtual filesystem, use simple command → response map
- Keep `cd` for navigation (the fun part) but remove ls/cat complexity
- **Pros:** Much simpler, easier to maintain
- **Cons:** Less "realistic" terminal feel
- **Effort:** Medium
- **Risk:** Low

### Solution B: Keep as-is
- It's an easter egg — complexity is acceptable
- **Pros:** Fun feature, works correctly
- **Cons:** Maintenance burden
- **Effort:** None
- **Risk:** None

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/components/terminal/TerminalOverlay.tsx`

## Acceptance Criteria

- [ ] Terminal still works as an easter egg
- [ ] Code is simpler and easier to maintain

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Simplicity vs fun tradeoff |

## Resources

- PR #1
