---
status: complete
priority: p1
issue_id: "004"
tags: [code-review, security, performance, critical]
dependencies: []
---

# Rate Limiting Memory Leak — Maps Never Pruned

## Problem Statement

Rate limiting in the contact form uses in-memory `Map` objects to track submission timestamps. These maps are never pruned — entries accumulate indefinitely, causing a memory leak that will eventually crash the Node.js process in production.

Additionally, rate limiting is keyed on email address (not IP), making it trivially bypassable by changing the email field.

**Why it matters:** Memory leak will cause OOM in production. Bypassing rate limit enables spam flooding.

## Findings

- **Flagged by:** kieran-typescript-reviewer (CRITICAL), security-sentinel (HIGH)
- **Location:** `src/server/functions/public.functions.ts` — `submitContact` function
- **Evidence:** Rate limit map stores `{ email -> timestamp }` with no cleanup mechanism. No `setInterval` or TTL-based eviction exists. Rate limit check uses email from user input, not request IP.

## Proposed Solutions

### Solution A: Database-backed rate limiting (Recommended)
- Store submission timestamps in the `contacts` table or a separate `rate_limits` table
- Query recent submissions by IP/email within time window
- Old entries are naturally cleaned up or can be swept via cron
- **Pros:** Survives restarts, no memory leak, works with multiple instances
- **Cons:** Extra DB query per submission
- **Effort:** Medium
- **Risk:** Low

### Solution B: In-memory with TTL cleanup
- Add a `setInterval` that prunes entries older than the rate limit window
- Key on IP address instead of email
- **Pros:** Simple, fast
- **Cons:** Lost on restart, doesn't work with multiple instances
- **Effort:** Small
- **Risk:** Medium (still not production-grade)

### Solution C: External rate limiter (e.g., Redis)
- Use Redis with TTL-based keys
- **Pros:** Production-grade, survives restarts, works with multiple instances
- **Cons:** Additional infrastructure dependency
- **Effort:** Large
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/server/functions/public.functions.ts`
- **Components:** Contact form submission
- **Database changes:** Possibly add `rate_limits` table or use existing `contacts` timestamps

## Acceptance Criteria

- [ ] Rate limit entries are automatically cleaned up after expiry
- [ ] Rate limiting is keyed on IP address (or IP + email)
- [ ] Memory usage is bounded regardless of submission count
- [ ] Rate limiting works correctly after server restart

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Dual issue: memory leak + bypass |

## Resources

- PR #1
