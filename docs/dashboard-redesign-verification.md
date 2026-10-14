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

Evidence is retained in the original checkout at `.impeccable/review/dashboard/`. This document reports the build thread's results from `verification.json` and `detector.json`; the documenter did not rerun tests, build or browser checks.

| Check | Recorded result |
| --- | --- |
| Tests and typecheck | 12 tests passed; typecheck passed |
| Navigation | New post, New project, latest draft edit, Products, Contacts and Subscribers routes recorded |
| UTC date boundary | Baseline recent views 6; inserting 7 views at today minus six changed the authenticated browser total to 13. Buckets at today minus seven and tomorrow did not enter the recent total. Temporary rows were removed |
| Pending and mobile | Pending state captured during an owned local table lock, then rolled back. Mobile navigation opens with `aria-expanded=true`; a 3px themed keyboard outline and no horizontal overflow are recorded |
| Final captures | Parent inspected desktop, mobile, dark and empty captures without overflow. Final comp comparison reports 86% overall match |
| Final acceptance | Independent finish verdict pending. Reviewer identified incorrect automated region labels; spec metadata and phase bookkeeping corrections are in progress. No UI polish was requested |
| Production build | Pending. Node 26 attempt stopped under resource pressure; a serial Node 22 build is running after stopping dev servers |

Final captures are `final-1280.png` at 1280×900, `final-390.png` at 390×1802, `final-1280-dark.png` at 1280×900, `final-empty-1280.png` at 1280×919, `final-empty-390.png` at 390×1805 and `pending-1280.png`. The automated comparison initially measured the attention heading as a control and the footer rule as the complete navigation. The reviewer confirmed those region labels were incorrect. The final finish verdict remains outstanding.

The VPS is off. This dashboard is not deployed, and no authenticated production verification is claimed.
