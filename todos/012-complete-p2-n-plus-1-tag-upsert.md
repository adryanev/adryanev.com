---
status: complete
priority: p2
issue_id: "012"
tags: [code-review, performance, database]
dependencies: []
---

# N+1 Query Pattern in Tag Upsert

## Problem Statement

Tag upsert operations process tags one-by-one in a loop, executing individual INSERT/SELECT queries per tag. With many tags, this causes N+1 query patterns.

**Why it matters:** Scales poorly — a post with 10 tags causes 10+ queries instead of 1-2 batch operations.

## Findings

- **Flagged by:** performance-oracle (CRITICAL)
- **Location:** Tag handling in post server functions

## Proposed Solutions

### Solution A: Batch upsert with single query (Recommended)
- Use Drizzle's `onConflictDoNothing()` with batch insert
- Fetch all matching tags in a single `WHERE name IN (...)` query
- **Pros:** O(1) queries regardless of tag count
- **Cons:** Slightly more complex query
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/server/functions/posts.functions.ts`

## Acceptance Criteria

- [ ] Tag upsert uses batch operations (max 2-3 queries total)
- [ ] Existing tag functionality preserved

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Classic N+1 in tag processing |

## Resources

- PR #1
