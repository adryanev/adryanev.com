---
status: complete
priority: p2
issue_id: "009"
tags: [code-review, performance]
dependencies: []
---

# estimateReadingTime Causes Full Post Content Serialization

## Problem Statement

`estimateReadingTime` is called client-side in the blog listing page, which means the full markdown content of every listed post must be serialized from server to client just to calculate a word count. This defeats the purpose of pagination by sending all content for the page's posts.

**Why it matters:** Significantly increases payload size for blog listing pages. Reading time should be computed server-side.

## Findings

- **Flagged by:** performance-oracle, code-simplicity-reviewer
- **Location:** Blog listing route uses `estimateReadingTime` from `@/lib/markdown` on post content client-side
- **Evidence:** The function exists in `src/lib/markdown.ts` and is imported/used in the blog listing component, requiring full `content` field to be in the serialized loader data.

## Proposed Solutions

### Solution A: Compute reading time server-side (Recommended)
- Calculate reading time in the server function / loader
- Return it as a number field alongside the post data
- Exclude full `content` from listing queries (only fetch excerpt/summary)
- **Pros:** Smaller payloads, faster page loads
- **Cons:** Minor server function change
- **Effort:** Small
- **Risk:** Low

### Solution B: Store reading time in database
- Compute on save/publish, store as column
- **Pros:** Zero runtime cost
- **Cons:** Schema change, migration needed
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/server/functions/public.functions.ts`, `src/routes/blog/index.tsx`

## Acceptance Criteria

- [ ] Blog listing does NOT send full post content to the client
- [ ] Reading time is available as a pre-computed field
- [ ] Blog listing payload size is reduced

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Classic SSR data minimization issue |

## Resources

- PR #1
