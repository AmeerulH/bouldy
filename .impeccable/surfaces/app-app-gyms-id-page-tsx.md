---
version: 1
slug: "app-app-gyms-id-page-tsx"
primary_target: "app/(app)/gyms/[id]/page.tsx"
related_targets: []
---

# Gym route editing refinement

Mode: Operate. Preserve the Climber's Logbook identity, 430px mobile canvas, hold artwork, condensed grades, chalk surfaces and red actions.

Primary path: scan a route's grade and identity, then activate Edit in the same row. Keep hold, grade, colour and name together; wall, styles and setter support them. Use a compact disclosure rather than a separate footer. The form expands underneath only when needed. Native details keeps touch, keyboard and expanded-state semantics without client state.

Scope: app/(app)/gyms/[id]/page.tsx only for UI. Shared RouteForm, existing actions, validation, save/error redirects and all backend contracts remain intact. Long names wrap, metadata can increase height, controls never shrink into tiny targets. Use the same single-column layout at desktop widths.

Evidence: source assessment identified stacked footer spacing; layout detector returned no findings. Lint and TypeScript passed. Chrome sample-data checks at 320, 390 and 1440 passed open/close by click, Enter and Space, initial edit values, long-name wrapping and no horizontal overflow. No page errors. Captures are .impeccable/review/{narrow,mobile,desktop}-gym-route-{cards,editor}.png. Metadata-rich sample cards are 152px at390 and 187px at320; ordinary cards are shorter. Data writes were not exercised because save code is unchanged; no real route data was changed.

DESIGN.md and its sidecar are preserved. All changes local, uncommitted and unpushed. No context drift repair authorized.
