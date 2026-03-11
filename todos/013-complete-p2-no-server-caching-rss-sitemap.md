---
status: complete
priority: p2
issue_id: "013"
tags: [code-review, performance, caching]
dependencies: []
---

# No Server-Side Caching for RSS/Sitemap

## Problem Statement

RSS feed (`/feed.xml`) and sitemap (`/sitemap.xml`) are regenerated from database on every request. These are expensive queries that produce output that rarely changes.

**Why it matters:** Unnecessary database load on every crawler/reader request. RSS readers poll frequently.

## Findings

- **Flagged by:** performance-oracle
- **Location:** `src/server.tsx` lines 29-47

## Proposed Solutions

### Solution A: In-memory cache with TTL (Recommended)
- Cache generated XML in memory with 5-10 minute TTL
- Invalidate on content change (or just let TTL expire)
- **Pros:** Simple, fast, no external deps
- **Cons:** Not shared across instances
- **Effort:** Small
- **Risk:** Low

### Solution B: Cache-Control headers only
- Already has `max-age=3600` — rely on CDN/reverse proxy caching
- **Pros:** Zero code change (already done)
- **Cons:** Doesn't prevent origin hits without a CDN
- **Effort:** None
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/server.tsx`

## Acceptance Criteria

- [ ] RSS and sitemap are cached server-side between requests
- [ ] Cache respects a reasonable TTL
- [ ] Fresh content appears within TTL window

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Cache-Control alone doesn't prevent origin hits |

## Resources

- PR #1
