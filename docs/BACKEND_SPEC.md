# Bouldy backend and API specification

**Contract checked:** public [OpenAPI schema](https://bouldy-api.onrender.com/openapi.json) on 2026-10-01 (title `Bouldy API`, version `1.0.0`). **This repository is the frontend checkout, not the backend source.** Recheck OpenAPI and the backend repository before changing a server contract or claiming runtime behaviour. [MASTER_SPEC.md](../MASTER_SPEC.md) is the product authority; [FRONTEND_SPEC.md](./FRONTEND_SPEC.md) describes its current consumer.

## Known deployment and architecture

Earlier backend-source review identified FastAPI, SQLAlchemy 2, Alembic migrations, PostgreSQL on Neon, a Render-hosted API, PyJWT bearer auth, and Argon2 password hashing. The separate backend repository was reported as `fawzazrn/bouldy`. Those implementation and hosting details are **historical source-review notes**, not reverified backend-source facts in this frontend checkout. The public Render API and OpenAPI schema were reachable on the contract-check date.

The five live domain families are User, Gym, Route, Session, and Attempt:

- A User owns Sessions. A Session belongs to a Gym. A Gym has Routes. An Attempt links one Session to one Route.
- A Route can become `retired` when a wall resets; it should continue to resolve from past attempts. The API also exposes DELETE, so preserving references is a product rule that must be enforced in application behaviour and server tests, not assumed from the route model alone.
- One Attempt represents the **aggregated record** for a route in one session, not one database row per physical try. The frontend creates it once and updates `num_attempts` and `result` afterwards. Confirm uniqueness and concurrent-update behaviour in the backend source/tests before relying on this as a database guarantee.
- User-owned session and attempt operations require a JWT in the published OpenAPI. The current frontend sends it server-side. The published schema still requires `SessionCreate.user_id`; earlier backend-router inspection indicated the server derives ownership from the JWT instead of trusting that field. Reconfirm this in backend code/security tests when working on authorization.

## Live API surface

Base URL: `https://bouldy-api.onrender.com`. OpenAPI describes request/response shapes; it does **not** by itself prove every runtime permission check or happy-path write.

| Domain | Published operations | Authentication in OpenAPI |
| --- | --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | `/auth/me` requires bearer; register/login are public. Login is form-encoded OAuth2 and the email is sent under `username`. |
| Gyms | `GET/POST /gyms/`, `GET/PUT/DELETE /gyms/{gym_id}`, `GET /gyms/{gym_id}/routes` | No bearer requirement declared, including writes. |
| Routes | `GET/POST /routes/`, `GET/PUT/DELETE /routes/{route_id}`, `PATCH /routes/{route_id}/retire` | No bearer requirement declared, including writes. |
| Sessions | `GET/POST /sessions/`, `GET/PUT/DELETE /sessions/{session_id}` | Bearer required. |
| Attempts | `GET/POST /sessions/{session_id}/attempts`, `GET/PATCH/DELETE /attempts/{attempt_id}` | Bearer required. |

`GET /gyms/{gym_id}/routes` **is present** in the current schema; older notes reporting it as missing are stale. The frontend retains a list-all/filter fallback for inconsistent deployments.

## Current data contract

| Entity | Published fields that matter to product | Important constraints |
| --- | --- | --- |
| User | `id`, `username`, `email`, optional `current_grade`; registration also sends a password | No OTP or email-verification endpoint in OpenAPI. Never expose password hashes. |
| Gym | `id`, `name`, `location` | Create requires name/location. No `grading_system` field yet. |
| Route | `id`, `gym_id`, `route_name`, `grade`, optional `colour`, `wall`, `setter`, `set_date`, `retired_date`, `styles[]`, `status` | Create requires gym, name, grade. `grade` and `colour` are free text. `status` is `active` or `retired`. `styles[]` uses a 19-value enum. No competition flag, perceived grade, image, or video field. |
| Session | `id`, `user_id`, `gym_id`, `session_date`, `duration_minutes`, optional `notes` | Create currently requires user ID, gym ID, date, duration in the schema; frontend treats a zero-minute session as in progress. That live/completed convention is a frontend convention, not a separate API status. |
| Attempt | `id`, `session_id`, `route_id`, `num_attempts`, `result`, optional `notes` | Create requires route ID and count (minimum 1); default result is `project`. Enum: `project`, `zone`, `send`, `flash`. The frontend validates flash as exactly one attempt, but the schema alone does not encode that cross-field rule. |

Route styles published by the API: `Crimps`, `Slopers`, `Pinches`, `Jugs`, `Pockets`, `Dyno`, `Deadpoint`, `Static`, `Coordination`, `Slab`, `Vertical`, `Overhang`, `Roof`, `Compression`, `Balance`, `Mantle`, `Heel Hook`, `Toe Hook`, `Gaston`. Keep the frontend picker in `lib/route-options.ts` aligned with this enum.

## Current backend/contract gaps

1. **Write permissions:** gym and route writes have no authentication requirement in OpenAPI. Before wider launch, define who may create/edit/retire gyms and routes (community users vs gym operators vs admins), enforce it server-side, and test cross-user/cross-gym access. Do not mistake frontend login gates for API authorization.
2. **Grade meaning:** route `grade` is free text and gyms do not identify their scale. This is fine for logging, but cross-gym grade comparisons and leaderboards need an explicit grading-system and mapping policy. Avoid silently treating gym dots, colour circuits, Fontainebleau, and V grades as equivalent.
3. **Competition results:** `zone` exists, but routes have no `is_competition` flag. Add it to database and route create/update/response contracts before enabling Zone for new routes. Preserve old Zone history.
4. **Perceived grade:** climber-specific “felt like V2” should be attached to a user/session-route experience, not silently mutate a shared gym route. Agree the ownership and schema before shipping UI persistence.
5. **Media:** no upload or media URL contract for route photos or beta videos. Storage, ownership, moderation, limits, consent, and deletion policy are all pending.
6. **Lifecycle and aggregation:** verify that retiring (not deleting) routes preserves session history, and that an attempt cannot reference a route from a different gym or a session owned by someone else. Add database constraints/tests where appropriate.
7. **Scale of reads:** current Home/Journal can request attempts for many sessions. A future activity summary/feed or leaderboard should use paginated, server-side aggregation rather than N+1 client/page reads.

## Strava-like expansion — proposed, not implemented

The present API has **no** feed, public profile, follows, reactions, comments, challenges, leaderboards, gym-operator role, or verification endpoints. These are product ideas requiring design and agreement, not documented live contracts.

A reasonable dependency order is: reliable private logs → privacy/profile choices → optional sharing and follows → media/beta with moderation → gym- or reset-period-specific challenges and leaderboards → verified gym/competition results and operator tools. Before any leaderboard implementation, decide:

- **Who is included:** opt-in visibility, private sessions, minors, blocked users, and gym-specific participation.
- **What is ranked:** sends, flashes, consistency, improvement, or challenge completion; time window and wall-reset boundary; whether self-reported attempts count.
- **How results are compared:** gym-local grades versus normalized scales, different route sets, attempts on retired routes, duplicate sessions, and corrections.
- **How abuse is handled:** self-report labels, gym verification/competition results where available, moderation/reporting, audit trail, and correction policy. Do not present self-reported numbers as verified performance.

A first leaderboard should probably be **gym-local and time-bounded**, with the scoring rule and verification level visible to climbers. That is a product proposal, not an approved backend schema or release commitment.

## Working agreement for backend changes

Coordinate each new feature as a versioned contract: data ownership → migration → Pydantic request/response fields → authorization/validation → endpoint and OpenAPI update → frontend type/actions/UI → tests. For schema or security work, inspect the actual backend source repository; do not implement a guessed server change in this frontend repo. Keep [../MASTER_SPEC.md](../MASTER_SPEC.md) and this file current, and mark unknowns as unknowns.
