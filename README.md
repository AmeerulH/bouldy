# Bouldy

Bouldy is a mobile-first climbing journal for the Malaysian bouldering scene. Today, climbers can find a gym, start a session, log attempts on its routes, and review their progress. The long-term aim is a **Strava-like home for bouldering**: personal history first, then social activity, beta sharing, challenges, and fair leaderboards built on trustworthy climbing data.

The frontend lives in this repository and is deployed at [bouldy.vercel.app](https://bouldy.vercel.app/). The separate FastAPI backend is deployed at [bouldy-api.onrender.com](https://bouldy-api.onrender.com); its current contract is at [/openapi.json](https://bouldy-api.onrender.com/openapi.json). The backend's source and migrations are **not** in this checkout.

## Start here (humans and agents)

1. [MASTER_SPEC.md](./MASTER_SPEC.md) — product goal, current experience, roadmap, data model, decisions, and quality bar. This is the living master reference.
2. [docs/FRONTEND_SPEC.md](./docs/FRONTEND_SPEC.md) — implemented routes, code ownership, auth/data flow, design system, and local checks.
3. [docs/BACKEND_SPEC.md](./docs/BACKEND_SPEC.md) — verified public API contract, backend architecture known from prior source review, gaps, and proposed future contracts.
4. [DESIGN.md](./DESIGN.md) — canonical visual and component rules. Storybook is the component catalogue.

**Status labels matter:** `Live` means present in this frontend or in the current public OpenAPI schema, as specified; `Planned` is a product direction, not a shipped feature or agreed API. If code, API, and docs disagree, verify the code and live API, then update the specs in the same change. Do not invent persistence, social metrics, or data for a mock-up.

## Product improvement work briefs

- [Frontend product improvements](./docs/FRONTEND_PRODUCT_IMPROVEMENTS.md) — a separate backlog of five tasks FE can start without new BE changes, optional prototypes/input-dependent work, and later BE-dependent enhancements, with difficulty and acceptance criteria.
- [Backend product improvements](./docs/BACKEND_PRODUCT_IMPROVEMENTS.md) — enabling work, BE difficulty, proposed contracts, product decisions and delivery order for the same proposals.

These briefs split the 1 October 2026 feasibility report into team backlogs, checked against source/contracts on 3 October 2026. Proposed features and rules remain recommendations, not shipped functionality.

## Current user journey

Sign up or log in → choose or add a gym → start a session → browse active routes → log attempts, a send, or a first-try flash → end the session → review the journal and Home summary. Routes should be **retired**, not deleted, when a gym resets its wall; historic attempts must remain readable.

This is intentionally one phone-oriented web experience: edge-to-edge on a phone and a narrow mobile canvas on desktop. It is not a desktop dashboard.

## Local development

Use a Node.js release supported by the installed Next.js version, then:

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The frontend uses the public Render API through server-side requests; there is no backend database in this repository. To inspect components independently, run `npm run storybook` and open [localhost:6006](http://localhost:6006).

Before handing off a change, run `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Keep `MASTER_SPEC.md` and the relevant focused spec in sync with user-visible or API-contract changes. Do not commit credentials or test-account passwords.
