# Bouldy: frontend product improvement work brief

**Audience:** frontend team. **Prepared:** 3 October 2026. **Status:** P12, P7-A, P1-A, P11-A and P2-A are implemented locally in the frontend, uncommitted and not deployed. Other items remain backlog and recommendations.

**Start here:** [Five tasks FE can start now](#3-work-fe-can-start-now-no-new-be-changes-required) · [Optional work needing input](#4-optional-work-without-be-changes-input-or-prototype-required) · [Work waiting for BE](#5-work-waiting-for-be-separate-enhancement-backlog).

Based on **Bouldy: product improvements feasibility report** (1 October 2026), reconciled with the frontend checkout, live OpenAPI and selected backend source on 3 October 2026. Product decisions remain governed by [MASTER_SPEC.md](../MASTER_SPEC.md); the current implementation is described in [FRONTEND_SPEC.md](./FRONTEND_SPEC.md). Read the companion [backend work brief](./BACKEND_PRODUCT_IMPROVEMENTS.md) for server dependencies.

## 1. What we want Bouldy to become

Bouldy should first be a useful personal climbing journal: easy to log while climbing, clear about progress across visits, and reliable after a gym resets its walls. From that foundation, we want a bouldering community where climbers can choose to be discovered, share route photos and beta, compare progress fairly and compete with friends.

The 12 proposals support four goals:

- **A better journal:** smaller completed cards, private feedback, route history and unfinished projects that continue across visits.
- **Identity and climbing context:** own profile, nickname, optional public profiles, user search and gym-specific grades.
- **Meaningful comparison:** explainable points, gym rankings, defensible global rankings and friend leagues.
- **Useful beta:** persistent route photos and videos with attribution and suitable visibility controls.

Keep the existing mobile experience on desktop too. Profiles were originally planned for the account/header area with no fourth main tab. On 3 October 2026 the product direction changed: the bottom navigation is now Home, Explore, Sessions, Gyms and You, and `/profile` is the You tab. Explore and the planned profile screens are under-construction placeholders until their BE contracts exist. Feeds, follows, reactions and operator dashboards remain broader product directions, outside these 12 work items.

## 2. Readiness, difficulty and current baseline

**No new BE changes required** means FE can deliver the stated task using existing APIs, without waiting for a new endpoint, schema, migration or backend deployment. These tasks still use the current backend service and need FE implementation and verification. **Waiting for BE** means the stated delivery needs a new or changed server contract. **Decision-dependent** means a product rule must be settled before releasing that delivery.

The first versions of P1, P2, P7 and P11 are separated from their later enhancements: **A** identifies the current-API task and **B** identifies the BE-dependent task. P3a/P3b/P3c retain the original report's gym/global/group scopes.

Difficulty is relative FE complexity, not a time estimate: **Low** = a contained screen/state/form using existing data; **Medium** = multiple states, aggregation or a new API integration; **High** = several coordinated flows or complex upload/recovery behaviour. Each item below explains the rating. The BE team has its own ratings.

**Recommended sequence:** complete the independent journal tasks first, then integrate identity/privacy and grades, followed by scoring/gym rankings and broader community. A/B task suffixes below identify first delivery versus enhancement, not product phases. Photos can run in parallel once their storage/permission decisions are settled.

Current code contains authentication, Home summaries, Gyms, Sessions, route logging/correction and session completion. It has no dedicated editable profile, user discovery, ranking, group or persistent media flow. Important constraints:

- Account details come from `GET /auth/me`; its email field is owner-only data.
- Attempt `notes` already support private text. The current UI does not edit them.
- An attempt is a route's count/result within one session, not an event for each physical try.
- The session UI infers completion from positive duration; the API has no separate completion state or exact send time.
- History currently requires reading owned sessions and their attempts. Duplicate records and failed requests must not become misleading totals.
- Gym routes are available through `GET /gyms/{gym_id}/routes`. This endpoint is present, not a current blocker.

Source/schema checks establish feasibility, not a fresh authenticated production test. No private accounts, uploads or database writes were used for this brief.

## 3. Work FE can start now: no new BE changes required

These five tasks now have local implementations using existing APIs. Their bounded delivery scopes and acceptance checks remain below. Later enhancements are listed separately in section 5 and are not prerequisites for this scope.

| Order | Task | Deliver now | FE difficulty | Existing API / FE dependency |
| --- | --- | --- | --- | --- |
| 1 | P12 | Compact completed-route cards with expand/correction access | Low | Current route and attempt data; no new API |
| 2 | P7-A | Optional private post-climb notes, saved and editable | Low | Existing attempt `notes` and `PATCH /attempts/{id}` |
| 3 | P1-A | Read-only own profile and personal summary | Low | `GET /auth/me`, owned sessions/attempts and gyms |
| 4 | P11-A | Personal route history assembled across sessions | Medium | Existing owned session/attempt reads and route detail |
| 5 | P2-A | Continue-project suggestions with previous/today counts kept separate | Medium | Reuse P11-A aggregation; existing gym routes and attempt create/update |

P2-A has an **FE dependency on P11-A's history aggregation**, not a dependency on a new BE endpoint. P12, P7-A and P1-A can start independently. The backend integrity/scaling packages remain worthwhile parallel work; they do not need to land before FE starts these bounded tasks.

### P12: Compact completed cards

**Goal:** make an active session easier to scan after routes are completed. **Difficulty:** Low because this is a contained display-state change. **BE changes required:** none.

- In session detail, collapse a route after a confirmed send/flash. Retain hold colour, grade, result/flash marker, attempt count and an expand control. Put secondary metadata, notes and applicable correction controls inside the expanded view.
- Keep cards in a stable order. Failed saves retain the active context; correction back to project restores the active state. Preserve current restrictions on which sessions permit correction.
- **Done when:** completed cards are visibly smaller; expansion and applicable correction remain reachable; keyboard/focus, `aria-expanded`, touch targets and reduced motion work at 320–430px and within the desktop phone layout.
- **Boundary:** this does not change scoring, attempt persistence or permissions.

### P7-A: Private post-climb notes

**Goal:** remember how a route felt without interrupting logging. **Difficulty:** Low because the existing attempt model and update contract already have private text notes. **BE changes required:** none.

- After a confirmed send/flash, offer a skippable private note using `PATCH /attempts/{id}` with `notes`. Allow later editing and preserve existing text. Save notes separately from count/result changes.
- A failed note save must not undo completion. Skipping must not clear an existing note. Keep session-wide notes separate from a route's note.
- **Done when:** saved text survives reload, remains owner-only and can be edited without adding attempts or changing the outcome; skipping/error/retry states work.
- **Boundary:** felt-grade fields, rating scales, tags and public reviews are P7-B. Ordinary private text does not need a new feedback endpoint.

### P1-A: Read-only own profile

**Goal:** give a climber a place to review their own identity and climbing summary. **Difficulty:** Low because account and owned activity data already exist. **BE changes required:** none.

- Add an owner-only profile reachable from the account/header area, showing username, email, current grade when set, session totals and visited gyms.
- Reuse current owned data and summary logic. If a request fails, show the unavailable/partial state rather than inventing a zero total. Keep email in this owner view.
- **Done when:** displayed details and summaries use real data, empty/partial/error states are clear, and a signed-out user cannot open the owner screen.
- **Boundary:** no editable nickname, bio, avatar or public profile in this task. Profile editing is P1-B; other-user profiles are P9. Keep the existing three main tabs.

### P11-A: Personal route history using existing reads

**Goal:** understand progress on the same route over different visits. **Difficulty:** Medium because several existing requests must be aggregated safely. **BE changes required:** none for this session-level first delivery.

- Add an owner-only route history view showing session date, gym, attempts, result and private note, with links to source sessions. Group by stable route ID and preserve retired route detail.
- Fetch owned sessions and their attempts with bounded concurrency. Share this aggregation with P2-A; keep loading, partial-data and retry states explicit.
- Do not blindly sum ambiguous duplicate session-route records. Show available records and mark affected totals as unavailable/ambiguous; flag the integrity issue for BE resolution rather than repairing server data in FE.
- Label this **session-level history**. Current records cannot reconstruct every physical try, exact first-send timing or the chronological order of multiple same-day sessions.
- **Done when:** complete, unambiguous totals reconcile with source logs; retired routes remain readable; reset IDs stay separate; missing requests are not treated as empty sessions.
- **Boundary:** no new aggregate API, materialized progress or exact per-try timeline. P11-B supplies the later scalable endpoint; authoritative data repair remains BE work.

### P2-A: Continue unfinished projects using existing reads

**Goal:** return to an active project without losing or inflating earlier attempts. **Difficulty:** Medium because prior history and today's log need distinct meanings. **BE changes required:** none for suggestions and session-local logging.

- Reuse P11-A's aggregation to show active routes at the selected gym that the owner has previously tried and has no recorded send for in complete loaded history. Do not claim a route was never sent when history is incomplete.
- Display **previous attempts** separately from **today's attempts**. Four old tries plus two new tries stays four in the old session, two in the new session and six in the derived history.
- Create the current record on the first real try. Do not create zero-count placeholders, copy counts or move older records into the new session.
- On a carried project, a first try today that succeeds is a **send**, not a lifetime flash. FE can create that session's record with `num_attempts: 1` and `result: "send"` using the existing create contract; adapt the current action/UI to allow this path.
- Exclude retired routes from new projects. A reset's new route ID is a new route even if its name/colour matches. Previously sent routes are repeats, not unfinished projects. Suppress Flash when previous tries are known; avoid claiming lifetime eligibility when history is unavailable.
- **Done when:** prior sessions are unchanged; first-try-today sends are supported without false flash labels; corrections refresh derived counts; failed/incomplete history is explained.
- **Boundary:** these are owner-facing suggestions and FE safeguards, not server-enforced lifetime eligibility or competitive scoring. P2-B/F2 provide that later authority.

## 4. Optional work without BE changes: input or prototype required

These are separate from the five ready implementation tasks above.

### P10-A: Verified gym-grade suggestions

**Goal:** make grade entry easier using a gym's known labels. **Difficulty:** Low. **BE changes required:** none for labels saved into the existing `route.grade` string.

- This can start once the team supplies verified labels keyed by gym ID that fit current storage limits. No gym catalogs were supplied by the audit, so the actual gym data is an input dependency.
- Offer those labels with a free-text fallback for unknown gyms. Keep physical hold colour separate from grade/circuit colour.
- **Done when:** supplied labels are shown correctly, selected values persist through existing route writes and unknown/legacy labels remain usable.
- **Boundary:** local suggestions are not a centrally managed catalog or approved scoring map. The inspected grade column is 10 characters; longer labels and any catalog/mapping require P10-B.

**Design prototypes:** ranking layouts, media selection/preview and group flows can be explored without BE, but they do not deliver persistent/live functionality. Keep these in a clearly labelled prototype backlog. Do not list preview-only photos/videos, browser-only nicknames or invented scores as completed independent features.

## 5. Work waiting for BE: separate enhancement backlog

These tasks are not included in the current no-new-BE implementation scope. FE can refine designs beforehand, but the stated full delivery requires the listed contracts.

| Task | Delivery waiting for BE | FE difficulty | Required BE capability |
| --- | --- | --- | --- |
| P1-B | Editable display name/profile | Medium | Owner profile fields, update and validation |
| P2-B | Authoritative/scalable continuing-project progress | Medium | Progress aggregate and server-enforced lifetime eligibility |
| P3a | Live gym leaderboard | Medium | Privacy-safe ranking query, scoring and agreed rules |
| P3b | Live global leaderboard | Medium | Cross-gym rankings and approved grade mappings |
| P3c | Persistent friend groups and leagues | High | Membership, invitations, roles, seasons and standings |
| P4 | Persistent route photos | Medium | Authorized direct upload, durable assets and verified lifecycle |
| P5 | Persistent beta links/videos | High uploads | Persisted links or video upload/processing/playback service |
| P6 | Authoritative points and explanations | Medium | Score breakdown, rules, timing, corrections and mappings |
| P7-B | Structured feedback or shared reviews | Medium | Owned typed feedback; visibility/moderation for sharing |
| P8 | Live user search | Medium | Paginated discoverable-user search |
| P9 | Other-user profiles | Medium | Allowlisted public profile/statistics and privacy handling |
| P10-B | Shared gym grades and mappings | Medium | Gym system label, canonical catalog, validation and mapping policy |
| P11-B | Scalable route history integration | Medium | Paginated owner history/summary endpoint |

### P1-B: Editable nickname/profile

**Goal:** let a climber save a separate display name while preserving their unique handle. **Difficulty:** Medium for save/validation/error states.

- Integrate the authenticated owner update contract after BE supplies it. Use the saved name in greetings; keep email/password changes in separate account flows.
- Optional bio/avatar are later additions; avatar also needs P4.
- **Done when:** edits survive a fresh login and show saving/validation/retry states; owner-only fields stay private.
- **Handoff:** BE P1. P1-A's read-only screen remains useful before this contract exists.

### P2-B: Authoritative progress and lifetime eligibility

**Goal:** replace per-session fetching with reliable server-derived project progress. **Difficulty:** Medium for response integration and eligibility/error states.

- Consume owner-scoped previous/current counts, first-send state, last tried information and flash eligibility from the new BE progress contract.
- Preserve P2-A's separate session counts and existing records. Adapt logging to the safe mutation contract supplied by BE F2.
- **Done when:** corrections/retries and prior-session eligibility agree with server responses; cross-session attempts cannot become a new lifetime flash or duplicated award.
- **Handoff:** BE P2/F2/F5. This contract is an enhancement, not a prerequisite for P2-A suggestions.

### P3a: Gym leaderboard

**Goal:** compare opted-in climbing results at one gym with understandable rules. **Difficulty:** Medium for filters, pagination, rank states and score explanations. **Readiness:** BE- and decision-dependent.

- Build a gym/period ranking view consuming aggregate rows, not everybody's private session logs. Show rank, permitted identity, points, scoring rule/version and self-report/verification label.
- Include loading, empty, error and pagination states, plus the owner's rank when outside the visible page. Link to P9 only when that profile is permitted.
- **Done when:** rows and own rank match the server for the selected scope; privacy/ties/pagination behave consistently; the scoring explanation is visible.
- **Handoff:** BE P3a/P6 supply rankings, rules and participation behaviour. Product must select periods, timezone, ties and eligibility first.

### P3b: Global leaderboard

**Goal:** compare climbing across gyms without claiming incomparable grades are equivalent. **Difficulty:** Medium because the UI can reuse P3a, but must explain mapping and exclusions. **Readiness:** BE- and decision-dependent; later phase.

- Reuse the ranking experience after BE supports cross-gym scope and approved difficulty mappings. Clearly show unranked/unmapped activity without excluding it from the personal journal.
- An unweighted sends board is a possible separate experiment after an aggregate API exists. Label its metric honestly; it is not a fair difficulty-adjusted global board.
- **Done when:** displayed rules match the selected ranking; grades/hold colours are not normalized in FE; unknown mappings do not produce invented points.
- **Handoff:** BE P3b/P10 and product approval of the comparison policy.

### P3c: Friend groups and leagues

**Goal:** invite friends into a private group and compare individual results during a league. **Difficulty:** High because creation, invitation, joining, membership and standings are separate interacting flows. **Readiness:** BE- and decision-dependent.

- Implement create group, share invite link, login/accept invite, join confirmation, member list and individual league standings. Explain expired, revoked, already-used/joined and access-denied states using server outcomes.
- Display the league's dates, timezone, rules and eligibility. Reflect roles and permissions from BE; hidden controls do not enforce access.
- **Done when:** links work across devices/login; retrying a join cannot duplicate membership; non-members cannot see private standings; league rules are understandable.
- **Handoff:** BE P3c. Late joining, leaving and live-rule changes remain product decisions. Team-versus-team scoring and invitation email delivery are outside the suggested first release.

### P4: Route photos

**Goal:** recognize routes visually and share useful route context. **Difficulty:** Medium for picker, progress, retry and gallery states. **Readiness:** BE-, storage- and decision-dependent.

- Suggested first scope is attributed route photos with a selected cover; private session photos are a separate scope decision.
- Implement camera/gallery selection, preview, authorized direct upload, progress, cancel/retry, processing/ready/error states and permitted delete/report controls. Confirm supported phone formats and rotation with the media pipeline.
- Do not send large files through the normal route-log Server Action. An upload failure must not prevent saving an otherwise valid climb.
- **Done when:** a confirmed photo remains after reload/another-device login; unfinished uploads are not presented as ready; deletion and unsupported-format errors are clear.
- **Handoff:** BE P4 provides upload intent, verified status, list and delete/report behaviour. Local preview alone is not delivery.

### P5: Beta videos

**Goal:** learn from other climbers' route solutions, revealed on demand to avoid spoilers. **Difficulty:** High for resumable transfer, processing and playback recovery. **Readiness:** BE-, service- and decision-dependent.

- Product may choose persisted external links as the smaller first release. Links still require BE persistence, attribution, visibility and allowed-embed rules.
- For uploads, distinguish uploading from processing and ready playback. Support interrupted-upload recovery, retry/cancel, thumbnails, creator attribution and permitted delete/report controls. Multiple videos should not overwrite each other.
- **Done when:** approved beta persists; processing failure is visible; spoiler reveal is intentional; unavailable/deleted videos cannot appear playable.
- **Handoff:** BE P5, usually reusing P4's lifecycle. Duration, format, retention, quota, moderation and cost limits need agreement.

### P6: Points and difficulty

**Goal:** make scoring understandable while encouraging real progress. **Difficulty:** Medium for explanations, state changes and consistent server-derived totals. **Readiness:** BE- and decision-dependent.

- Show authoritative server scores and their breakdown; do not calculate a competing live score in FE. Explain attempts to first send, grade bonus, repeats, corrections and unranked routes.
- The report's **draft, not approved**, is `max(0, 25 + difficulty_bonus - 0.1 × (attempts_to_first_send - 1))`; unsent routes score zero. Attempts include the successful try and span sessions. Bonus values and ranking policy remain open.
- The current **Log attempt → Sent** flow increments only on Log attempt. Make clear that the successful try must already be included; marking Sent must not add an extra try silently.
- **Done when:** route and ranking totals match BE; retries/corrections refresh them; pending/unavailable/legacy scores are not presented as confirmed zero; subjective felt grade does not set points.
- **Handoff:** BE P6/F2/F3/P10. Any prototype formula must be labelled and separate from real rankings.

### P7-B: Structured or shared feedback

**Goal:** add felt grade, ratings/tags or deliberate public reviews beyond private text. **Difficulty:** Medium for structured forms; shared-review scope also needs moderation/access design.

- Integrate the agreed fields and ownership model only after BE persistence exists. Subjective felt grade belongs to the climber's experience, not the shared gym route.
- Preserve skippable independent completion/feedback saves. Explain private vs shared visibility clearly.
- **Done when:** fields persist, repeated visits follow the agreed review-frequency policy and feedback cannot directly set leaderboard points.
- **Handoff:** BE P7 and product visibility/moderation policy. P7-A does not wait for this work.

### P8: Find a user

**Goal:** find discoverable climbers by handle/display name. **Difficulty:** Medium for debouncing, stale-response handling and result states. **Readiness:** BE- and privacy-decision-dependent.

- Use the new paginated search contract. Debounce requests, cancel/ignore stale responses and show distinct loading, no-match and failure states. Show stable identity/handle so duplicate display names remain distinguishable.
- Do not search via email or emulate discovery by fetching private user records. A follow system is not required for search.
- **Done when:** older responses cannot replace newer results; hidden accounts are absent; permitted results link to P9.
- **Handoff:** BE P8/P9 with visibility behaviour and query constraints.

### P9: View another profile

**Goal:** see climbing identity and permitted statistics without exposing a private journal. **Difficulty:** Medium for owner/community views and visibility/error states. **Readiness:** BE- and privacy-decision-dependent.

- Consume a dedicated public response showing agreed handle/display name, optional avatar and approved summary/rank. An activity feed is not needed for the first release.
- Keep owner settings and another user's profile separate. Use a neutral unavailable state for inaccessible profiles; do not pass owner-only email/notes into a public component.
- **Done when:** statistics reconcile for the same scope; blocked/private/unavailable responses render correctly; raw community responses contain no private data.
- **Handoff:** BE P9; product must decide discovery, rank participation and activity sharing separately.

### P10-B: Shared gym grading system and catalog

**Goal:** use centrally maintained gym-native grades and later reliable comparison inputs. **Difficulty:** Medium for catalog/form integration.

- Preserve the master's initial free-text gym grading-system direction; consume that field once supported. Later integrate canonical grade IDs, labels and order without losing legacy/unmapped display values.
- Keep hold colour separate from difficulty/circuit colour. Align FE/API/database input limits before accepting longer labels.
- **Done when:** gym labels/order are correct, old records and unknown grades remain usable, and FE never parses a label/colour into ranking points.
- **Handoff:** BE P10 for the system label, catalog, limits and approved mappings. P10-A suggestions are a smaller optional task, not equivalent to this delivery.

### P11-B: Scalable route-history endpoint

**Goal:** replace many session requests with paginated owner history and a consistent summary. **Difficulty:** Medium for paging and response/legacy-state integration.

- Adopt the new owner route-history contract and share its definitions with P2-B/P6. Retain session links, private notes, retired route detail and uncertainty labels.
- **Done when:** pagination/summary reconcile with source logs, long histories load predictably and private/reset-route boundaries remain intact.
- **Handoff:** BE P11/F2/F5. P11-A's existing-API history can be delivered independently.

## 6. Delivery order and FE/BE handoffs

**Current FE delivery:** P12 → P7-A → P1-A → shared P11-A history aggregation → P2-A. The first three can run independently; the final two share FE code. P10-A is optional once verified gym labels are supplied.

**After BE contracts land:**

| Stage | Dependent FE work | Required handoff |
| --- | --- | --- |
| Identity/privacy/grades | P1-B, P9, P8, P10-B | Owner editing, public responses, discovery/visibility and grade contracts |
| Progress/history upgrades | P2-B, P11-B and compatible lifecycle integration | Owner aggregates, safe mutation, lifecycle and legacy behaviour |
| Scoring/gym ranking | P6 and P3a | Approved rules and authoritative scoring/timing/ranking queries |
| Broader community | P3b, P3c and P7-B | Reviewed mappings, membership/season or feedback/moderation policy |
| Media | P4 then P5 | Selected storage/service, limits, permissions and verified persistence/status |

When BE changes permissions, attempt mutation or session lifecycle, adapt existing Server Actions, types and error states to that contract. Preserve the HTTP-only token/server-side API flow. Replace duration-based completion only when a compatible lifecycle contract exists. UI visibility is never an authorization control.

Before integrating a dependent feature, obtain documented fields/enums, ownership/visibility, validation/errors, pagination, migration compatibility and representative responses. Suggested future API names in the BE brief are proposals, not endpoints FE should call today.

## 7. Decisions and acceptance checks

**For the current five tasks:** use the bounded scopes in section 3. Existing request failures, duplicate records and uncertain chronology must be handled honestly. This does not require selecting leaderboard rules, a media vendor or a public-profile policy.

**For optional P10-A:** obtain verified gym labels that fit current limits.

**For later dependent releases:** settle display-name/handle rules, discovery/rank/activity visibility, scoring bonuses/periods/timezone/ties/repeats/corrections, league eligibility, trusted grade maintainers, structured/shared feedback and media scope/limits/provider.

**Verify the current FE delivery:**

- P12: confirmed vs failed save, expansion, correction to project, focus, narrow layout and reduced motion.
- P7-A: reload, skipped/existing notes, error/retry and no unintended count/result changes.
- P1-A: real owned data, empty/partial/error states and email limited to the owner screen.
- P11-A/P2-A: four old plus two new tries; previously sent, retired and reset routes; first try today recorded as send; incomplete history, duplicate records, corrections and long histories.
- Regression: login/signup, route creation/editing, attempt correction and session completion. Use lint, TypeScript/build checks and relevant phone-width/integration checks when implementation begins.

**Verify later integrations:** hidden/duplicate-name users and stale search responses; pagination/own rank; score consistency across corrections/sessions; interrupted media processing; denied deletion; expired/revoked invites and idempotent joining. These checks belong to the dependent releases, not the acceptance gate for the current five tasks.

## 8. Evidence and limits

- Original report: **Bouldy: product improvements feasibility report**, 1 October 2026; all P1–P12 proposals are retained here, including P3a/P3b/P3c.
- Frontend inspected at commit `507a313b2e2e338e87273c138302b8bcb54d288c`: [API client](https://github.com/AmeerulH/bouldy/blob/507a313b2e2e338e87273c138302b8bcb54d288c/lib/api.ts), [actions](https://github.com/AmeerulH/bouldy/blob/507a313b2e2e338e87273c138302b8bcb54d288c/lib/actions.ts).
- [Live OpenAPI](https://bouldy-api.onrender.com/openapi.json) fetched 3 October 2026: existing notes/owned session APIs are present; profile update, discovery, ranking, group and media contracts are absent.
- Selected backend main-branch source checked 3 October 2026 confirmed the report's relevant attempt, lifecycle, grade-length and write-permission gaps; see the BE brief's evidence links.
- Deployed BE commit, actual database/migrations, infrastructure account settings and authenticated live flows were not established. Backend tests were not run for this audit. Reverify these before releasing dependent functionality.
