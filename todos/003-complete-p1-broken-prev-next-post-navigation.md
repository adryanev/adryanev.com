---
status: complete
priority: p1
issue_id: "003"
tags: [code-review, bug, critical]
dependencies: []
---

# Broken Previous/Next Post Navigation

## Problem Statement

`getPublishedPostBySlug` in `public.functions.ts` queries for previous and next posts but does NOT reference the current post's `publishedAt` timestamp. The queries likely return the first/last post globally rather than posts adjacent to the current one in chronological order.

**Why it matters:** The prev/next navigation on blog posts links to wrong posts, confusing users and breaking the reading flow.

## Findings

- **Flagged by:** kieran-typescript-reviewer (CRITICAL), performance-oracle (CRITICAL), code-simplicity-reviewer
- **Location:** `src/server/functions/public.functions.ts` lines 83-100
- **Evidence:** The prev/next queries need `WHERE publishedAt < current.publishedAt` (for prev) and `WHERE publishedAt > current.publishedAt` (for next), ordered appropriately. Current implementation doesn't filter relative to the current post.

## Proposed Solutions

### Solution A: Fix queries with proper WHERE clause (Recommended)
- After fetching the current post, query prev with `WHERE publishedAt < :currentPublishedAt ORDER BY publishedAt DESC LIMIT 1`
- Query next with `WHERE publishedAt > :currentPublishedAt ORDER BY publishedAt ASC LIMIT 1`
- **Pros:** Correct, simple, efficient
- **Cons:** Requires 2 additional queries (or can be combined with subqueries)
- **Effort:** Small
- **Risk:** Low

### Solution B: Single query with window functions
- Use `LAG()` and `LEAD()` SQL window functions
- **Pros:** Single query
- **Cons:** More complex SQL, harder to express in Drizzle ORM
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/server/functions/public.functions.ts`
- **Components:** Blog post detail page (`src/routes/blog/$slug.tsx`)
- **Database changes:** None

## Acceptance Criteria

- [ ] Previous post link points to the chronologically preceding published post
- [ ] Next post link points to the chronologically following published post
- [ ] First post has no previous link, last post has no next link
- [ ] Navigation order matches blog listing order

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Flagged by 3 agents independently |

## Resources

- PR #1
