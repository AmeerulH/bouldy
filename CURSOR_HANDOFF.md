# Bouldy — Cursor Handoff

**Date:** 2026-09-13
**Frontend repo:** `git@github.com:AmeerulH/bouldy.git`
**Working directory:** `/Users/Ambassador/Desktop/Ameerul/Work/bouldy/bouldy-web`
**Branch:** `main`
**Master specification:** [`MASTER_SPEC.md`](./MASTER_SPEC.md) — treat this as the living source of truth and update it with any user-visible or API-contract change.

## Product and design north star

Bouldy is a mobile-first bouldering session tracker. The browser must keep the focused phone-sized shell even at desktop widths; do not add a desktop dashboard layout. The chosen visual direction is an expressive route journal:

- bright neutral surface with charcoal performance panels;
- `Barlow Condensed` for bold all-caps headings and grades; Geist for normal UI text;
- red primary action, with real route colours (red, blue, green, etc.) used as route identifiers;
- generous hierarchy and compact cards, not dense dashboard widgets;
- purposeful feedback only: hover/press states and in-button loaders for all mutation buttons; honour reduced-motion.

The Sessions design reference is `/Users/Ambassador/Desktop/Screenshot 2026-09-13 at 4.31.35 pm.png`. Match its hierarchy and energy, while only rendering real backend data. Do not create fake routes, session counts, durations, or sends to fill the design.

## Work completed in this session

### Sessions visual board

- Rebuilt `app/(app)/sessions/page.tsx` from a plain history list into the reference-inspired Sessions board.
- It fetches the newest real session plus its attempts and routes, then renders:
  - large Sessions masthead and month label;
  - charcoal featured-session panel with date, gym, duration/live state, route count, send count, and an outcome strip;
  - route cards with actual grade, name, styles, attempt count, and actual result;
  - a Log route CTA that opens the live session's add-route form or goes to Gyms when the newest session is completed;
  - a compact all-sessions journal below the feature board.
- Route summaries count `flash`, `send`, `project`/`zone`, and active routes with no attempt. They intentionally avoid fabricated values.

### Local route assets

- Added `components/route-hold.tsx` plus individual detailed SVG exports under `public/route-holds/` for red, blue, blue-triangle, green, yellow, orange, purple, pink, black, and white route colours. These have moulded shading, highlights, surface speckles, and bolt hardware, while still remaining sharp at every screen density.
- Replaced the square grade marker on `app/(app)/sessions/[id]/page.tsx` with this SVG hold and retained the gym grade next to the route name.
- Added `id="add-route"` to the session-detail add-route disclosure so the Sessions CTA can land there.

### Rendering recovery

- Removed an invalid client-rendered theme-init script from `app/layout.tsx`. The application now starts with the supported default red accent without producing a React/Next script-render error.
- Removed an invalid cookie deletion from the Home Server Component. A missing or expired login now simply redirects to `/login`; cookie writes remain limited to Server Actions such as logout.

### Existing functional work already in the checkout

- Auth uses the live Render FastAPI API and stores JWTs in HTTP-only cookies.
- Login, signup, logout, gym creation, route creation, start session, attempt logging, ending session, and route-log correction are implemented as Server Actions.
- `correctAttemptAction` allows the user to reduce attempt counts or restore a flash. It enforces that `flash` has exactly one attempt.
- `getGymRoutes` falls back to `/routes/` filtered by `gym_id` because some backend deployments do not expose the convenience endpoint consistently.
- `/history` redirects to `/sessions`.
- Global button feedback/loader rules are in `app/globals.css`; form submit buttons use `components/submit-button.tsx`.
- Home header was corrected so long usernames truncate safely without colliding with logout.

## Backend and data constraints

Current backend: `https://bouldy-api.onrender.com` (FastAPI/Postgres/JWT).

Implemented entities:

- Gyms: name, location.
- Routes: gym_id, route_name, grade, colour, wall, setter, dates, active/retired status, styles.
- Sessions: user ownership via JWT, gym, date, duration, notes.
- Attempts: session + route, aggregated `num_attempts`, result (`flash`, `zone`, `send`, `project`), notes.

Do not fake persistence for these planned features. Keep them “Coming soon” until API/database work exists:

1. `Gym.grading_system` free-text field.
2. A climber's perceived/felt grade. Preferred owner: `Attempt` or another session-scoped route-log record, not the shared Route.
3. Route photos/storage.
4. Beta videos/storage/moderation.
5. Grade-conversion mapping.

Routes are retired rather than deleted so historical attempts must keep resolving. When rendering historic routes, include a retired route if that session has an attempt for it.

## Important files

| Path | Responsibility |
| --- | --- |
| `MASTER_SPEC.md` | Current full product, UI, frontend, backend, and roadmap spec |
| `CLAUDE.md` | Short project context; points to master spec |
| `lib/api.ts` | API client, types, and gym-route fallback |
| `lib/actions.ts` | Mutating Server Actions and validation |
| `lib/session.ts` | HTTP-only token cookie helpers |
| `app/(app)/sessions/page.tsx` | New reference-style Sessions board |
| `app/(app)/sessions/[id]/page.tsx` | Functional session route logging/detail |
| `components/route-hold.tsx` | Local colour-aware SVG climbing holds |
| `components/submit-button.tsx` | Mutation-button loader behaviour |
| `app/globals.css` | Design tokens, mobile shell rules, interaction/reduced-motion rules |

## Verify next

Already passed on 2026-09-13: `npm run lint`, `./node_modules/.bin/tsc --noEmit`, and `git diff --check`.

1. Run the app using a supported Node release. The machine default Node has been Node 19, which is too old for Next 16. Node 25 was available at `/opt/homebrew/Cellar/node/25.2.1/bin/node`; use a supported Node 20.9+ release for normal development.
2. Sign in with a real test account and inspect `/sessions` at 320px, 375px, 430px, and desktop-contained view. Confirm the latest session data correctly appears in the feature board and all route cards are readable.
3. Test the full active-session flow: route log, correct a send back to a one-attempt flash, Add route anchor, and end session.

## Known follow-ups

- Verify the new Sessions board visually in a persistent local browser session; this assistant's local server process did not persist after command completion, so visual confirmation after this exact patch remains outstanding.
- The Sessions route cards link to the containing session rather than a route detail page because there is no route-detail route yet.
- Consider a real branded Bouldy mark once a brand asset is supplied. The current `B` roundel is intentionally decorative, not an unimplemented menu button.
- Decide whether `zone` should be differentiated in the product vocabulary from “in progress” on the visual summary.
- Ask backend to confirm/ship gym-scoped routes consistently and the planned grading/media fields above.
- Do not commit, push, reset, or discard the existing mixed working tree without reviewing all prior changes; the workspace has many intentionally uncommitted files from earlier work.
