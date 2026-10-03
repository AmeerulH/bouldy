# Bouldy frontend local-work handoff

Updated 3 October 2026. Repository: `/Users/Ambassador/Desktop/Ameerul/Work/bouldy/bouldy-web`.

## Instructions that must persist

- Work locally. The user explicitly said **do not commit anything yet**. Do not stage, commit, push, merge or deploy without new authorization.
- Keep the mobile app layout on desktop: centered 430px canvas, light logbook surfaces, red actions and Home / Explore / Sessions / Gyms / You bottom tabs (five tabs since the 3 October mobile-native pass).
- Preserve all existing local changes. Several documents and frontend additions were already modified before the latest request.
- Only implement frontend work that can use existing backend contracts. Backend ownership, concurrency, media, competition flags and social features remain separate work.
- Read `AGENTS.md`, `README.md`, `MASTER_SPEC.md`, `docs/FRONTEND_SPEC.md`, `PRODUCT.md` and `DESIGN.md` for repository guidance. The user explicitly invoked `/Users/Ambassador/.agents/skills/impeccable/SKILL.md`.
- DESIGN.md and `.impeccable/design.json` have known pre-existing drift. No repair was authorized. Preserve them.

## What the user asked for

Split the product feasibility report into FE and BE team plans, clearly separating frontend tasks that can start without backend dependencies. A readable BE handoff was also requested earlier. The current implementation phase is local frontend work. Most recently, the user asked to improve gym route editing because the closed route cards have too much white space, then asked for a handoff summary in case another agent needs to continue.

## Existing local FE work

Five improvements were implemented before the gym-card request:

1. Compact expandable completed cards in an active session. Grade, colour, result and count remain identifiable.
2. Private route-note editing. Notes save independently; failed saves preserve the draft, and unsaved edits do not show stale success feedback.
3. Owner-only `/profile`: identity, grade, journal totals and visited gyms.
4. Owner-only `/routes/[id]` session-level history, including retired routes and private notes. Same-day visits do not invent an unknown visit order.
5. Continue-project suggestions. Previous visits and today's attempts remain separate. First try today can be a send; lifetime flash is suppressed when history is incomplete, ambiguous or contains previous tries.

Main additions: `components/route-log-card.tsx`, `attempt-note.tsx`, `result-badge.tsx`, `journal-warning.tsx`; profile and route-history pages; `lib/journal.ts`, `lib/journal-summary.ts`; tests in `tests/journal-summary.test.mjs`.

`lib/actions.ts` was updated for independent notes, historical validation and revalidation. `proxy.ts` protects profile/history. Home, Sessions and Profile avoid presenting incomplete reads as accurate zero totals. Journal reads use bounded concurrency. API-level concurrency and permissions still require backend work.

Earlier verification passed: lint, TypeScript, webpack production build, five journal unit tests and sample-data integration checks at 320 / 390 / 430 / 1440px. The earlier finish review reported the fixes ready for local review. These results precede the latest gym-card refinement; do not describe them as fresh production verification.

## Latest gym route editing refinement

Changed `app/(app)/gyms/[id]/page.tsx`:

- Removed the separate closed-state Edit route footer and divider.
- Each route has one native disclosure row: 48px hold, prominent grade with colour beside it, wrapping route name, optional wall/styles/setter, and right-aligned pencil + Edit.
- Activating the row opens the existing route form below a divider. Edit becomes Close while open.
- Native disclosure supports mouse/touch, Enter and Space and browser expanded-state semantics. Focus uses the existing design system.
- Existing save action, route fields, API contracts and shared `RouteForm` behavior remain intact. No real route data was edited during testing.

The compact row retains 16px padding and grows with metadata rather than hiding it. Rich sample cards measured about 152px at390 and 187px at320; minimal real records will be shorter. Do not claim a universal percentage reduction.

`MASTER_SPEC.md` and `docs/FRONTEND_SPEC.md` now describe the compact disclosure. Direction and evidence are in `.impeccable/surfaces/app-app-gyms-id-page-tsx.md`.

Latest verification passed: scoped lint, TypeScript, no layout-detector findings, and isolated Chrome sample-data checks at320 /390 /1440. Checks covered click/Enter/Space open and close, prefilled form values, long-name wrapping, no horizontal overflow and no browser page errors. Save requests were not exercised because the save code was unchanged. Screenshots in `.impeccable/review/` are `{narrow,mobile,desktop}-gym-route-{cards,editor}.png`. They show sample data and the normal viewport, not a full internal-scroll capture.

## Runtime and preview notes

- Actual-data dev server: `http://127.0.0.1:3000`; user currently has `/gyms/1` open. Changes in the original repository are picked up by this server.
- Isolated sample preview used `http://127.0.0.1:3001`, from temporary copied source `/private/tmp/bouldy-route-preview`. This copy has a symlink to the original node_modules. It does not track subsequent source edits automatically. The temporary preview was stopped after verification.
- Sample API: `http://127.0.0.1:4010`, script `/private/tmp/bouldy-fe-qa/api.cjs`. Fake cookie token is `sample-owner`; no real credentials. Sample preview is visibly labelled.
- Sample layout checker: `/private/tmp/bouldy-fe-qa/route-layout.cjs`.
- Temporary sample services API19482 and preview97129 were stopped after verification. Keep the user's original3000 preview available.
- Two Next dev servers cannot share the same source directory because of the dev lock. This is why the sample preview uses a temporary copy.
- Use bundled Node and webpack. System Turbopack/runtime was unreliable. Node: `/Users/Ambassador/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.
- System Git requires an Xcode licence; bundled Git works: `/Users/Ambassador/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/git`.
- Chrome automation can use bundled Playwright with `channel: 'chrome'`. Do not install browser packages. Use screenshot `caret: 'initial'` to avoid screenshot instrumentation causing hydration warnings.
- App scroll lives in `.app-shell__scroll`; fullPage screenshots do not capture that internal scroll automatically.
- `lib/api.ts` accepts `BOULDY_LOCAL_API` only in development and only for localhost /127.0.0.1. Production uses the existing Render API.

## Next steps

The gym-card code and bounded functional/visual checks are complete. The final independent finish review marked all seven layout issues resolved, no remaining material fixes, disposition ready for local review. The user's review is next. Do not commit. Further refinements should follow their feedback rather than start another broad polish pass.

This handoff is a status note, not permission to expand scope or change backend data.

## Mobile-native flows pass (3 October 2026, local, uncommitted)

Requested: stop expanding forms inline; make flows feel like a phone app; add under-construction pages for planned social features.

- **Pages for long forms:** `/gyms/[id]/routes/new`, `/gyms/[id]/routes/[routeId]/edit`, `/sessions/[id]/routes/new` (shared `components/route-form-screen.tsx`, sticky Save bar in `route-form.tsx`, tab bar hidden). `lib/actions.ts` sends errors back to the form page and success to the list.
- **Bottom sheets for short tasks:** add gym, correct route log, private note (`attempt-note.tsx`) and end session, via `components/ui/bottom-sheet.tsx` (`?sheet=<id>`, native dialog, swipe/Escape/backdrop/back to close). Sheet actions redirect with `RedirectType.replace`.
- **Navigation:** five tabs; `/profile` is You and holds Log out; Home header trimmed. `components/page-motion.tsx` slides pushed pages from the right. `proxy.ts` protects `/explore`.
- **Under construction (no data, no live-looking controls):** `/explore` plus `feed`, `climbers`, `leaderboards`, `challenges`, `groups`; `/profile/edit|public|privacy`; `/routes/[id]/beta`. Template: `components/under-construction.tsx`. Gym detail links to the planned gym leaderboard.
- **Verification (sample API, not production):** lint, `tsc --noEmit`, and Playwright flows at 320 / 390 / 430 / 1440px covering sheet open/Escape/back/backdrop/swipe, focus return, add-gym submit, route edit save, note save, no horizontal overflow and no page errors. A webpack production build was run separately; see the final summary. Real data was not written; saves went to the sample API.
- **Known limits:** a failed route save reloads the form from stored values (typed input is not preserved); native `<dialog>` exit animation is a 200ms timer; hard-refresh on `?sheet=` reopens the sheet by design.
- The temporary preview copy `/private/tmp/bouldy-route-preview` does not auto-track source; re-sync before reuse.

## Route browsing pass (3 October 2026, local, uncommitted)

Requested: group each gym's routes by grade, add search and filters during a session, when reviewing a session and across past climbs, and avoid endless scrolling. The user chose compact rows with a quick `+1` plus a route sheet, a `Sessions | Climbs` switch, and the full scope.

- **Shared browser:** `components/route-browser.tsx` (search, `route-filters` sheet, grade rail, collapsible grade groups, URL plus `sessionStorage` filter state), `components/route-rows.tsx`, `lib/route-grades.ts`. Used by `/gyms/[id]`, `/sessions/[id]` and `/climbs`.
- **Session detail:** a pinned `Today` section, compact rows with `+1`, and a route sheet (`?sheet=route-<id>`) replacing the old expanding cards and `correct-<id>` sheets. `components/route-log-card.tsx` was removed. Completed sessions list only that visit's routes. Live filters are lifetime-based: New to you, Projects, Sent.
- **Sessions tab:** `components/journal-switch.tsx`, month-grouped journal (`components/month-groups.tsx`), featured board no longer lists every gym route. `/climbs` is new (proxy-protected, Sessions tab active, its own skeleton).
- **Verification (sample API with 94 routes over two gyms and 12 sessions, not production):** lint, `tsc --noEmit`, `node --test tests/*.test.mjs` (10 pass), Playwright at 320 / 390 / 1440px covering grade rail, search flattening, filter sheet, `+1` keeping filters through the redirect, route sheet, session review, gym detail, month paging, Climbs gym drill-in, no horizontal overflow. Use `http://localhost:3001` for preview QA: Next blocks dev resources requested from `127.0.0.1`, which stops hydration.
- **Snackbars:** success notices (`?notice=` and note saves) now float at the top via `components/ui/snackbar.tsx` and dismiss on tap or after 5s; `FeedbackMessage` is inline errors/warnings only and no longer has a success tone. Verified at 320/390/1440px and reduced motion: content does not move, notice is stripped from the URL, refresh does not replay.
- **Known limits:** colour-circuit grades sort alphabetically until gyms can declare a grading system; Climbs reads the whole journal (the planned BE history endpoint would replace it); a successful `+1` from the route sheet replaces the sheet's history entry, so one extra Back step can return to the same list.
