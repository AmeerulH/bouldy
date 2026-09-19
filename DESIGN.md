---
name: Bouldy
description: A tactile mobile climbing journal built around the rhythm of real sessions.
colors:
  send-red: "oklch(0.56 0.22 27)"
  send-red-strong: "oklch(0.47 0.21 27)"
  send-red-tint: "oklch(0.94 0.04 27)"
  send-red-tint-ink: "oklch(0.4 0.16 27)"
  chalk-white: "oklch(0.985 0 0)"
  wall-black: "oklch(0.16 0 0)"
  panel-black: "oklch(0.22 0.003 0)"
  muted-ink: "oklch(0.42 0.003 0)"
  faint-ink: "oklch(0.54 0.003 0)"
  hairline: "oklch(0.87 0.003 0)"
  panel-muted: "oklch(0.75 0.003 0)"
  panel-track: "oklch(0.34 0.003 0)"
typography:
  display:
    fontFamily: "Barlow Condensed, Impact, sans-serif"
    fontSize: "48px"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Barlow Condensed, Impact, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Barlow Condensed, Impact, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  control: "12px"
  card: "16px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  page: "24px"
components:
  button-primary:
    backgroundColor: "{colors.send-red}"
    textColor: "{colors.chalk-white}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-dark:
    backgroundColor: "{colors.panel-black}"
    textColor: "{colors.chalk-white}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.wall-black}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "48px"
  card-summary:
    backgroundColor: "{colors.panel-black}"
    textColor: "{colors.chalk-white}"
    rounded: "{rounded.card}"
    padding: "20px"
  badge-accent:
    backgroundColor: "{colors.send-red-tint}"
    textColor: "{colors.send-red-tint-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: Bouldy

## Overview

**Creative North Star: "The Climber’s Logbook"**

Bouldy should feel like the compact notebook a climber reaches for between attempts: direct, durable, personal, and fast to scan with chalky hands. The interface is mobile-only by intent. It fills narrow screens edge to edge and remains a centered 430px app canvas on larger displays; it never expands into a desktop dashboard.

The visual language pairs hard-working neutral surfaces with one decisive send-red accent. Condensed display type carries the energy of gym signage, while Geist keeps labels, forms, and session data calm. Detailed climbing holds are functional identity markers, not decoration. Motion communicates navigation, saving, loading, or state change and always respects reduced-motion preferences.

This system rejects generic fitness-dashboard gloss, decorative glass, oversized desktop grids, soft cream palettes, and interchangeable icon-card layouts.

**Key Characteristics:**

- Mobile-canvas composition with one clear action per decision point.
- Flat tonal hierarchy: chalk-white working surface, wall-black summaries, send-red action.
- Condensed uppercase display type paired with quiet, readable interface text.
- Tactile climbing holds, Bolt B branding, and route language used with restraint.
- Reusable primitives with complete hover, focus, active, disabled, loading, error, and reduced-motion behavior.

## Colors

The palette is restrained and functional: near-black and neutral white carry the journal, while send-red is reserved for action, selection, and urgency.

### Primary

- **Send Red:** The only default action accent. Use for primary buttons, active navigation, focus outlines, flashes of emphasis, and destructive/error-adjacent messaging.
- **Deep Send Red:** Hover-strength and high-contrast red text where the standard accent is too light.
- **Send Tint / Send Tint Ink:** Paired background and text for errors, projects, and low-intensity accent states.

### Secondary

- **Route Blue and Route Green:** Optional user-selectable accent themes and semantic route-result colors. They never compete with the active theme accent on the same control.

### Neutral

- **Chalk White:** Default app background and control surface.
- **Wall Black:** Primary text and maximum-contrast marks.
- **Panel Black:** Session summaries, date tiles, and dark secondary actions.
- **Muted Ink / Faint Ink:** Supporting copy and inactive navigation, respectively. Faint ink is never used for essential body copy.
- **Hairline:** Dividers and field boundaries; never a decorative accent stripe.
- **Panel Muted / Panel Track:** Secondary text and separators used only on Panel Black.

**The One Red Rule.** Send Red marks the current action or state. If several unrelated elements compete in red, remove red until the hierarchy is obvious.

**The Paired Surface Rule.** Text on Panel Black uses panel-specific ink tokens. Neutral gray text placed directly on a colored surface is prohibited.

## Typography

**Display Font:** Barlow Condensed (with Impact and sans-serif fallbacks)  
**Body Font:** Geist (with Arial, Helvetica, and sans-serif fallbacks)  
**Label/Mono Font:** Geist; Geist Mono is reserved for technical identifiers when needed.

**Character:** Barlow Condensed brings the vertical energy of route cards and wall signage. Geist handles every task-oriented label, field, button, message, and data point without competing for attention.

### Hierarchy

- **Display** (800, 48px, 0.92): Page-defining statements and branded empty/error moments. Uppercase; never used for paragraphs.
- **Headline** (800, 32px, 0.95): Primary page titles and session identity.
- **Title** (800, 24px, 1): Section headings, summary names, and route-log headers.
- **Body** (400, 14–16px, 1.6): Instructions and explanatory copy. Keep prose below 65 characters per line on the mobile canvas.
- **Label** (600, 12px, 1.4): Field labels, metadata, counts, navigation, and status text. Uppercase only when it represents gym-signage language or a compact data label.

**The Two-Voice Rule.** Barlow Condensed speaks for climbing identity; Geist speaks for interaction. Display type inside standard buttons, form labels, and long descriptions is prohibited.

**The Tightness Floor.** Display letter spacing never goes below -0.04em. Body and label copy never uses negative tracking.

## Elevation

Bouldy is flat by default. Depth comes from tonal contrast, full borders, dividers, and overlay ownership rather than ambient shadows. Loading overlays occupy a dedicated semantic layer above the app body; bottom navigation and content remain structurally separate.

**The Flat Wall Rule.** Resting cards and controls have no drop shadow. A border and a wide soft shadow must never appear together as decoration.

**The State-Only Lift Rule.** Buttons may move one pixel on hover and one pixel down on press. No content card floats at rest.

## Components

All reusable visual components belong under `components/`; foundational primitives belong under `components/ui/`. Components must accept content and state through props, avoid page-specific data fetching, and be renderable in isolation before being added to Storybook.

### Buttons

- **Shape:** Primary and dark actions are full pills; compact route-result actions use gently rounded controls.
- **Primary:** Send Red, Chalk White text, 48px minimum height, bold Geist label.
- **Dark:** Panel Black with Chalk White text for secondary completion actions.
- **Soft:** Send Tint for low-intensity action or correction states.
- **Hover / Focus / Active:** One-pixel lift on hover, accent focus outline, compressed press state, and an internal circular loader for pending submissions.
- **Implementation:** Use `buttonStyles()` for links and buttons. Use `SubmitButton` for server-action forms; do not rebuild pending markup on individual pages.

### Chips

- **Style:** Full pill, 4px vertical and 10px horizontal padding, bold 12px label.
- **State:** Result badges use semantic paired colors: green for flash, blue for send, yellow for zone, accent tint for project. Style tags remain neutral and never look selectable unless they are controls.

### Cards / Containers

- **Corner Style:** 16px for meaningful grouped records; 12px for controls and compact feedback.
- **Background:** Panel Black for summaries; Chalk White with Hairline boundary for route records.
- **Shadow Strategy:** None at rest.
- **Internal Padding:** 16px for route records; 20px for summaries.
- **Rule:** A card must group one coherent record or summary. Nested decorative cards are prohibited.

### Inputs / Fields

- **Style:** 48px minimum height, 12px radius, Hairline boundary, transparent or Chalk White background, 16px text on task-heavy forms.
- **Focus:** Boundary shifts to Send Red while the global 3px focus outline remains visible.
- **Error / Disabled:** Errors are described by `FeedbackMessage`; disabled submitting controls retain their label space and display an internal loader.
- **Implementation:** Use `InputField` and `SelectField`; page files must not duplicate field-label and control classes.

### Navigation

- **Bottom navigation:** Three equal tabs—Home, Sessions, Gyms—with 20px line icons, 11px labels, and a short Send Red active indicator. It respects the bottom safe area.
- **Page transition:** 220ms directional movement between primary tabs. Swipes require a deliberate horizontal gesture and never start from controls or screen edges.
- **Unknown routes:** The branded 404 returns through `/`, which resolves to the journal for authenticated users and Welcome for unauthenticated users.

### Feedback and Loading

- `FeedbackMessage` owns error and success announcements.
- `BouldyLoader` owns branded full-screen loading motifs; ordinary buttons retain the familiar circular spinner.
- `PageSkeleton` mirrors each page’s geometry instead of replacing content with a central spinner.
- Loading, error, and empty states are first-class Storybook stories, not afterthoughts.

### Signature Components

- **RouteHold:** Maps route color and optional route name to detailed local hold artwork. It is decorative by default and never substitutes for the textual grade or route name.
- **BrandWordmark:** Bolt B plus the Bouldy wordmark, with a compact mark-only variant.
- **Session Summary:** Panel Black, condensed numeric hierarchy, paired panel text tokens, no shadow.

### Storybook Component Taxonomy

- **Ready now:** BrandWordmark, RouteHold, RouteMark, button variants, SubmitButton states, InputField, SelectField, FeedbackMessage, SectionHeading, BouldyLoader, PageLoader, PageSkeleton, BottomNav.
- **Extract next:** SessionSummary, SessionListItem, RouteCard, ResultBadge, ExpandableFormSection, EmptyState, and ErrorState.
- **Keep page-level:** Data fetching, authorization redirects, server actions, route aggregation, and complete page compositions.

## Do's and Don'ts

### Do:

- **Do** build edge-to-edge at 430px and below; keep the same centered 430px mobile canvas on wider screens.
- **Do** use `buttonStyles`, `SubmitButton`, `InputField`, `SelectField`, `FeedbackMessage`, and `SectionHeading` before writing new visual markup.
- **Do** pair every loading mutation with either an internal button loader, a route skeleton, or a full-screen Bouldy loader.
- **Do** preserve safe-area padding and 44px minimum interactive targets.
- **Do** use detailed local route-hold assets in every supported route color.
- **Do** add default, hover, focus, active, disabled, loading, error, and reduced-motion stories when Storybook is introduced.

### Don't:

- **Don't** introduce a desktop layout, sidebars, wide grids, or rounded phone-frame corners on mobile.
- **Don't** use cream, sand, beige, gradients, glassmorphism, decorative grid backgrounds, or sketch-style SVGs.
- **Don't** use side-stripe borders, gradient text, nested cards, or repeated icon-heading-description card grids.
- **Don't** pair a 1px border with a wide decorative shadow or exceed 16px radius on cards.
- **Don't** place Barlow Condensed in standard form labels, ordinary buttons, or long body copy.
- **Don't** create page-local button, field, feedback, badge, section-heading, loader, or empty-state styling when a shared component can own it.
- **Don't** hide essential content behind motion or omit a `prefers-reduced-motion` fallback.
