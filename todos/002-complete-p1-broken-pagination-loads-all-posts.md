---
status: complete
priority: p1
issue_id: "002"
tags: [code-review, performance, critical]
dependencies: []
---

# Broken Pagination — Loads All Posts Into Memory

## Problem Statement

`getPublishedPosts` in `public.functions.ts` fetches ALL published posts from the database, then slices in JavaScript (`allPosts.slice(offset, offset + limit)`). This means every paginated request loads the entire posts table into Node.js memory — O(n) memory and query time regardless of page size.

**Why it matters:** As post count grows, this will cause increasing memory pressure and slow responses. With large datasets, it can cause OOM crashes.

## Findings

- **Flagged by:** performance-oracle (CRITICAL), code-simplicity-reviewer
- **Location:** `src/server/functions/public.functions.ts` lines 44-63
- **Evidence:** The query has no `limit()` or `offset()` clause — it fetches all posts with `orderBy(desc(posts.publishedAt))` then does `allPosts.slice(offset, offset + limit)` in JS.
- **Total count** is derived from `allPosts.length` (the full array), further confirming all rows are loaded.

## Proposed Solutions

### Solution A: SQL-level pagination (Recommended)
- Use Drizzle's `.limit()` and `.offset()` on the query
- Run a separate `COUNT(*)` query for total (or use window function)
- **Pros:** O(1) memory per request, database handles pagination efficiently
- **Cons:** Two queries needed (data + count)
- **Effort:** Small
- **Risk:** Low

### Solution B: Cursor-based pagination
- Use `publishedAt` as cursor instead of offset
- **Pros:** More performant for deep pages, no count needed
- **Cons:** Breaking API change, more complex implementation
- **Effort:** Medium
- **Risk:** Medium

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/server/functions/public.functions.ts`
- **Components:** Blog listing, home page
- **Database changes:** None (but consider adding index on `posts.publishedAt`)

## Acceptance Criteria

- [ ] Blog listing uses SQL LIMIT/OFFSET (not JS slice)
- [ ] Memory usage is constant regardless of total post count
- [ ] Pagination still works correctly (total, pages, current page)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Classic N+all antipattern |

## Resources

- PR #1
- Drizzle ORM limit/offset docs
