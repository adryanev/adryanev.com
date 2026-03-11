---
status: complete
priority: p2
issue_id: "006"
tags: [code-review, security, input-validation]
dependencies: []
---

# ILIKE Search Does Not Escape Pattern Characters

## Problem Statement

The search functions in `search.functions.ts` use `ILIKE` with user input interpolated directly into the pattern (`%${query}%`). Characters like `%` and `_` are ILIKE wildcards and are not escaped, allowing users to craft malicious search patterns.

**Why it matters:** Users can match unintended content (e.g., `%` matches everything). While not a SQL injection (parameterized queries protect against that), it's an input validation gap.

## Findings

- **Flagged by:** security-sentinel (HIGH), kieran-typescript-reviewer (HIGH)
- **Location:** `src/server/functions/search.functions.ts`
- **Evidence:** Pattern `%${query}%` passed directly to `ilike()` without escaping `%` and `_` in the user's query string.

## Proposed Solutions

### Solution A: Escape ILIKE special characters (Recommended)
- Create utility function: `escapeLike(str) => str.replace(/[%_\\]/g, '\\$&')`
- Apply before constructing ILIKE pattern
- **Pros:** Simple, correct
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/server/functions/search.functions.ts`
- **Components:** Command palette search

## Acceptance Criteria

- [ ] `%` and `_` in search input are escaped before ILIKE query
- [ ] Search still works normally for regular text queries

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Common ILIKE oversight |

## Resources

- PR #1
