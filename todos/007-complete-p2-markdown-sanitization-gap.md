---
status: complete
priority: p2
issue_id: "007"
tags: [code-review, security, xss]
dependencies: []
---

# Markdown Sanitization Gap — Shiki Runs After Sanitizer

## Problem Statement

In `src/lib/markdown.ts`, the unified pipeline runs `rehype-sanitize` to strip dangerous HTML, but then Shiki syntax highlighting is applied as a post-process step via regex replacement. This means Shiki-generated HTML (which includes `style` attributes and complex markup) bypasses the sanitizer entirely.

**Why it matters:** If Shiki output ever contains or reflects user-controlled content, it could inject unsanitized HTML. The sanitization order violates the principle of sanitize-last.

## Findings

- **Flagged by:** security-sentinel (HIGH)
- **Location:** `src/lib/markdown.ts` — post-process regex after unified pipeline
- **Evidence:** `rehype-sanitize` is in the unified chain, but Shiki highlighting happens after via string regex replacement on the final HTML output.

## Proposed Solutions

### Solution A: Use rehype-shiki instead of post-process (Recommended)
- Replace post-process regex with `rehype-shiki` or `rehype-pretty-code` plugin
- Place it BEFORE `rehype-sanitize` in the pipeline, and configure sanitize to allow Shiki's output classes
- **Pros:** Correct pipeline order, no regex hacks
- **Cons:** Need to configure sanitize allowlist for Shiki classes
- **Effort:** Medium
- **Risk:** Low

### Solution B: Sanitize Shiki output separately
- Run a secondary sanitize pass on Shiki's output before inserting into the HTML
- **Pros:** Keeps current architecture
- **Cons:** Fragile, two sanitize passes
- **Effort:** Small
- **Risk:** Medium

## Recommended Action

<!-- Filled during triage -->

## Technical Details

- **Affected files:** `src/lib/markdown.ts`
- **Components:** Blog post rendering, project descriptions

## Acceptance Criteria

- [ ] All HTML output passes through sanitization AFTER syntax highlighting
- [ ] Code blocks are still highlighted correctly
- [ ] No unsanitized HTML can be injected via code blocks

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-03-11 | Created from code review | Pipeline ordering matters for security |

## Resources

- PR #1
- rehype-sanitize docs
