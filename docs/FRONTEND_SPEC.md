# Bouldy frontend specification

**Status:** implemented code map, updated 2026-10-03; newest journal improvements are local and uncommitted, not deployed. **Repository:** `AmeerulH/bouldy`. **Production:** [bouldy.vercel.app](https://bouldy.vercel.app/). Read [../MASTER_SPEC.md](../MASTER_SPEC.md) for product decisions and [../DESIGN.md](../DESIGN.md) for visual rules.

## Purpose and boundaries

This Next.js application is the mobile-only interface for a climbing journal. It renders the same narrow, phone-oriented app on desktop and edge-to-edge on mobile. Its own database does not exist: persisted users, gyms, routes, sessions, and attempts come from the separate FastAPI service. Server-side API calls and Server Actions keep the bearer token away from client JavaScript. This is a frontend architecture description, **not** evidence that every backend endpoint has been end-to-end tested.

## Stack and layout

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and targeted `motion` animations.
- `app/(auth)/` owns public Welcome, Login, and Signup; `app/(app)/` owns signed-in screens. Route-group names do not appear in URLs.
- `components/app-shell.tsx` constrains the UI to a mobile canvas; `components/bottom-nav.tsx` provides Home, Explore, Sessions, Gyms and You, and hides itself on full-screen route-form pages.
- `components/ui/` holds reusable button, field, feedback, and section-heading primitives. `components/route-form.tsx` is shared between session route creation and gym route editing.
- Gym route cards are compact links (hold, grade, colour, route name, Edit). Each opens `/gyms/[id]/routes/[routeId]/edit`, a full-screen page; Add route opens `/gyms/[id]/routes/new`. Long route names wrap.
- `components/ui/bottom-sheet.tsx` is a native-`<dialog>` bottom sheet whose open state is `?sheet=<id>` (see `SheetTrigger`, `useSheet`, `openSheet`). Actions that use sheets redirect with `RedirectType.replace` and the same `sheet` value on error. `components/ui/screen-header.tsx` is the sticky back header for pushed screens. `components/under-construction.tsx` is the shared template for planned features.
- `public/route-holds/` contains detailed colour-matched SVG hold illustrations. `lib/route-options.ts` is the frontend source for selectable colour and style values.
- Storybook 10 uses `@storybook/nextjs-vite` with Docs and Accessibility addons. Stories live beside reusable components.

## Implemented page map

| URL | Access | Job and current behaviour |
| --- | --- | --- |
| `/welcome` | Public | Entry screen for signed-out users, with paths to Login and Signup. |
| `/login`, `/signup` | Public | Authenticate/register through Server Actions; successful auth lands on Home. There is no OTP flow in the current API. |
| `/` | Signed in; signed-out users go to Welcome | Real-data Home summary: latest session, sends, flashes, gyms visited, recent sessions, start-session link, logout. |
| `/gyms` | Signed in | List gyms; Add gym opens a bottom sheet; open a gym or start a session directly. |
| `/gyms/[id]` | Signed in | Search, filter and browse active routes in grade groups, open one to edit, add a route, start a session, and a link to the planned gym leaderboard. |
| `/gyms/[id]/routes/new`, `/gyms/[id]/routes/[routeId]/edit`, `/sessions/[id]/routes/new` | Signed in | Full-screen route forms with a sticky Save bar. Edit is limited to active routes of that gym; the session variant redirects once the session has ended. Errors return to the form; success returns to the list. |
| `/explore`, `/explore/feed`, `/climbers`, `/leaderboards`, `/challenges`, `/groups` | Signed in | **Under construction.** Planned community features; no data, inputs or sample rows. |
| `/profile/edit`, `/profile/public`, `/profile/privacy` | Signed in | **Under construction.** Planned profile and privacy settings. |
| `/routes/[id]/beta` | Signed in | **Under construction** beta photos and videos; shows only the real route header. |
| `/sessions` | Signed in | `Sessions | Climbs` switch, featured latest-session board with real outcomes, and the session journal grouped by month (three months, then `Show earlier months`). |
| `/climbs` | Signed in | Sessions tab, Climbs view: every owned logged route grouped by gym then grade, with best result, total tries and visits; rows open route history. |
| `/sessions/[id]` | Signed in | Live: the gym's routes in the route browser with a pinned `Today` section, a quick `+1` per row, and a route sheet for Sent/Flash, correction, note and history; add a route; end the session. Completed: only that visit's routes, grouped by grade. |
| `/profile` (You tab) | Signed in | Read-only owner account and summary; private email, current grade, session/visit totals, links to the planned profile screens, and logout. |
| `/routes/[id]` | Signed in | Owner session-level route history, retired-route metadata, private note editing and source-session links. |
| `/history` | Signed in | Compatibility redirect to `/sessions`. |
| Unknown URL | Public | Branded 404 with a link to `/`, which resolves according to auth state. |
| `/brand-preview`, `/loading-preview` | Development only | Internal design previews; not public product pages in production. |

The Explore and profile placeholder screens above are intent only. There is **no** working Feed, editable/public profile, other-user profiles, Follows, Leaderboards, Challenges, route-photo upload, beta-video upload, or gym-owner dashboard in the current frontend. These are future product directions, not hidden features.

## Authentication and data flow

1. `lib/api.ts` defines API types and wraps `fetch` calls to the Render backend with `cache: "no-store"`.
2. `lib/actions.ts` handles login/signup/logout and mutations. The backend OAuth2 login expects an email in the form field named `username`.
3. `lib/session.ts` stores the JWT in an HTTP-only, SameSite=Lax cookie called `bouldy_token`; it is Secure in production.
4. `proxy.ts` redirects requests with no cookie from known protected routes (including `/profile` and `/routes`) to `/welcome`. `app/(app)/layout.tsx` calls `/auth/me` and rejects a stale/invalid token before showing protected content. The proxy is a fast check, not the authoritative auth check.
5. Signed-in Server Components fetch API data for their page. Mutations submit to Server Actions, show button-local pending feedback, then redirect/refresh through the next server render.
6. `getGymRoutes` first calls `GET /gyms/{id}/routes`; on a 404 or 5xx it falls back to `GET /routes/` filtered by gym. The gym-scoped endpoint is present in the 2026-10-01 live OpenAPI schema, but the fallback remains for older/inconsistent deployments.

Authorization and data integrity belong to the backend. Hidden form fields, a protected frontend page, and JWT-cookie storage do **not** authorize gym/route writes or protect another user's session unless the backend checks them.

## Route and attempt UI rules

- A route is shared gym data. Display the gym's free-text grade and hold colour prominently, then style tags, route name, and setter. The route editor accepts a main style plus additional styles and sends a single `styles[]` list. The current API has no dedicated `primary_style` field; the first returned style is treated as main during editing.
- `Log attempt` creates/updates one session-route record and increments this visit’s count. `Sent` changes an existing record without incrementing; with no current record it creates a one-try `send`. `⚡ Flash` requires complete, unambiguous owned history with no earlier tries. Server Actions re-read session/route/logs and apply these FE safeguards. They do not provide atomicity or substitute for backend integrity. Completed-session result corrections remain unavailable.
- The API result enum includes `zone`, but the UI only offers it if a route has `is_competition`. That field is **not in the current public API schema**, so competition classification and new Zone logging are effectively unavailable for now. Existing Zone records stay readable/correctable.
- Retired routes must remain visible in historical sessions if those sessions attempted them. Do not treat a route disappearing from the active gym list as permission to erase history.
- The colour selector includes red, blue, green, yellow, orange, purple, pink, teal, mint, black, white, grey, brown, and transparent. Unknown backend colours render the neutral grey artwork.

## UX and component rules

`DESIGN.md` is the canonical design system: “The Climber's Logbook,” a chalk-white surface, dark performance panels, send-red action accent, Barlow Condensed headings, Geist UI text, local hold SVGs, and a selected Bolt B mark. Do not introduce a desktop dashboard. Navigation has a clear loading response; page-specific skeletons and branded bouldering loaders handle slower API reads; mutation buttons use a familiar circular spinner. Respect keyboard focus, 44px touch targets, and reduced motion. Reuse shared UI components before building page-local variants.

## Change and verification workflow

- Update [../MASTER_SPEC.md](../MASTER_SPEC.md) when the product flow, statuses, or decisions change; update this file when routes, ownership, or data flow change.
- Confirm API changes against [the current OpenAPI schema](https://bouldy-api.onrender.com/openapi.json) and update `lib/api.ts` and [BACKEND_SPEC.md](./BACKEND_SPEC.md) together.
- Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, and relevant Storybook/phone-width visual checks. An authenticated smoke test is needed before claiming the full climbing flow is operational on production.
- Keep test passwords, JWTs, and production credentials out of docs, screenshots, commits, and Storybook fixtures.

## Local journal improvements

- `lib/journal.ts` loads owned sessions with at most six concurrent attempt reads and request-scoped React memoization. Failed loads remain distinct from empty sessions; auth failures propagate. `lib/journal-summary.ts` detects duplicate session-route records and derives safe summary/history totals. This still reads all owned sessions; it does not replace the planned scalable BE history endpoint.
- `components/route-browser.tsx` is the shared client list for gym detail, session detail and Climbs. Server pages pass `BrowserItem`s (route fields, optional `status`, `gym`, `pinned`) with a pre-rendered `row`, so each screen keeps its own row actions. It owns search, the `route-filters` sheet, the grade rail and collapsible grade groups (collapsed above 12 routes). Filters (`q`, `grade`, `status`, `colour`, `wall`, `gym`) are written to the URL with `history.replaceState` (no server round trip) and mirrored in `sessionStorage` per `storageKey`, then restored when a server-action redirect drops them. `lib/route-grades.ts` holds the numeric-aware grade order and search matching (tested in `tests/route-grades.test.mjs`).
- `components/route-rows.tsx` has the compact rows: `GymRouteRow` (edit link), `SessionRouteRow` (opens `?sheet=route-<id>`, with a `+1` form when the page passes `logAction`) and `ClimbRow` (route history link). Route sheets are rendered by the session page outside the browser, because a dialog inside a collapsed group would not render. Log and correction errors redirect to `sheet=route-<id>`; a successful log redirects with `replace` to `#route-<id>`.
- `components/journal-switch.tsx` is the `Sessions | Climbs` segmented control; `components/month-groups.tsx` pages the journal by month. `/climbs` counts as the Sessions tab in the bottom nav and sits after Sessions in the swipe order.
- `components/ui/snackbar.tsx` has `SnackbarHost` (mounted in `app/(app)/layout.tsx` via `AppShell`'s `overlay` slot, outside `PageMotion`), the presentational `Snackbar`, and `showSnackbar()`. Actions redirect with `?notice=<text>`; the host reads it with `useSearchParams`, strips it with `history.replaceState`, and auto-dismisses after 5s or on tap. Pages must not render `notice` themselves. `FeedbackMessage` is error/warning only (`role="alert"`).
- `components/result-badge.tsx` shares existing result semantics.
- `components/attempt-note.tsx` shows the note inline and edits it in a bottom sheet (`?sheet=note-<attemptId>`), or in place (`inline`) inside the session route sheet. It uses an independent Server Action and controlled draft, preserving input on a failed save. Only `notes` is patched; cancel/skipping leaves saved text unchanged. The API enforces owner access.
- Session detail uses complete history for lifetime status (`new`, `project`, `sent`) and separates previous/current counts. Retired routes remain readable; new wall-reset IDs have separate history. Known duplicate current logs pause result/count mutations.
- Home, Sessions and Profile expose unavailable summaries rather than false zero activity. Route-history records remain visible when totals are ambiguous or incomplete. Same-day session order and per-try timing are not inferred.
- The five tasks are current-API FE deliveries; editable profiles, shared grades, scoring, rankings and media remain pending BE contracts.

### Local verification

Use Node 22.18+ for `node --test tests/*.test.mjs` (native TypeScript stripping). Tests cover separate 4+2 counts, duplicate ambiguity, failed/empty reads and reset IDs. Browser integration was exercised with a loopback sample API, including note save/error/draft/reload, correction, continued first-try sends, profile auth and 320/390/430/1440px layouts. These are fixture checks, not authenticated production verification.

For isolated development checks, `BOULDY_LOCAL_API=http://127.0.0.1:<port>` can select a loopback API only in development. The app displays “Sample journal · local preview” in that mode. Production always uses the Render API. No sample records or token shortcuts ship in the app. This machine needs the bundled Node and webpack compiler for local checks; its existing Turbopack process spawning fails with a CPU compatibility error.
