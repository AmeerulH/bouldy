# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Climbers recording bouldering visits, attempts and progress. The interface supports quick logging between tries and reviewing the journal afterward.

## Product Purpose

Bouldy is a personal mobile-first climbing journal. The longer-term goal is a community with opt-in discovery, beta sharing and fair rankings. Current product truth and implementation details are maintained in [MASTER_SPEC.md](./MASTER_SPEC.md), [FRONTEND_SPEC.md](./docs/FRONTEND_SPEC.md) and [BACKEND_SPEC.md](./docs/BACKEND_SPEC.md).

## Capabilities and Constraints

- Persisted users, gyms, routes, sessions, attempts and private notes use the separate FastAPI service. This checkout is the frontend, with server-side authenticated API calls.
- The user approved five local frontend improvements: compact completed cards, independent private route notes, a read-only owner profile, session-level route history, and continue-project suggestions. Keep the work uncommitted and unpushed until asked.
- Prior and current session counts stay separate. Failed reads and ambiguous duplicates must not become zero activity or invented totals. Retired routes remain readable; new reset IDs have separate history.
- Current records are session summaries, not individual physical-try events. Exact send timing and same-day visit ordering are unavailable.
- Editable/public profiles, shared grade catalogs, scoring, rankings, groups and persistent media remain backend-dependent. The current FE safeguards do not replace backend authorization or atomic mutation.

## Brand Commitments

Preserve the established identity in DESIGN.md, the local hold artwork, the phone-oriented desktop experience and Home/Sessions/Gyms navigation. This is an extension, not a redesign.

## Evidence on Hand

The approved frontend work brief is [FRONTEND_PRODUCT_IMPROVEMENTS.md](./docs/FRONTEND_PRODUCT_IMPROVEMENTS.md). Existing code and the live OpenAPI schema establish the current API capabilities. Local sample-data integration checks are not authenticated production verification.

## Product Principles

- Make logging fast and clear while climbing.
- Preserve history across visits and wall resets.
- Show uncertainty honestly; progress precedes comparison.
- Keep personal data private and future social sharing deliberate.

## Accessibility & Inclusion

Support phone-width layouts, keyboard operation, labelled expanded states, readable contrast, touch targets and reduced motion.
