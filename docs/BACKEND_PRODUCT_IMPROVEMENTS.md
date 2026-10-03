# Bouldy: backend product improvement work brief

**Audience:** backend team. **Prepared:** 3 October 2026. **Status:** implementation backlog and recommendations; proposed endpoints and rules are not delivered or approved specifications.

Based on **Bouldy: product improvements feasibility report** (1 October 2026), reconciled with the frontend checkout, live OpenAPI and selected backend source on 3 October 2026. [MASTER_SPEC.md](../MASTER_SPEC.md) remains the product authority. Read [BACKEND_SPEC.md](./BACKEND_SPEC.md) for the current published contract and the companion [frontend work brief](./FRONTEND_PRODUCT_IMPROVEMENTS.md) for UI responsibilities.

**Repository boundary:** this checkout is `AmeerulH/bouldy`, the Next.js frontend. Backend code and migrations belong in the separate `fawzazrn/bouldy` FastAPI repository, not here.

## 1. What we want Bouldy to become

The backend must preserve a trustworthy private climbing journal while enabling an optional bouldering community. Climbers should be able to resume projects, understand route history, express their identity, use their gym's grades, share beta and participate in fair gym/friend rankings.

The wanted outcomes are:

- **Reliable progress:** counts reconcile across visits and corrections; wall resets do not erase history.
- **Identity with deliberate sharing:** editable display name, searchable opted-in profiles and privacy-safe statistics.
- **Fair comparison:** authoritative scoring, trusted grade inputs and clear season/league rules.
- **Persistent beta:** attributed photos/videos with appropriate upload, visibility and deletion behaviour.

All 12 proposals are architecturally feasible using the existing stack. Feasible does not mean API-supported today: social, scoring and media require new server capabilities. Feeds, follows and operator dashboards are wider north-star directions, outside this 12-item backlog except permissions needed to protect existing data.

## 2. Readiness, difficulty and current baseline

**Ready to start** means BE can implement or investigate the identified package now. **Decision-dependent** means an unresolved product/policy choice gates final behaviour. **No new BE work** means existing contracts support the FE-only first delivery. **Later** means feasible after its listed foundations; it is not rejected.

Difficulty is relative BE complexity, not duration: **Low** = a contained field/validation/contract addition; **Medium** = coordinated migration, CRUD, ownership/query and API work; **High** = concurrency/data repair, scoring policy, membership or media service lifecycle. **None** means no new backend implementation for that delivery. Ratings differ from FE because the work differs.

The published API covers User, Gym, Route, Session and Attempt. A session belongs to one owner/gym; an attempt summarizes a route within a session. Current contracts provide:

- Authentication/current user, public gym/route reads, owner-scoped session/attempt operations and private notes.
- Active/retired routes, free-text grades and attempt results `project`, `send`, `flash`, `zone`.
- No registered profile-update, discovery, public-profile, progress aggregate, ranking, group, grade-catalog or media endpoint.
- No explicit session completion status or exact send timestamp. FE uses duration as a completion convention.

Live OpenAPI and selected default-branch source were checked on 3 October 2026. The deployed source commit and actual database/migration state are unknown. Findings below are contract/source findings; no unauthenticated write, private-account test, production migration or destructive reproduction was performed.

## 3. Foundations that enable the product work

These packages address gaps already affecting journal integrity and become release prerequisites for trustworthy competitive features. They need not delay unrelated FE compact-card or private-note development.

### F1: Gym and route write permissions

**Priority:** A, start now; product permission model required. **Difficulty:** Medium because authorization needs ownership/role rules, not only a login dependency. **Enables:** P3/P6/P10 and protected media/metadata.

- OpenAPI declares no auth for gym/route writes; the inspected routers also have no current-user dependency. Add bearer authentication and agreed creator/manager/moderator permissions to create/edit/retire/delete operations.
- Define treatment of existing rows with no recorded creator/manager. Preserve the ability to add missing gyms/routes through an agreed community-submission or authorized path; do not silently eliminate the current journey.
- **Done when:** direct unauthorized API writes fail; authorized operations succeed; cross-gym roles cannot edit unrelated data; FE receives clear permission errors/capabilities. Public reads may remain public if intentional.

### F2: Attempt integrity, retry safety and flash validation

**Priority:** A, start now. **Difficulty:** High because existing duplicates, simultaneous clients and corrections interact. **Enables:** P2/P11 and dependable P6/P3 rankings.

- The inspected create path inserts another row; it does not enforce one session-route record in application code. Inspect actual constraints/migrations and audit duplicates before adding a uniqueness policy. Do not blindly sum apparent duplicates: they may represent retries or conflicting corrections.
- Preserve one aggregate per session-route, with a documented repair process and constraint/transaction strategy. Make retried creates/increments safe; use atomic mutation or versioned optimistic concurrency so two devices cannot overwrite each other's increment.
- Validate the merged stored count/result on updates as well as creates. Creation checks flash equals one try; the inspected update path lacks equivalent merged-state validation. Lifetime flash must also consider earlier sessions for the same route.
- **Done when:** duplicate/retried requests cannot inflate records; two distinct tries are retained; stale corrections are handled deliberately; direct PATCH cannot create invalid flash state; earlier failed tries prevent a later lifetime flash. Notes-only updates preserve count/result.

### F3: Session lifecycle and reliable send timing

**Priority:** B, before competitive scoring. **Difficulty:** Medium for additive lifecycle/timestamps and legacy compatibility. **Enables:** P2/P6/P3 periods and eligibility.

- Add explicit lifecycle/start/end data and reliable server-owned first-send timing appropriate to the approved scoring model. Define timezone and completion/correction rules separately from duration.
- Keep current session consumers compatible during rollout. Existing records cannot prove exact send times or physical-try events; record uncertainty and adopt an agreed legacy eligibility/cutoff policy rather than invented timestamps.
- **Done when:** new activity has usable authoritative timing; duration is not the sole completion signal; FE can migrate safely; legacy records stay readable without being misrepresented as precisely timed.

### F4: Protect route lifecycle and historical references

**Priority:** A, start now. **Difficulty:** Medium for guards, migrations where needed and regression coverage. **Enables:** P2/P11 and stable ranking scope.

- Enforce retirement as the normal reset operation. Protect referenced routes from hard deletion; retain detail needed by old sessions. A database foreign-key rejection alone is not a complete user-facing policy.
- Prevent moving a logged route to another gym unless an explicit historical migration policy is designed. A reset/new route receives a new ID even if its name/colour repeats.
- **Done when:** retired routes resolve in history, cannot be treated as active projects, and cannot invalidate session-gym relationships through edits/deletion. Retain existing historic Zone outcomes; new competition classification remains the separate gap described in BACKEND_SPEC.

### F5: Scoped aggregates and paginated reads

**Priority:** B, with P2/P11; before larger ranking traffic. **Difficulty:** Medium for owner-filtered joins, pagination and query tuning. **Enables:** personal summaries/progress/history and scalable P3 queries.

- Add owner-scoped history/progress/summary queries rather than one network request per past session. Introduce compatible pagination for growing collections and stable filtering/sorting.
- Index measured joins/query plans. Keep community ranking aggregates separate from private raw session/attempt data. Materialize summaries only when justified and provide a rebuild/reconciliation path.
- **Done when:** long histories can be paged; summary and source totals reconcile; ownership filters are enforced in queries; FE can distinguish unavailable data from an empty result.

## 4. Backend task overview

IDs retain the original proposals. P3a/P3b/P3c are separate scopes. Phases: A journal/reliability, B identity/privacy/grades, C scoring/gym rankings, D community expansion. Media may run in parallel after policy/service selection.

| ID | Want / goal | Current feasibility and required BE work | BE difficulty | Sequence / dependencies |
| --- | --- | --- | --- | --- |
| P1 | Own profile and nickname | Read-only uses `/auth/me`; editing needs profile fields/update | None read-only; Medium editing | B; privacy with P9 |
| P2 | Continue unfinished routes | FE can derive history; BE adds progress and lifetime eligibility | Medium, plus F2 | A/B; F2/F4/F5 |
| P3a | Gym leaderboard | New privacy-safe aggregate ranking service | High | C; P6, P9, P10, F1–F3 |
| P3b | Global leaderboard | Extend rankings after defensible grade mapping | High | D; P3a/P6/P10 and product policy |
| P3c | Friend groups and leagues | New membership, invitation and season capabilities | High | D; F1/P6 and eligibility policy |
| P4 | Route photos | New media metadata/direct-upload lifecycle and storage | High | Parallel media; F1 and policy/provider |
| P5 | Beta videos | Persisted links or full video service lifecycle | Medium links; High uploads | After media foundation and policy/provider |
| P6 | Points and difficulty | New authoritative scoring and auditable corrections | High | C; F1–F4/P10 and approved rules |
| P7 | Post-climb feedback | Private notes exist; structured/shared feedback needs model | None private text; Medium structured private | A for notes; later for rich/shared feedback |
| P8 | Find a user | New paginated visibility-filtered search | Medium | B; P1/P9 and discovery policy |
| P9 | View another profile | New allowlisted community response/privacy handling | Medium | B; profile/stat visibility agreement |
| P10 | Gym-specific grades | System label, managed catalog and reviewed point mappings | Low system label; Medium catalog; High mappings | B; F1, before weighted P6/P3 |
| P11 | Route history across visits | FE can assemble it; BE adds paginated owner history/summary | Medium | A/B; F2/F4/F5 |
| P12 | Compact completed cards | Existing attempt fields are sufficient | None | A; FE only |

Shared/public feedback in P7 adds moderation/access work beyond the Medium private-structured version. Define that scope before assigning its final estimate.

## 5. Actionable feature briefs

### P1: Own profile and nickname

**Goal:** editable climbing identity without confusing a display name with a unique handle. **Difficulty:** Medium for migration, validation and owner-only writes. **Readiness:** ready to start; editable fields need agreement.

- Existing `/auth/me` supports FE's read-only release. Add an authenticated owner update contract, suggested `PATCH /users/me`, and a separate non-unique display name. Preserve existing handles and fallback display for old accounts.
- Allowlist editable fields; derive identity from the token. Bio/avatar are optional later additions; avatar uses P4. Do not combine email/password changes into this casual edit operation.
- **Done when:** changes persist across login; another user cannot edit them; duplicate display names are allowed while handle rules remain enforced; owner/public response fields remain separate.
- **FE handoff:** updated owner type, allowed fields, validation/errors and saved response. Coordinate visibility with P9.

### P2: Continue unfinished routes

**Goal:** cumulative project progress with each visit's tries preserved. **Difficulty:** Medium for aggregation/eligibility; F2 supplies the harder write-integrity foundation.

- Suggested `GET /users/me/projects?gym_id=` returns own active, never-sent projects with previous/current counts, last tried information and first-send/flash eligibility. Derive initially; do not add a progress table without a reason.
- A new session receives only new attempts. Four on Monday plus two on Thursday means six total, with the original records unchanged. Prior attempts prevent lifetime flash; prior sends make a repeat, not an unfinished project.
- **Done when:** corrections/deletions reconcile progress; retired/reset routes behave correctly; owner filters hold; zero-count placeholders and copied historical counts are unnecessary.
- **FE handoff:** canonical count meanings, eligibility/uncertainty and error states; use the same definitions as P11/P6.

### P3a: Gym leaderboard

**Goal:** a useful gym-local ranking without exposing raw journals. **Difficulty:** High for eligibility, aggregation, corrections and consistent ranks. **Readiness:** after foundations and approved P6 rules.

- Provide authenticated paginated rankings by gym and agreed period/rules version, including the owner's off-page rank. Return allowlisted identity, score and agreed summary statistics only.
- Keep existing private session/attempt reads owner-scoped. Apply ranking participation/privacy rules in the query. Label self-reported results; do not claim verified performance.
- **Done when:** ties/pages/own rank are consistent; corrections update standings; participation and private fields are respected in raw responses; query plans support representative data volumes.
- **FE handoff:** ranking scope, ordering/ties, pagination, own-rank response, rules explanation and participation states.

### P3b: Global leaderboard

**Goal:** defensible comparison across gyms. **Difficulty:** High mainly because grade equivalence and mapping governance are unresolved. **Readiness:** later; product- and P10-dependent.

- Extend the same scoring/ranking engine to cross-gym scope only after approved mappings exist. Preserve mapping/rules versions used for awarded points.
- Unmapped routes remain loggable but unranked for weighted scoring. An unweighted unique-sends board is a separately labelled option, not an implicit fair global difficulty ranking.
- **Done when:** identical labels at different gyms are not assumed equivalent; mapping changes follow an explicit rescoring policy; unmapped/legacy activity is represented honestly.
- **FE handoff:** comparison metric, scope, excluded/unranked reason and rules/version metadata.

### P3c: Friend groups and leagues

**Goal:** persistent private groups, invitations and individual league standings. **Difficulty:** High for roles, token lifecycle, membership and season eligibility. **Readiness:** later; policy and scoring dependencies.

- Add group/membership/role, invitation and league-season responsibilities. A league specifies scope, dates, timezone, rules version and membership eligibility. Enforce access on every request.
- Suggested first invite flow is a shareable expiring link accepted after login, with protected token storage, revocation and idempotent joining. Email delivery is optional. Freeze season rules after start unless an explicit alternative is approved.
- **Done when:** expiry/revocation/retries work; unauthorized accounts cannot read a private league; late join/leave behaviour matches an agreed policy; rule changes cannot silently alter a live competition.
- **FE handoff:** creation/read/member/invite/join/standings contracts, roles and failure states. Team-versus-team scoring is separate.

### P4: Route photos

**Goal:** durable, attributed route images. **Difficulty:** High for storage integration, validation, permissions and cleanup. **Readiness:** provider/scope/limit decisions required; independent of ranking delivery.

- Suggested first scope is multiple route photos with uploader attribution and a chosen cover. Authorize direct uploads, persist asset metadata and verify completion before marking an asset ready.
- Supply upload-intent, finalize/status, list, permitted delete/report and cleanup behaviour. Validate formats/size, process phone orientation/formats as needed, remove unnecessary location metadata and clean abandoned uploads.
- Use persistent object storage, not an assumption that the API container's local disk is durable. Direct uploads also avoid routing large bodies through FE functions. No vendor or budget is selected here.
- **Done when:** assets survive deployment/new-device login; unauthorized deletion fails; invalid/abandoned files do not become ready; deleted/hidden assets obey access policy.
- **FE handoff:** supported types/limits, upload destination/expiry, processing states, attribution, cover/list data and permission/error responses.

### P5: Beta videos

**Goal:** persistent route beta with attribution and suitable playback access. **Difficulty:** Medium for stored external links; High for full uploads/processing. **Readiness:** product must choose the first scope.

- Smaller option: store approved external links with route/uploader, visibility and safe provider/embed handling. This still needs BE; a browser-only link is not persistence.
- Upload option: direct/resumable transfer through a video service, processing/transcoding, thumbnails/playback metadata and authenticated, idempotent ready/failed callbacks. Reuse P4's ownership/deletion lifecycle where applicable.
- **Done when:** interrupted processing/upload has defined recovery; duplicate callbacks cannot duplicate assets; hidden/deleted videos cannot bypass access through an unprotected playback URL.
- **FE handoff:** link/upload contract, limits, upload vs processing state, permitted playback and deletion/reporting. Duration/quality/retention/quota/cost/moderation remain decisions.

### P6: Points and difficulty

**Goal:** one authoritative, reproducible score based on real climbing records. **Difficulty:** High for multi-session attempts, timestamps, grade versions, corrections and retry-safe awards. **Readiness:** decision- and foundation-dependent.

- The report's **draft, not approved**, is `points = max(0, 25 + difficulty_bonus - 0.1 × (attempts_to_first_send - 1))`, with unsent routes scoring zero. Use exact decimals or integer tenths, not accumulated floating-point penalties.
- Recommended interpretation: cumulative tries including the successful try up to the first lifetime send of that route incarnation; repeats do not farm another award. Season attribution uses first-send timing while earlier tries still contribute to the penalty. Zone/competition scoring is separate.
- Grade bonuses come from approved gym mappings, never hold colour, loose label parsing or subjective felt grade. Bonus schedule, periods/timezone, ties, volume/best-N, late joins and correction/rescoring policy remain open.
- Add a server-owned scoring service and an auditable/reproducible award record capturing eligible send, attempts-at-send, mapping and rules version. Make eligible awards unique and transactional/retry-safe; corrections reverse/recompute consistently.
- **Done when:** four old plus two new tries scores like six in one session; retries/concurrent devices cannot duplicate awards; repeats, corrections, grade edits, boundaries and unknown legacy timing match approved examples.
- **FE handoff:** authoritative totals/breakdown, eligibility/unranked reasons, rules/version and correction behaviour. FE's current Log attempt increments; Sent does not. Do not silently add another try during scoring.

### P7: Post-climb feedback

**Goal:** private reflection first; richer feedback only with a durable, deliberate model. **Difficulty:** None for ordinary notes; Medium for private structured feedback. Shared reviews need additional moderation scope.

- Existing `PATCH /attempts/{id}` and `notes` support the first release; do not build a parallel notes service. Notes-only updates must preserve count/result and remain owner-scoped.
- For felt grade, enjoyment/difficulty ratings or tags, define the owning experience: recommended session-route/attempt for private journaling. Public reviews may need one user-route identity so repeat visits do not unintentionally multiply ratings.
- **Done when:** notes stay private; richer feedback has explicit ownership/visibility; subjective feedback cannot overwrite shared route grade or directly determine the author's points.
- **FE handoff:** existing notes contract now; agreed structured fields and review frequency/moderation only for later scope.

### P8: Find a user

**Goal:** discover permitted climbers by handle/display name. **Difficulty:** Medium for indexed search, pagination and privacy filters. **Readiness:** after/with P1/P9 policy.

- Suggested `GET /users?query=&cursor=` is authenticated and searches discoverable handles/display names. Use stable IDs, query limits, rate controls and an index suitable for the chosen search method.
- Do not expose a raw users listing or email search by default. Duplicate display names are valid; unique handles/stable IDs distinguish results. Search does not require a follow graph.
- **Done when:** hidden accounts stay absent; only public summary fields return; queries/pagination behave predictably under representative load.
- **FE handoff:** query constraints, pagination and public summary/error contract.

### P9: View another profile

**Goal:** share permitted identity/statistics without revealing a private journal. **Difficulty:** Medium for distinct response types, visibility and aggregate queries. **Readiness:** privacy decisions required.

- Suggested `GET /users/{id}/profile` uses a dedicated allowlisted response. The existing owner `UserResponse` includes email and must not be reused for community reads.
- Separate profile discovery, ranking participation and activity sharing. Existing private accounts/journals stay private unless deliberately opted in. Start with permitted identity and aggregate statistics; activity lists need their own paginated visibility query if added.
- **Done when:** direct ID requests cannot reveal hidden/private fields; same-scope totals reconcile with rankings; denied/unavailable behaviour is consistent across search/profile/rankings.
- **FE handoff:** allowed fields, statistic definitions/scope and neutral unavailable states; owner settings use the separate owner contract.

### P10: Gym-specific grades

**Goal:** preserve gym-native grades and later establish trusted inputs for comparison. **Difficulty:** Low for a system-label field; Medium for a catalog; High for reviewed cross-gym scoring mappings. **Readiness:** phased, with governance decisions before mappings.

- Preserve the master spec's initial free-text `grading_system` direction. Add it through model/migration, schemas, CRUD and gym responses; do not force grade conversion into this first field release.
- Later add gym-owned stable grade IDs, label, order and optional circuit colour/range. Keep hold colour independent. Introduce optional route references while preserving legacy grade strings; unmapped routes stay usable.
- The inspected route column is `String(10)` while input schemas do not match that maximum. Align FE/API/database length limits and migrate safely before supporting longer labels.
- Mapping requires trusted maintainers, reviewed point bands/ranges and versioning. The same label can mean different things at different gyms. Community-submitted/unapproved mappings should not silently become authoritative scoring inputs.
- **Done when:** existing grades survive migration; gym-specific ordering/validation works; long-label policy is consistent; mapping edits do not silently change awarded points.
- **FE handoff:** system label first; later catalog/read/manage contracts, stable references, legacy fallback and approved mapping metadata.

### P11: Route history across visits

**Goal:** efficient personal history that reconciles with source logs. **Difficulty:** Medium for owner-scoped joins, pagination and summaries. **Readiness:** FE can start with existing reads; BE improves scale/reliability.

- Suggested `GET /routes/{id}/my-history?cursor=` returns owned session-route history plus summary. Include session reference/date/gym, count/result and private note; preserve retired route detail.
- Keep this distinct from future community history. Use route IDs, not names/colours, and derive totals under F2's duplicate policy. Do not claim exact per-try chronology or first-send timestamp for old aggregated records.
- **Done when:** paged records/summary reconcile; another user's rows/notes cannot enter results; retired/reset routes and corrections are handled; long-history query plans are measured.
- **FE handoff:** shared definitions with P2/P6, paging/sort semantics, uncertainty and missing-route/error behaviour.

### P12: Compact completed cards

**Goal:** reduce completed-route display size while retaining essential outcome information. **Difficulty:** None for BE. **Readiness:** existing fields suffice.

FE can implement from route metadata and attempt count/result. No new database field, endpoint or stored collapse preference is required. Preserve the existing logging/correction contract; any F2 mutation changes need a separate FE integration handoff.

## 6. Proposed interface packages and handoff agreement

These names come from the feasibility report and are **suggestions, not live endpoints or final wire specifications**. Agree each contract with FE before implementation.

| Package | Suggested interface / responsibility | Related work |
| --- | --- | --- |
| Owner profile | `PATCH /users/me`; allowlisted token-owned edits | P1 |
| Discovery/profile | `GET /users?query=&cursor=`; `GET /users/{id}/profile`; privacy-safe identity/stats | P8/P9 |
| Personal progress/history | `GET /users/me/projects?gym_id=`; `GET /routes/{id}/my-history?cursor=` | P2/P11/F5 |
| Gym grades | `GET /gyms/{id}/grades`; restricted management; initial system label in gym CRUD | P10/F1 |
| Scores/rankings | Authoritative score breakdown; `GET /leaderboards?gym_id=&period=&cursor=` | P6/P3a/P3b |
| Groups/leagues | Create/read, role-checked membership, issue/revoke/accept invites, season standings | P3c |
| Media | Authorized upload intent, verified finalize/status, list, access/deletion/reporting | P4/P5 |
| Structured feedback | Owned typed feedback with explicit private/shared contract | P7 later |
| Safe mutations/lifecycle | Retry-safe attempt mutation, correction handling and compatible session status/timing | F2/F3 |

Deliver each package as ownership/policy → migration and compatibility → request/response schema → authorization/validation → implementation/OpenAPI → FE types/actions/UI → integration checks. Document fields/enums, errors, pagination, legacy behaviour and representative responses. Update living specs when a real contract changes.

## 7. Delivery order and decisions

- **A:** F1/F2/F4 alongside FE P12, P7 private notes and P1 read-only. Begin P2/P11 query design. Gate: personal counts reconcile; history is not copied or erased.
- **B:** P1 editing, P9 privacy, P8 search, P10 system label/catalog and F3/F5. Gate: private accounts remain private; grade inputs and timing have usable definitions.
- **C:** agree scoring examples, deliver P6 then P3a. Gate: concurrency, corrections, boundaries and privacy checks pass; FE reads authoritative results.
- **D:** P3b only after defensible mappings; P3c after membership/season rules; richer P7 after feedback ownership/visibility scope.
- **Parallel media:** P4 after storage/permissions/limits agreement; P5 after a working media lifecycle and a links-vs-uploads choice.

**Product decisions needed for affected features:** who may maintain gyms/routes/grades and treatment of old ownership; display name/handle policy; profile discovery/rank/activity visibility; difficulty bonuses and mapping approvers; ranking periods/timezone, repeats, ties, volume and correction policy; legacy score eligibility; league late joins/leaves/live rules; private vs shared feedback; photo scope and media provider/limits/retention/moderation budget. They need not block independent journal UX work.

## 8. Acceptance and release checks

These are checks to run when implementing each package, not claims that this brief executed them:

- **Authorization:** two-user direct API tests for profile edits, notes/history, hidden discovery, roles/groups and media deletion. Inspect raw responses as well as UI.
- **Integrity:** duplicate creates, retrying the same operation, simultaneous distinct increments, stale corrections, merged flash validation and earlier-session tries. Audit/repair duplicates before constraints.
- **History:** four plus two remains six; retirement/readability, reset IDs, route-gym edits, deletion guards and missing legacy timing.
- **Scoring:** first go, cross-session first send, repeats, correction to project, grade remap, period boundaries, ties/pages/own rank and reproducible score reversal.
- **Grades/privacy:** matching labels at different gyms, long labels, unknown mappings, legacy values and owner-only email/notes absent from every community response.
- **Media/leagues:** invalid formats, interrupted transfers, duplicate callbacks, abandoned assets, inaccessible playback, denied deletion, expired/revoked invites and repeated joins.
- **Migration/performance:** representative long-history/ranking queries, safe legacy fallback, additive rollout, reconciliation/rebuild and a documented rollback for the package.
- **Integrated release:** update OpenAPI/types/specs, deploy BE-compatible contracts before enabling dependent FE, and verify the authenticated user journey. A reachable endpoint or passing build alone is insufficient.

## 9. Evidence and limits

- Original report: **Bouldy: product improvements feasibility report**, 1 October 2026; inspected BE commit `af8072f579969ae0efd8712fea59053c21f57c34` and FE commit `507a313b2e2e338e87273c138302b8bcb54d288c`.
- [Live OpenAPI](https://bouldy-api.onrender.com/openapi.json) fetched 3 October 2026 confirms current fields/auth declarations and absent future endpoint families. [API documentation](https://bouldy-api.onrender.com/docs).
- Selected backend default-branch files fetched 3 October 2026: [router registration](https://github.com/fawzazrn/bouldy/blob/main/app/main.py), [attempt CRUD](https://github.com/fawzazrn/bouldy/blob/main/app/crud/attempt.py), [attempt schemas](https://github.com/fawzazrn/bouldy/blob/main/app/schemas/attempt.py), [route router](https://github.com/fawzazrn/bouldy/blob/main/app/routers/routes.py), [gym router](https://github.com/fawzazrn/bouldy/blob/main/app/routers/gym.py), [route model](https://github.com/fawzazrn/bouldy/blob/main/app/models/route.py), [session model](https://github.com/fawzazrn/bouldy/blob/main/app/models/session.py). Main-branch links may change after this date.
- Frontend checked at the same report commit: [API client](https://github.com/AmeerulH/bouldy/blob/507a313b2e2e338e87273c138302b8bcb54d288c/lib/api.ts), [mutation actions](https://github.com/AmeerulH/bouldy/blob/507a313b2e2e338e87273c138302b8bcb54d288c/lib/actions.ts).
- F4 route-update/delete findings additionally rely on the original report's [pinned route CRUD review](https://github.com/fawzazrn/bouldy/blob/af8072f579969ae0efd8712fea59053c21f57c34/app/crud/route.py); those functions were not freshly fetched during this split.
- No full backend re-audit, tests, production writes, deployed-commit verification, private data extraction or database/storage-account inspection occurred. Verify actual migrations, constraints, runtime flows and service limits before implementation/release.
