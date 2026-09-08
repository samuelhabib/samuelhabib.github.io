# Projects Presentation Layer — Design

**Status:** approved (visual direction confirmed via the Provider Directory slice, commit on `new-and-improved`).

## Problem

The Projects deck rework in Plan 4-F improved the deck *chrome* (layouts, transitions, per-slide motion) but every slide is still `## heading` + prose paragraphs lifted from `content/projects/*.md`. The user wants an "Apple Keynote" deck: a visual, terse *skim* — a diagram, a stat, or an icon layout per slide — while the full written detail stays somewhere canonical.

## The two-layer model

| Layer | Lives in | Is | Audience |
|---|---|---|---|
| **Detail** | `content/projects/<slug>.md` | The full write-up: problem, approach, results, real numbers. Unchanged authoring. | No-JS / ATS / screen-reader (`ProjectsArticle` fallback, untouched); anyone who clicks "Full write-up" |
| **Presentation** | `src/windows/deck/decks/<slug>.ts` | A hand-authored `Slide[]` — the Keynote skim. Terse, visual. | The desktop deck |

The two are kept consistent by intent, not generation. A project **without** a presentation deck falls back to rendering its markdown cards exactly as today.

Nothing here invents project substance. Provider Directory and Referral Outbound Center have enough written to build full decks. Crisis Detection is built up to its missing Result (an honest "evaluation in progress" slide until the `___` in the md is filled). Fitness Bot stays a single placeholder card until it is written up.

## Slide model (already shipped in the slice)

`src/windows/deck/slideTypes.ts`:

```ts
type Slide =
  | { layout: 'title';  kicker?: string; title: string; subtitle?: string }
  | { layout: 'points'; title: string; items: { icon: DeckIconName; text: string }[] }
  | { layout: 'diagram'; name: DiagramName; title?: string; caption?: string }
  | { layout: 'stat';   value: string; label: string; foot?: string }
  | { layout: 'quote';  text: string; attribution?: string }
  | { layout: 'tech';   title?: string; items: string[] }

interface ProjectDeck { slug: string; title: string; slides: Slide[] }
```

- `SlideView` renders one slide as a full-bleed composition with a per-layout one-shot entrance (transform / clip-path only; muted under `prefersReducedMotion()`).
- `DECKS: Record<slug, ProjectDeck>` in `src/windows/deck/decks/index.ts`.
- The title slide renders the project title as `<h2>` so deck navigation / deep links / the Windows menu keep working.
- `deck/diagrams/` is a registry of 1-bit SVG React components (`stroke="currentColor"`, `role="img"` + `<title>`), themable, static.
- `deck/DeckIcon.tsx` is a small set of 1-bit line glyphs for `points` bullets.

## Scope of this plan

1. **Layout polish** on the shipped slice:
   - `SlideView` — centre the content column on wide/zoomed/full-screen decks (`margin-inline: auto`; centred layouts go full width); tighten vertical rhythm.
   - `ReconcileLoop` — the "weekly self-heal" label overlaps the loop arrow and the return arrowhead lands in the roster stack. Re-lay-out so nothing collides and the loop reads cleanly.

2. **Diagram library** — add:
   - `ReferralPipeline` — a left-to-right referral flow (sender facility → send → service/queue → tracked state), with the four referral states shown as a legible row.
   - `RecallVsCost` — a 2×2 outcome grid (actual crisis / not × flagged / not) with the "missed" cell (false negative) heavily emphasised and the "false alarm" cell played down, making the asymmetry the point.

3. **Presentation decks**:
   - `referral-outbound-center.ts` — title · problem (points) · `ReferralPipeline` · stat (25+ facilities · 100% retention · ~1 month PoC→launch) · tech.
   - `crisis-detection.ts` — title · problem (points, the false-negative framing) · `RecallVsCost` · a `points`/`quote` "evaluation in progress" slide (with a code comment: swap for a `stat` slide once `content/projects/crisis-detection.md` Result is filled) · tech.
   - Fitness Bot: no deck. It keeps its single markdown placeholder card.

4. **"Full write-up →" affordance** — a link in the deck nav bar, shown whenever a project slide is on stage, that opens the project's markdown detail in a reading window:
   - new `writeup` window id + `DEFAULTS` + `TITLES` (`'Project Notes'`), mirroring the `getinfo` plumbing from Plan 4-G;
   - Desktop holds a `writeupSlug` state; the deck calls up through a prop (`onOpenWriteup(slug)`);
   - `WriteupWindow` renders one project's detail as a styled `<article>` — reuse the per-project rendering from `ProjectsArticle` / the `cards` so there is a single source of prose.

5. **Wiring** — `ProjectsDeck` already dispatches to typed vs markdown rendering; extend it for the new decks and the write-up link. Update the deck unit tests + `tests/projects.spec.ts` for the projects that become typed (Referral, Crisis): counters read "slide N of M", card headings are gone, title slides carry the `<h2>`.

## Out of scope

- Résumé / Read Me / About visualisation (separate later).
- Any change to `content/projects/*.md` authoring or the no-JS `ProjectsArticle` fallback.
- Filling the Crisis Detection Result or the Fitness Bot write-up — those are Samuel's, and the decks degrade honestly without them.
- Animated diagram stroke-drawing (static diagrams only; the slide-level entrance is enough).

## Global constraints (carried from Plans 1–4)

- Static GitHub Pages; every window's content ships as real HTML; `scripts/assert-prerendered.mjs` stays green (add a needle only if a new always-present string is worth guarding — the write-up window's fallback markup).
- Strictly 1-bit: `#000`/`#fff` via tokens; greys only via the dither utilities; **no `opacity`** for de-emphasis. Diagrams use `currentColor` so they invert with the theme.
- `prefers-reduced-motion: reduce` honoured — every entrance has an instant-cut path.
- No new runtime dependencies.
- One commit per task on `new-and-improved`; **no push without an explicit ask.** Commit trailer:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01NnmN4mHyjEgrk2WpR6QcQx
  ```
- Per-task gate: `npx tsc --noEmit && npm test -- --run && npm run build && npm run prerender:assert && npm run test:e2e` all green before the commit.
- Baseline at plan start: 166 unit tests (38 files), 57 e2e, tsc / build / prerender clean; the presentation-layer slice already committed.
