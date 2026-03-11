---
status: complete
priority: p1
issue_id: "001"
tags: [code-review, security, critical]
dependencies: []
---

# Admin Server Functions Lack Authentication

## Problem Statement

All admin server functions (posts, projects, resume, saas, categories, contacts, media) have **zero authentication checks**. The `_layout.tsx` `beforeLoad` guard only protects client-side routing — it does NOT prevent direct server function invocations. An attacker can call any `createServerFn` directly via HTTP POST, bypassing the admin layout guard entirely.

**Why it matters:** This is a complete authorization bypass. Any unauthenticated user can create, update, or delete any content.

## Findings

- **Flagged by:** security-sentinel (CRITICAL), architecture-strategist (CRITICAL), kieran-typescript-reviewer (CRITICAL), pattern-recognition-specialist
- **Affected files:**
  - `src/server/functions/posts.functions.ts` — all mutations (create, update, delete, publish)
  - `src/server/functions/projects.functions.ts` — all mutations
  - `src/server/functions/resume.functions.ts` — all mutations
  - `src/server/functions/saas.functions.ts` — all mutations
  - `src/server/functions/categories.functions.ts` — all mutations
  - `src/server/functions/contacts.functions.ts` — delete, status update
  - `src/server/functions/media.functions.ts` — upload, delete
- **Evidence:** No call to `getCurrentUser()` or session validation exists in any server function. The only guard is the client-side `beforeLoad` in `src/routes/admin/_layout.tsx`.

## Proposed Solutions

### Solution A: Middleware-based auth (Recommended)
- Create a `requireAuth` middleware that validates session on every admin server function
- Apply via TanStack Start middleware chain
- **Pros:** Single point of enforcement, DRY, hard to forget
- **Cons:** Slight overhead per request
- **Effort:** Medium
- **Risk:** Low

### Solution B: Per-function auth check
- Add `getCurrentUser()` check at the top of every admin server function
- Throw 401/403 if not authenticated
- **Pros:** Explicit, easy to understand
- **Cons:** Easy to forget on new functions, repetitive
- **Effort:** Medium
- **Risk:** Medium (human error)

### Solution C: Server function wrapper
- Create `createAdminServerFn` wrapper that enforces auth before calling handler
- **Pros:** DRY, type-safe
- **Cons:** Additional abstraction layer
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** All `src/server/functions/*.functions.ts` (except `public.functions.ts` and `auth.functions.ts`)
- **Components:** Server functions layer
- **Database changes:** None

## Acceptance Criteria

- [ ] Every admin server function validates authentication before executing
- [ ] Unauthenticated requests to admin functions return 401
- [ ] Tests verify that unauthenticated calls are rejected

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Flagged by 4/6 review agents as critical |

## Resources

- PR #1
- TanStack Start middleware docs
