# Dashboard redesign verification

Updated 2026-10-14. The user approved Studio overview, balancing content work with article readership. The approved reference is [approved-studio-overview.png](images/dashboard-redesign/approved-studio-overview.png), with approval and prompt provenance in its `.png.json` sidecar. Its illustrated counts are preview data.

## Implementation

`DashboardOverview.tsx` replaces the overview body with ruled collection rows, direct draft continuation and inbox access beside view totals, published popular articles and confirmed subscribers. New post and New project remain header actions. Resume, Categories and Webhooks form a short footer navigation row. At 1050px and below, content precedes readership in one column.

Authenticated server functions supply the counts. The latest non-deleted draft opens its edit route directly. Popular articles exclude deleted and unpublished posts. Views count article opens, not unique visitors. The recent total covers seven UTC date buckets, today minus six through today inclusive. The all-time total retains all stored view buckets. Confirmed subscribers and pending confirmations remain separate.

Empty drafts retain the new-article action; an empty popular list explains how articles appear and links to article management. The route has an announced loading state. The implementation uses semantic HTML, Lucide icons and CSS, with no dashboard raster shipped in the interface.

## Design consistency

The dashboard retains Bricolage Grotesque, DM Mono metadata, square controls and the existing admin color tokens. Fine rules separate the two desktop columns; blue emphasizes recent views and the existing attention color identifies unread messages. Dark mode uses the incumbent semantic colors. This is an extension of the coding-adventure admin system. `DESIGN.md` and `.impeccable/design.json` remain unchanged.

The retained detector report contains 21 advisory font-size findings against the narrow type ramp recorded in `DESIGN.md`. This pass records them without adding dashboard-specific sizes to the global system or claiming that the detector is clean.

## Local evidence

Evidence is retained in the original checkout at `.impeccable/review/dashboard/`. This document reports retained evidence and the build thread's final results. The documenter did not rerun tests, build or browser checks.

| Check | Recorded result |
| --- | --- |
| Tests and typecheck | 12 tests passed; typecheck passed before the final CSS-only CTA adjustment |
| Navigation | New post, New project, latest draft edit, Products, Contacts and Subscribers routes recorded |
| UTC date boundary | Baseline recent views 6; inserting 7 views at today minus six changed the authenticated browser total to 13. Buckets at today minus seven and tomorrow did not enter the recent total. Temporary rows were removed |
| Pending and mobile | Pending state captured during an owned local table lock, then rolled back. Mobile navigation opens with `aria-expanded=true`; a 3px themed keyboard outline and no horizontal overflow are recorded |
| Final captures | Compiled local production runtimes on ports 3002 and 3005 supplied normal and empty captures. Desktop, 1440px, mobile, dark and empty views have no recorded overflow; the 800px header DOM check also passed |
| Finish review | `ship` for SCORED FIXES ONLY. Contract, persistence and CTA findings resolved; no visible regression in recaptured normal, dark or empty views |
| Production build | Passed with Node 22.23.1 and a 4096MB heap. `/private/tmp/adryanev-dashboard-final-build.log` records exit 0 |

The hero gate closed with `gate.ok=true`, score `0.864`, without force. The primary desktop CTA now measures 165×57px with its gold fill and border; mobile remains 48px high and dark mode remains readable. The initial comparison mislabeled the attention heading as a control and the footer rule as complete navigation. The reviewer accepted the corrected contract and persistence records.

The separate automated responsive gate remains open and failed. Its 1440×900 comparison marks all regions missing after uniformly shrinking the capture to 1280×800 and padding it. That transform misaligns the fixed 232px navigation rail and fluid content. The reviewer acknowledged this calibration limitation. The screenshots and overflow checks provide local responsive evidence, but the entire automated phase workflow is not recorded as passed.

Committed captures are [desktop](images/dashboard-redesign/desktop.png), [wide desktop](images/dashboard-redesign/desktop-wide.png), [mobile](images/dashboard-redesign/mobile.png), [dark desktop](images/dashboard-redesign/desktop-dark.png), [empty desktop](images/dashboard-redesign/empty-desktop.png), [empty mobile](images/dashboard-redesign/empty-mobile.png) and [pending](images/dashboard-redesign/pending.png). Final populated and empty captures use the compiled runtime; the pending capture comes from the earlier local development check. All eight dashboard documentation PNGs, including the approved comp, embed their origin or exact generated prompt. The provenance scan found zero missing records.

Delivery is tracked in [PR #17](https://github.com/adryanev/adryanev.com/pull/17). Both CI checks passed for implementation commit `2582a5f`; later evidence-only commits have their own check status in the PR. The VPS is off. This dashboard is not deployed, and no authenticated production verification is claimed.
