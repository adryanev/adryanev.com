---
status: complete
priority: p2
issue_id: "008"
tags: [code-review, docker, optimization]
dependencies: []
---

# Docker Production Stage Copies Full node_modules (Including devDeps)

## Problem Statement

The Dockerfile's production stage copies `node_modules` from the builder stage, which includes all devDependencies. This bloats the production image unnecessarily.

**Why it matters:** Larger image = slower deployments, more attack surface, wasted disk/memory.

## Findings

- **Flagged by:** architecture-strategist (HIGH), performance-oracle
- **Location:** `Dockerfile` line 23 — `COPY --from=builder /app/node_modules ./node_modules`
- **Evidence:** The builder stage runs `pnpm install --frozen-lockfile` (all deps), builds, then the runner copies the full `node_modules`. No `pnpm prune --prod` step exists.

## Proposed Solutions

### Solution A: Install production deps separately in runner stage (Recommended)
- Copy `package.json` and `pnpm-lock.yaml` to runner stage
- Run `pnpm install --frozen-lockfile --prod` in runner
- **Pros:** Clean production deps only, smaller image
- **Cons:** Extra install step in build
- **Effort:** Small
- **Risk:** Low

### Solution B: Prune in builder before copy
- Add `RUN pnpm prune --prod` after build step
- Copy pruned `node_modules` to runner
- **Pros:** Simple change
- **Cons:** Modifies builder state
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `Dockerfile`

## Acceptance Criteria

- [ ] Production Docker image contains only production dependencies
- [ ] Image builds and runs correctly
- [ ] Image size is measurably smaller

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Common Docker optimization |

## Resources

- PR #1
