---
status: complete
priority: p2
issue_id: "010"
tags: [code-review, architecture, duplication]
dependencies: []
---

# Duplicated Slugify Function in 4 Places

## Problem Statement

The `slugify` logic exists in 4 different locations across the codebase. This violates DRY and risks inconsistent slug generation if one copy is modified but others aren't.

**Why it matters:** Inconsistent slugs could cause broken links or duplicate content issues.

## Findings

- **Flagged by:** pattern-recognition-specialist
- **Locations:** 4 separate implementations across server functions and components

## Proposed Solutions

### Solution A: Extract to shared utility (Recommended)
- Create `src/lib/slugify.ts` with a single `slugify()` export
- Replace all 4 copies with imports from the shared module
- **Pros:** DRY, single source of truth
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** 4 files containing slugify implementations
- **New file:** `src/lib/slugify.ts`

## Acceptance Criteria

- [ ] Single `slugify` function in `src/lib/slugify.ts`
- [ ] All 4 previous copies replaced with imports
- [ ] Existing slugs are unaffected (behavior preserved)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | DRY violation across 4 files |

## Resources

- PR #1
