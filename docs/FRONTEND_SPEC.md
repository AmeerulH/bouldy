# Bouldy frontend specification

**Status:** implemented code map, inspected 2026-10-01. **Repository:** `AmeerulH/bouldy`. **Production:** [bouldy.vercel.app](https://bouldy.vercel.app/). Read [../MASTER_SPEC.md](../MASTER_SPEC.md) for product decisions and [../DESIGN.md](../DESIGN.md) for visual rules.

## Purpose and boundaries

This Next.js application is the mobile-only interface for a climbing journal. It renders the same narrow, phone-oriented app on desktop and edge-to-edge on mobile. Its own database does not exist: persisted users, gyms, routes, sessions, and attempts come from the separate FastAPI service. Server-side API calls and Server Actions keep the bearer token away from client JavaScript. This is a frontend architecture description, **not** evidence that every backend endpoint has been end-to-end tested.

## Stack and layout

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and targeted `motion` animations.
- `app/(auth)/` owns public Welcome, Login, and Signup; `app/(app)/` owns signed-in screens. Route-group names do not appear in URLs.
- `components/app-shell.tsx` constrains the UI to a mobile canvas; `components/bottom-nav.tsx` provides Home, Sessions, and Gyms.
- `components/ui/` holds reusable button, field, feedback, and section-heading primitives. `components/route-form.tsx` is shared between session route creation and gym route editing.
- `public/route-holds/` contains detailed colour-matched SVG hold illustrations. `lib/route-options.ts` is the frontend source for selectable colour and style values.
- Storybook 10 uses `@storybook/nextjs-vite` with Docs and Accessibility addons. Stories live beside reusable components.

## Implemented page map

| URL | Access | Job and current behaviour |
| --- | --- | --- |
| `/welcome` | Public | Entry screen for signed-out users, with paths to Login and Signup. |
| `/login`, `/signup` | Public | Authenticate/register through Server Actions; successful auth lands on Home. There is no OTP flow in the current API. |
| `/` | Signed in; signed-out users go to Welcome | Real-data Home summary: latest session, sends, flashes, gyms visited, recent sessions, start-session link, logout. |
| `/gyms` | Signed in | List and add gyms; open a gym or start a session directly. |
| `/gyms/[id]` | Signed in | View active routes, add a route, edit an existing active route, or start a session at that gym. |
| `/sessions` | Signed in | Featured latest-session board with real route outcomes plus the complete session journal. |
| `/sessions/[id]` | Signed in | View one owned session and its gym routes; log a try, mark it Sent, Flash on the first try, correct count/result, add a route, and end the session. |
| `/history` | Signed in | Compatibility redirect to `/sessions`. |
| Unknown URL | Public | Branded 404 with a link to `/`, which resolves according to auth state. |
| `/brand-preview`, `/loading-preview` | Development only | Internal design previews; not public product pages in production. |

There is **no** Feed, Profiles, Follows, Leaderboards, Challenges, route-photo upload, beta-video upload, or gym-owner dashboard in the current frontend. These are future product directions, not hidden features.

## Authentication and data flow

1. `lib/api.ts` defines API types and wraps `fetch` calls to the Render backend with `cache: "no-store"`.
2. `lib/actions.ts` handles login/signup/logout and mutations. The backend OAuth2 login expects an email in the form field named `username`.
3. `lib/session.ts` stores the JWT in an HTTP-only, SameSite=Lax cookie called `bouldy_token`; it is Secure in production.
4. `proxy.ts` redirects requests with no cookie from known protected routes to `/welcome`. `app/(app)/layout.tsx` calls `/auth/me` and rejects a stale/invalid token before showing protected content. The proxy is a fast check, not the authoritative auth check.
5. Signed-in Server Components fetch API data for their page. Mutations submit to Server Actions, show button-local pending feedback, then redirect/refresh through the next server render.
6. `getGymRoutes` first calls `GET /gyms/{id}/routes`; on a 404 or 5xx it falls back to `GET /routes/` filtered by gym. The gym-scoped endpoint is present in the 2026-10-01 live OpenAPI schema, but the fallback remains for older/inconsistent deployments.

Authorization and data integrity belong to the backend. Hidden form fields, a protected frontend page, and JWT-cookie storage do **not** authorize gym/route writes or protect another user's session unless the backend checks them.

## Route and attempt UI rules

- A route is shared gym data. Display the gym's free-text grade and hold colour prominently, then style tags, route name, and setter. The route editor accepts a main style plus additional styles and sends a single `styles[]` list. The current API has no dedicated `primary_style` field; the first returned style is treated as main during editing.
- `Log attempt` creates/updates one session-route attempt record and increments its count. `Sent` changes an already logged route to `send` without incrementing. `⚡ Flash` creates a first-try send with exactly one attempt. Correction permits explicit count/result changes.
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
