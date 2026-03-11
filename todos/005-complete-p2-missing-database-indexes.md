---
status: complete
priority: p2
issue_id: "005"
tags: [code-review, performance, database]
dependencies: []
---

# Missing Database Indexes on Commonly Queried Columns

## Problem Statement

Several columns used in `WHERE` and `ORDER BY` clauses lack database indexes, causing full table scans on queries that should be fast.

**Why it matters:** Without indexes, query performance degrades linearly with table size.

## Findings

- **Flagged by:** performance-oracle (CRITICAL)
- **Columns needing indexes:**
  - `posts.status` + `posts.publishedAt` (composite — used in every public query)
  - `posts.slug` (used in slug lookup)
  - `projects.status` (used in public queries)
  - `projects.slug` (used in slug lookup)
  - `contacts.createdAt` (used in admin listing)
  - `posts.categoryId` (foreign key, used in joins/filters)

## Proposed Solutions

### Solution A: Add indexes via Drizzle migration (Recommended)
- Add indexes in the Drizzle schema files
- Generate and run migration
- **Pros:** Handled by ORM, version-controlled
- **Cons:** None significant
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/db/schema/posts.ts`, `src/db/schema/projects.ts`, `src/db/schema/contacts.ts`
- **Database changes:** Add indexes

## Acceptance Criteria

- [ ] Composite index on `(status, publishedAt)` for posts
- [ ] Index on `posts.slug`
- [ ] Index on `projects.status` and `projects.slug`
- [ ] Index on `contacts.createdAt`
- [ ] Migration generated and applied successfully

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Standard optimization for query patterns |

## Resources

- PR #1
