<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bouldy project instructions

Before changing the product, read `README.md` → `MASTER_SPEC.md` → the relevant `docs/FRONTEND_SPEC.md` or `docs/BACKEND_SPEC.md`. Read `DESIGN.md` for any interface work. These are the living project references.

- Bouldy's current product is a personal mobile-first bouldering journal. The long-term goal is a Strava-like bouldering community with opt-in social features, beta sharing, challenges, and fair leaderboards. Do not present planned features as shipped.
- This checkout contains the Next.js frontend, not the FastAPI backend. Verify server contracts against the live OpenAPI schema and backend source before changing assumptions. Never invent a backend field or persist future features only in the browser while labelling them complete.
- Preserve route history through wall resets, protect session/attempt ownership server-side, and keep the phone-oriented UX on desktop as well as mobile.
- Keep the master spec and relevant focused spec synchronized with any product flow, route, API contract, or architecture change. Do not add credentials or test-account passwords to documentation.
