---
version: 1
slug: "app-app-sessions-id-page-tsx"
primary_target: "app/(app)/sessions/[id]/page.tsx"
related_targets: ["app/(app)/profile/page.tsx","app/(app)/routes/[id]/page.tsx"]
---

# Journal improvements

Mode: Operate. Scope: the five current-API tasks approved in the frontend improvement brief. Preserve the mobile canvas, three tabs, existing result meanings and correction restrictions. Profile and history are supporting screens within the existing journal, not a visual redesign.

## Direction contract
THESIS: Fast logging at the wall, readable progress between visits. Finished routes recede without hiding their details.
OWN-WORLD: Inherit DESIGN.md: chalk white, dark summaries, condensed headings, Geist controls, local climbing holds, send-red actions.
STORY: Log today, optionally remember what worked, then revisit the same route's session records. Failed reads never look like zero activity.
FIRST VIEWPORT: Session identity and compact summary precede a short continue-project list and stable route cards. Profile opens with owner identity and a small all-time summary. Route history opens with the actual route and its known total, followed by dated visit records.
FORM: Precisely scoped extension of the incumbent logbook; user approved these five tasks and said proceed. No open surface tournament or replacement identity; no seed applies. Inline note editing and accessible compact-card expansion are the signature interaction; inherit reduced-motion navigation.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Documentation verification

Verified 2026-10-03 against `DESIGN.md`, `.impeccable/design.json`, `PRODUCT.md`, `app/globals.css`, the session/profile/route-history page sources, `components/{route-log-card,attempt-note,result-badge,journal-warning}.tsx`, `components/ui/{form-field,feedback-message}.tsx`, `components/ui/button.ts`, and `lib/{journal,journal-summary}.ts`. This is an ordinary extension of The Climber’s Logbook; `DESIGN.md` and its sidecar are preserved byte-for-byte.

The build reuses chalk-white/near-black surfaces and the existing send-red accent, Barlow Condensed climbing identity with Geist interaction text, the centered 430px canvas, three bottom tabs, local hold artwork, flat 16px record/summary corners, 12px fields, pill actions, and the global focus/reduced-motion behavior. `RouteLogCard` and `ResultBadge` extract incumbent record/badge styling; `TextareaField` inherits the shared field shell/control styles. Notes use `SubmitButton` and `FeedbackMessage`; unavailable journal totals use the same feedback surface and an explicit unavailable label. These are reusable extensions, not new foundational tokens or a replacement world. No shipping raster assets were added.

Rendered evidence sampled: `.impeccable/review/mobile-route-cards.png` (expanded project and compact flash), `desktop-profile.png` (centered phone canvas and dark summary), `mobile-history.png` (dated visits and private note), `mobile-partial.png` (unavailable totals), and `mobile-note-error.png` (retained draft and shared error feedback). These are local sample-data captures, not authenticated production verification.

Pre-existing drift remains uncanonized and unrepaired: the incumbent session’s `TODAY’S LOG` eyebrow and lightning/plus glyph devices (confirmed in the HEAD session source) are carried defects, not instructions for future surfaces. `DESIGN.md` still uses `Elevation` rather than the current reference’s canonical `Elevation & Depth`, and its extract-next list still includes the now-extracted ResultBadge. The 2026-09-19 sidecar’s narrative/rule/do/don’t excerpts do not reproduce the incumbent Markdown verbatim and omit later component coverage; it is stale. Existing button ink uses dedicated accent/panel ink values while the Markdown component frontmatter points to chalk-white. None of these discrepancies is legitimized with new tokens or repaired within this scoped extension.

## Finish verdict

The Impeccable finish reviewer returned `ship` for the scored fixes: completed-card accessible names, truthful note-save feedback, and persisted product context are all resolved. The targeted saved-then-edited note capture is `mobile-note-unsaved-edit.png`. The ordinary-extension documentation check preserved DESIGN.md and its sidecar. Final lint, TypeScript/production webpack build, five journal regression tests and local fixture browser flows passed. Browser flows covered keyboard expansion, independent notes/error/draft/reload, 4+2 counts, first-try-today sends, correction, retired/reset routes, incomplete/duplicate/empty history, private profile access and 320/390/430/1440px layouts. The final functional run had no browser page or console errors. No authenticated production mutation flow was tested. Everything remains local, unstaged and uncommitted; the normal-API preview is running on port 3000.
