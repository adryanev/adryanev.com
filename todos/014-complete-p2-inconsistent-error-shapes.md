---
status: complete
priority: p2
issue_id: "014"
tags: [code-review, architecture, consistency]
dependencies: []
---

# Inconsistent Error Return Shapes Across Server Functions

## Problem Statement

Server functions use different error return patterns — some throw errors, some return `{ error: string }`, some return `null`. This inconsistency makes error handling unpredictable on the client side.

**Why it matters:** Inconsistent error shapes lead to bugs when client code expects one format but gets another.

## Findings

- **Flagged by:** pattern-recognition-specialist
- **Patterns observed:**
  - `throw new Error(...)` — some functions
  - `return { error: "..." }` — some functions
  - `return null` — some functions
  - No error handling (let it crash) — some functions

## Proposed Solutions

### Solution A: Standardize on thrown errors (Recommended)
- Use consistent `throw new Error()` or custom error classes
- TanStack Start handles these via error boundaries
- **Pros:** Consistent, framework-aligned
- **Cons:** Need to update all server functions
- **Effort:** Medium
- **Risk:** Low

### Solution B: Result type pattern
- Return `{ success: true, data } | { success: false, error }` consistently
- **Pros:** Explicit, type-safe
- **Cons:** More boilerplate
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** All `src/server/functions/*.functions.ts`

## Acceptance Criteria

- [ ] All server functions use the same error return pattern
- [ ] Client-side error handling is consistent

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Pattern inconsistency across functions |

## Resources

- PR #1
