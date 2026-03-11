---
status: complete
priority: p3
issue_id: "017"
tags: [code-review, performance, yagni]
dependencies: []
---

# YAGNI — 17 Shiki Language Grammars Preloaded

## Problem Statement

The Shiki highlighter singleton preloads 17 language grammars at startup. Many of these are likely unused in blog posts, adding unnecessary memory usage and startup time.

**Why it matters:** Each grammar consumes memory. For a personal blog, 5-6 languages would likely suffice.

## Findings

- **Flagged by:** code-simplicity-reviewer
- **Location:** `src/lib/markdown.ts` — Shiki highlighter initialization

## Proposed Solutions

### Solution A: Reduce to commonly used languages (Recommended)
- Keep only languages the author actually uses (e.g., typescript, javascript, bash, json, css, html)
- Add others on-demand if needed
- **Pros:** Lower memory, faster startup
- **Cons:** Need to add grammars if new languages are used in posts
- **Effort:** Small
- **Risk:** Low

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/lib/markdown.ts`

## Acceptance Criteria

- [ ] Only actively used language grammars are loaded
- [ ] Code blocks in existing posts still highlight correctly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Memory optimization |

## Resources

- PR #1
