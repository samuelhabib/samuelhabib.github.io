# Portfolio v2 — Plan 4: Themes, Motion & Desktop Polish (Design)

**Status:** Approved in brainstorming 2026-09-08. Ready for implementation planning.

**Goal:** Make the classic-Mac desktop feel alive and personal — user-switchable
1-bit themes, interactive cursors, draggable desktop icons, a real zoom
box + full-screen, a window switcher, Get Info panes — and turn the
Projects window into a Keynote-grade slide deck with bespoke per-slide
1-bit motion. Fix the Projects font-loading flash along the way.

**Non-goals:** color themes (architecture only — see 4-A), Balloon Help,
Calculator/Scrapbook/other DAs, screensaver, MacinTalk, credits scroll,
Contact window, Chronology doc, Notes folder, Skills visualization,
Sad Mac 404 (that is Plan 5). All recorded under "Future" below.

---

## Global Constraints (carried from Plans 1–3, verbatim)

- **Static GitHub Pages only.** No server. Every window's content still
  ships as real semantic HTML in `dist/index.html`; the desktop shell
  hydrates over it. `scripts/assert-prerendered.mjs` must stay green.
- **Strictly 1-bit.** Only `#000` / `#fff`, referenced through tokens.
  Greys **only** via the Plan 1 dither utilities (`.dither-25/50/75`,
  hard-stop conic-gradient at 2px cells). **No `opacity`** for
  de-emphasis or disabled state — use `line-through`, italics, borders,
  or full invert. The **one** sanctioned exception this plan introduces:
  the CRT phosphor themes apply a single hue as a global tint (see 4-E).
- **`prefers-reduced-motion: reduce`** is honored everywhere. Every
  animation this plan adds has a reduced-motion path that is an instant
  cut / instant state change.
- **Tech stack unchanged:** Vite 5 + React 18 + TS 5, `vite-react-ssg@0.7.3`
  (pinned — higher needs Vite 6). Vitest + @testing-library/react for
  `src/**/*.{test,spec}.{ts,tsx}`; Playwright + @axe-core/playwright for
  `tests/**`, run against the built + previewed site (port 4173).
- **No new runtime dependencies.** Everything here is CSS, WAAPI, the
  Fullscreen API, and the Web Storage API.
- **Fonts:** self-hosted woff2 at `/fonts/`. Do not add fonts with murky
  rights; the documented fallback stacks stay.
- **Commits:** one per task, on branch `new-and-improved`. No push
  without an explicit ask. Commit-message trailer as configured.

---

## Architecture Overview

Plan 4 is one spec delivered as **seven sub-plans**, each producing
working, testable software on its own and in this order:

| Sub-plan | Deliverable | Depends on |
|----------|-------------|------------|
| **4-A** | Semantic token layer + theme-class plumbing + pre-hydration theme script | — |
| **4-B** | Interactive cursor rules (pointer / grab / grabbing / resize / text) | 4-A tokens (optional) |
| **4-C** | Draggable desktop icons (session-persisted) + `Special ▸ Clean Up` | `useDrag` extension |
| **4-D** | Title-bar zoom box + `View ▸ Enter Full Screen` + window switcher menu + `⌘\`` | reducer change |
| **4-E** | Appearance control panel (themes + desktop-pattern picker) + `View ▸ Theme ▸` quick list | 4-A, 4-D (menu bar) |
| **4-F** | Projects font-loading fix + Keynote deck: 1-bit slide transitions + per-slide bespoke motion | — (soft: 4-A tokens) |
| **4-G** | `File ▸ Get Info` → per-window info pane | 4-D (menu bar) |

Shared touch points:

- **`src/shell/windows.ts`** — `WindowId` gains `appearance` and
  `getinfo`; `WindowState` gains `maxed`; reducer gains `zoom`.
- **`src/shell/MenuBar.tsx` / `Menu.tsx`** — new items in View, File,
  Special; new right-aligned **Windows** menu; submenu support in `Menu`.
- **`src/shell/Desktop.tsx`** — wires theme state, icon positions, zoom,
  fullscreen, window-switcher, and the two new desk-accessory windows.
- **`src/shell/useDrag.ts`** — extended: exposes drag-active state (for
  the `grabbing` cursor) and accepts a movement threshold (for icons).
- **`src/styles/`** — new `themes.css` (imported after `tokens.css`),
  `tokens.css` refactored to the semantic layer, `cursors.css` new.
- **`index.html`** — `<head>` gains font `preload` links and a tiny
  synchronous theme-init `<script>`.

---

## 4-A · Semantic token layer + theme plumbing

### What it does

Introduces a semantic CSS custom-property layer so that "what color is a
title bar" is answered by a token, not by a component hard-coding
`var(--black)`. A **theme** is a single class on `<html>`
(`theme-system7`, `theme-dark`, `theme-system6`, `theme-crt-amber`,
`theme-crt-green`) that overrides the semantic tokens. The palette
primitives (`--black`, `--white`) stay; themes remap the semantic tokens
onto them (or, for CRT, onto a tinted pair).

### Token model

`tokens.css` keeps the primitives and spacing/type scales, and adds:

```css
:root {
  /* palette primitives — unchanged */
  --black: #000;
  --white: #fff;

  /* semantic surface + ink (System 7 defaults live here so a
     class-less document is already the default theme) */
  --c-bg: var(--white);            /* window / content background */
  --c-fg: var(--black);            /* body text, borders */
  --c-chrome-bg: var(--white);     /* title bars, menu bar, chrome */
  --c-chrome-fg: var(--black);
  --c-accent: var(--black);        /* selection, focus, active fill — a real color in a future color theme */
  --c-accent-fg: var(--white);     /* text on --c-accent */
  --dither-ink: var(--black);      /* the ink color the dither utilities stipple with */

  /* chrome shape knobs a theme may vary */
  --chrome-font: 'Chicago', 'Geneva', system-ui, sans-serif;
  --window-border-w: 1px;
  --titlebar-lines: 6;             /* System 7 pinstripe count; System 6 uses 0 + solid */
  --desktop-pattern: 50;           /* 0 | 25 | 50 | 75 → which Plan 1 dither the desktop uses */
}
```

`themes.css` (new, `@import`ed in `global.css` immediately after
`tokens.css`):

```css
/* Default is System 7 — declared so the Appearance panel can show it as a
   selectable row that resets any other theme's overrides. */
.theme-system7 { /* all semantic tokens already match :root; explicit no-op block for clarity */ }

.theme-dark {
  --c-bg: var(--black);      --c-fg: var(--white);
  --c-chrome-bg: var(--black); --c-chrome-fg: var(--white);
  --c-accent: var(--white);  --c-accent-fg: var(--black);
  --dither-ink: var(--white);
  color-scheme: dark;
}

.theme-system6 {
  --chrome-font: 'Geneva', system-ui, sans-serif;
  --window-border-w: 2px;
  --titlebar-lines: 0;
  --desktop-pattern: 75;
}

/* CRT: the one sanctioned non-B&W. A single hue tints the WHOLE screen
   via a fixed overlay Desktop renders (see decision note below) — NOT a
   filter on a layout ancestor. These vars feed that overlay. */
.theme-crt-amber { --crt-hue: #ffb000; }
.theme-crt-green { --crt-hue: #33ff66; }
```

> **Decision — CRT tint via a fixed overlay, not a root `filter`:** a
> `filter` on `<html>` / `#root` / `.desktop` creates a containing block
> for `position: fixed` descendants (`MenuBar`, `ShutDown`) — the exact
> bug fixed for the Konami flash in `f60982c`. So the CRT themes do **not**
> put `filter` on a layout ancestor. Instead, when a `theme-crt-*` class
> is active, `Desktop` renders a single non-interactive full-viewport
> overlay (`position: fixed; inset: 0; pointer-events: none; z-index:
> 9000`) whose `background` is the phosphor hue at low alpha with
> `mix-blend-mode: multiply` (hue) plus a faint scanline
> `repeating-linear-gradient`. This tints everything painted behind it
> without touching layout — same technique as the Konami overlay.
> `themes.css` holds the two hue values; the overlay element and its
> blend mode are one shared rule. e2e guard: with a CRT theme active the
> menu bar's `getBoundingClientRect().top` is still `0`.

### Component repoint

Every `*.module.css` and `src/styles/*.css` that currently uses
`var(--black)` / `var(--white)` for a **surface or ink** role switches to
the semantic token. Structural uses (a 1px hairline that is always "the
ink color") map to `--c-fg`. The dither utilities in `dither.css` switch
their stipple color to `var(--dither-ink)`. This is mechanical; the
sub-plan enumerates the files.

### No-flash init

`index.html` `<head>` gains, before the module script:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('theme');
      if (!t && matchMedia('(prefers-color-scheme: dark)').matches) t = 'theme-dark';
      if (t) document.documentElement.className = t;
    } catch (e) {}
  })();
</script>
```

React side: a `useTheme()` hook (`src/shell/useTheme.ts`) owns the
current theme, writes `document.documentElement.className`, persists to
`localStorage['theme']`, and exposes `{ theme, setTheme, THEMES }`.
`THEMES` is the single source of truth: `{ id, label, className }[]`.

### Testing

- Unit (`useTheme.test.ts`): resolver picks stored value; falls back to
  `theme-dark` under mocked `prefers-color-scheme: dark`; `setTheme`
  persists and updates `document.documentElement.className`.
- Unit (`themeTokens.test.ts`): assert `THEMES` ids are unique and every
  `className` is one of the classes defined in `themes.css` (read the
  file, regex the `.theme-*` selectors).
- e2e (`tests/themes.spec.ts`, added in 4-E where the UI exists).

---

## 4-B · Interactive cursors

### What it does

The pointer communicates affordance: `pointer` over anything clickable,
`grab` over anything draggable at rest, `grabbing` mid-drag, the resize
diagonal over the grow box, `text` inside the Terminal.

### Implementation

New `src/styles/cursors.css`, `@import`ed last in `global.css`:

```css
button, a[href], [role="menuitem"], [role="menuitemcheckbox"],
summary, label { cursor: pointer; }

[data-testid="titlebar"], .desktop-icon { cursor: grab; }
:root[data-dragging] , :root[data-dragging] * { cursor: grabbing !important; }
.grow-box { cursor: nwse-resize; }
[data-terminal] { cursor: text; }
[aria-disabled="true"] { cursor: default; }
```

`useDrag` (see shared change below) toggles
`document.documentElement.dataset.dragging` on pointerdown / pointerup so
the `grabbing` rule applies globally for the duration of any drag
(window move, resize, icon move).

### `useDrag` extension (shared, lands in 4-B)

```ts
export function useDrag(
  onDelta: (dx: number, dy: number) => void,
  onEnd?: () => void,
  opts?: { threshold?: number }, // px of movement before a drag "counts"; default 0
) { /* ... returns { onPointerDown } as today ... */ }
```

- On pointerdown: set `document.documentElement.dataset.dragging = ''`.
- On pointermove: only set `moved.current = true` and start emitting
  `onDelta` once cumulative movement exceeds `opts.threshold` (0 keeps
  today's behavior for windows/resize).
- On pointerup: `delete document.documentElement.dataset.dragging`; fire
  `onEnd` only if `moved.current`.

### Testing

- Unit (`useDrag.test.tsx`): with `threshold: 4`, a 3px move fires
  neither `onDelta` nor `onEnd`; a 6px move fires both. `data-dragging`
  is present between down and up.
- e2e (`tests/cursors.spec.ts`): grow box computes `nwse-resize`; a
  titlebar computes `grab`; Terminal body computes `text`.

---

## 4-C · Draggable desktop icons (session-persisted)

### What it does

Desktop icons can be dragged anywhere on the desktop; where you drop one
is where it stays **for the session**. A hard reload starts from the tidy
default grid. `Special ▸ Clean Up` snaps every icon back to the grid
immediately.

### Implementation

- `DesktopIcons` stops being a flex column. Each icon is
  `position: absolute` at `left/top` from a positions map.
- New `src/shell/iconLayout.ts` (pure):
  ```ts
  export interface IconPos { x: number; y: number }
  export const ICON_IDS = ['resume', 'projects', 'terminal', 'readme'] as const
  export function defaultGrid(viewportW: number): Record<string, IconPos>
  //   → right-hand column, 12px inset, 14px gap, 76px cells (today's look)
  export function clampIcon(p: IconPos, vp: { w: number; h: number }): IconPos
  //   → keeps the 76×~52 icon fully on the desktop, below the menu bar
  export function snapToGrid(p: IconPos, viewportW: number): IconPos // nearest default slot
  ```
- `DesktopIcons` holds `positions` state, seeded from
  `sessionStorage['iconPos']` if present else `defaultGrid(innerWidth)`,
  and writes the map back to `sessionStorage` on every drop.
- Each icon wraps `useDrag((dx,dy)=>…, onDrop, { threshold: 4 })`. Below
  threshold the gesture is a no-op, so the existing **double-click / Enter
  / Space to open** still works untouched. Drag commits clamped position
  on drop.
- `Special` menu gains `Clean Up` → `DesktopIcons` re-seeds to
  `defaultGrid` and clears the sessionStorage key. Wired through a
  `cleanUpIcons` action on `MenuBarActions` and a `ref`/callback from
  `Desktop` to `DesktopIcons` (or lift `positions` into `Desktop` — the
  sub-plan picks the simpler wiring after seeing the code; default:
  lift into `Desktop` so the menu action is a plain `setState`).

### Testing

- Unit (`iconLayout.test.ts`): `defaultGrid` returns 4 non-overlapping
  slots in the right column; `clampIcon` pins an off-screen point back
  inside and never above `--menubar-h`; `snapToGrid` maps a nearby point
  to the exact default slot.
- e2e (`tests/desktop-icons.spec.ts`): drag the Résumé icon 200px left,
  reload → back in the default column (session-only); drag again →
  `Special ▸ Clean Up` → back in column without reload; a plain
  double-click still opens the window.

---

## 4-D · Zoom box + Full Screen + window switcher

### Zoom box

- `WindowState` gains `maxed: { x: number; y: number; w: number; h: number } | null`
  — the rect to restore to; `null` means not maximized. (Named `maxed`,
  **not** `zoom`/`minZoom` — `minZoom` already exists for the open
  animation origin.)
- Reducer gains `{ type: 'zoom'; id; desktop: { w: number; h: number } }`:
  - if `w.maxed` is null → store current rect in `maxed`, set
    `x=0, y=0, w=desktop.w, h=desktop.h`.
  - else → restore `x/y/w/h` from `maxed`, set `maxed = null`.
- `Window` title bar gets a **zoom box** button on the right (mirror of
  the close box), classic nested-squares glyph, `aria-label="Zoom {title}"`,
  `onClick` → `onZoom()`. `Desktop` passes
  `onZoom={() => dispatch({ type: 'zoom', id, desktop: desktopSize() })}`
  where `desktopSize()` reads the `.desktop` client box.
- Resize is instant. Under **not** reduced-motion, an optional
  ShutDown-style short WAAPI tween of the rect (≤160ms, `steps`-free) —
  the sub-plan may cut this if it fights the drag/resize model; instant
  is acceptable and authentic.
- `File ▸ Zoom Window` mirrors the button for keyboard users;
  double-clicking the title bar keeps its current **shade** behavior
  (unchanged) — zoom is button/menu only, matching System 7.

### Full Screen

- `View ▸ Enter Full Screen` → `document.getElementById('win-'+front)
  .requestFullscreen()`. Label flips to `Exit Full Screen` while
  `document.fullscreenElement` is set; selecting it calls
  `document.exitFullscreen()`. `Esc` exits via the browser.
- CSS: `:fullscreen .window` fills the viewport; the menu bar is
  naturally outside the fullscreened `<section>` so it is hidden by the
  browser — no extra work.
- Guard: no front window → item disabled. Fullscreen API rejected
  (iframe/preview) → swallow the promise rejection; feature is
  best-effort.

### Window switcher

- New right-aligned **Windows** menu in `MenuBar` (a sibling of the
  sound toggle / clock), `aria-label="Windows"`, lists every **open**
  window by title, newest-focused first (sort by `z` desc). Selecting one
  dispatches `focus`. A `✓` (menuitemcheckbox) marks the current front
  window.
- `⌘\`` (Meta+Backquote) anywhere on the desktop cycles focus to the
  next open window by `z` order (wraps). `⇧⌘\`` cycles backward. Wired in
  `useWindowKeys` (already the global key hook), guarded so it does
  nothing while the Terminal has focus and the user is mid-line? — no:
  `⌘\`` is not a text key, cycle regardless. Ignored when only ≤1 window
  is open.
- `Menu.tsx` needs **submenu / dynamic item list** support only insofar
  as the items are computed at render — it already takes `items:
  MenuItemSpec[]`, so this is just passing a computed array. No nested
  menus required for 4-D.

### Testing

- Unit (`windows.test.ts`): `zoom` stores-then-restores the exact rect;
  a second `zoom` round-trips; `zoom` on an already-`maxed` window with a
  different `desktop` size still restores the original.
- Unit (`windowSwitch.test.ts`): a pure `nextWindow(state, dir)` helper
  returns the correct id by `z` order and wraps; returns `null` for ≤1
  open.
- e2e (`tests/zoom.spec.ts`): zoom box fills the desktop and a second
  click restores; `⌘\`` moves focus between two open windows; `View ▸
  Enter Full Screen` sets `document.fullscreenElement` then `Exit`
  clears it (Playwright Chromium supports the API headless).

---

## 4-E · Appearance control panel + View ▸ Theme

### What it does

A desk-accessory window for changing the theme **and** the desktop
pattern, plus a quick theme list in the menu bar.

### Implementation

- `WindowId` gains `appearance`. `DEFAULTS.appearance = { x: 240, y: 120,
  w: 320, h: 300 }`. `TITLES.appearance = 'Appearance'`.
- Opened from **Apple ▸ Appearance…** (new item) and from **View ▸
  Theme ▸ <name>** quick-select (each theme a `menuitemcheckbox`, the
  active one checked; selecting sets the theme without opening the
  window).
- `src/windows/AppearanceWindow.tsx`:
  - A `<fieldset>` "Theme" with a radio per `THEMES` entry. Each row:
    the radio, the label, and a **12×16px live preview swatch** — a tiny
    `<span>` with the theme's class applied locally, drawn as a 2px
    dither fill + a 1px "window" rect, so you see the surface/ink
    inversion at a glance.
  - A `<fieldset>` "Desktop Pattern" with radios for `0 / 25 / 50 / 75`
    (Plan 1 dither densities), each with the same swatch treatment.
    Writes `--desktop-pattern` via a `useDesktopPattern()` hook →
    `localStorage['desktopPattern']`, read by the same `index.html`
    init script; `.desktop` background switches on
    `:root` `--desktop-pattern` (a `data-pattern` attr is simpler than a
    numeric custom-prop in a `repeating-conic-gradient` — use
    `html[data-pattern="75"] .desktop { … }` rules in `themes.css`).
  - Ships **real static HTML**: the `<fieldset>`s render server-side
    with the default theme checked, so the window's markup is in
    `dist/index.html`. Hydration wires the live switching.
- `scripts/assert-prerendered.mjs` `needles` gains
  `'Appearance'` and `'Desktop Pattern'`.
- `AppearanceWindow` is mounted in `Desktop`'s `content` map like
  `puzzle` / `about`.

### Testing

- Unit (`AppearanceWindow.test.tsx`): renders a radio per theme; the
  active theme's radio is checked; clicking another calls `setTheme`;
  clicking a pattern calls `setPattern`. axe-clean (jsdom).
- e2e (`tests/themes.spec.ts`): open Appearance, pick **Dark**, assert
  `<html class="theme-dark">` and a known chrome element's computed
  `background-color` is `rgb(0, 0, 0)`; **reload** → still dark, and
  **no flash** (the init script ran) — assert
  `getComputedStyle(document.documentElement).getPropertyValue` early;
  pick a CRT theme → assert the menu bar's
  `getBoundingClientRect().top` is still `0` (containing-block
  regression guard); pick a desktop pattern → `.desktop` computed
  `background-*` changes; `View ▸ Theme ▸ System 7` resets.

---

## 4-F · Projects font fix + Keynote deck

### Font-loading fix (do first in this sub-plan)

**Symptom:** opening Projects sometimes shows the serif/system fallback
instead of Chicago/NewYork. **Cause:** every `@font-face` in `fonts.css`
uses `font-display: swap`, so text paints immediately in the fallback and
swaps when the webfont arrives — visible as "wrong font, sometimes,"
worse on a cold cache.

**Fix:**

1. `index.html` `<head>` — preload the three faces actually used above
   the fold:
   ```html
   <link rel="preload" as="font" type="font/woff2" href="/fonts/chicago.woff2" crossorigin>
   <link rel="preload" as="font" type="font/woff2" href="/fonts/newyork.woff2" crossorigin>
   <link rel="preload" as="font" type="font/woff2" href="/fonts/monaco.woff2" crossorigin>
   ```
2. `fonts.css` — switch **Chicago** and **Monaco** (chrome + mono, where
   the fallback looks most wrong) to `font-display: block`; leave
   **NewYork** on `swap` (a serif fallback for body prose is acceptable
   and `block`'s invisible-text period is worse for a large text block).
3. No JS font-loading gate — preload + `block` is enough and keeps the
   no-JS fallback readable.

**Test:** e2e (`tests/fonts.spec.ts`) — `await page.evaluate(() =>
document.fonts.ready)`, open Projects, assert a deck `<h2>` computes a
`font-family` whose first token is `"Chicago"` and that
`document.fonts.check('16px Chicago')` is true.

### Keynote deck

Rework `src/windows/ProjectsDeck.tsx` (+ `ProjectsDeck.module.css`, +
new `src/windows/deck/` folder) from "cards you page through" into
"slides that present."

**Slide model** (unchanged shape, richer render): the existing
`buildSlides` output — `contents`, `divider('Work')`, work stacks,
`divider('Outside of Work Projects')`, side stacks — stays. Each stack's
cards (Overview / Problem / Approach / Result / Tech & Links) each become
a **full slide layout**:

- Large Chicago title, generous margin, **one focal visual** per slide,
  bullet points that build in.
- `contents` slide → an **agenda** (numbered list of stacks, click to
  jump — already works, restyled).
- `divider` slides → full-bleed **section breaks** ("Work" / "Outside of
  Work") with a dithered rule.

**Transitions** — `src/windows/deck/SlideTransition.tsx`:

- Between slides, a **1-bit dither wipe**: the outgoing slide is masked
  away with an animated `mask-image` built from the Plan 1 conic dither
  at increasing cell size (checkerboard dissolve), or a hard-edged iris
  — the sub-plan picks one after a spike; both are pure B&W and
  CSS-only.
- Direction-aware (forward vs. back).
- `prefers-reduced-motion` → no transition, instant swap.
- Pressing any nav key **during** a transition snaps it to done
  immediately (no queue).

**Per-slide bespoke motion** — data-driven, not a switch pile:

```ts
// src/windows/deck/slideMotion.tsx
export type MotionKey = 'overview' | 'problem' | 'approach' | 'result' | 'techlinks' | 'divider' | 'contents'
export const slideMotion: Record<MotionKey, React.FC<{ play: boolean; card: ProjectCard }>>
```

Each entry is a small component that animates in when `play` flips true
(slide becomes active) and is static otherwise:

| Slide | Motion (all 1-bit, CSS/WAAPI, reduced-motion → static) |
|-------|--------|
| `overview` | title + summary **wipe on** left-to-right; the stack's tech chips fade to visible via a dither mask |
| `problem` | the constraint text types/wipes on; if the card names a "before" state, a 1-bit diagram gets an **X struck through** it |
| `approach` | `provider-directory-flow.svg` (and any stack diagram) **draws its own strokes** via `stroke-dashoffset`, boxes appearing in sequence |
| `result` | a headline number **counts up** (`font-variant-numeric: tabular-nums`), or a **dithered bar fills** to a target width |
| `techlinks` | tech chips **stagger in** (translateY + dither-mask reveal), links underline-sweep |
| `divider` | the section rule **wipes across**; the label sets with a 1px drop |
| `contents` | agenda rows **stagger in** top-to-bottom |

Motion budget: every animation ≤ 500ms, no loops (a diagram that
"runs a little loop" is explicitly **not** in scope — one-shot on
slide-enter only), GPU-friendly (`transform` / `mask` / `opacity` of a
**mask**, never `opacity` of content — the 1-bit rule).

**Keyboard/scroll nav**: unchanged (`ArrowRight`/`PageDown`/`Space`
next, etc.), deep-link (`?open=projects&stack=`) unchanged, jump-to-stack
from Terminal / agenda unchanged. Motion is additive and always
skippable.

### Testing

- Unit (`slideMotion.test.tsx`): every `MotionKey` has an entry;
  rendering each with `play={false}` shows final content (no hidden
  text — assert the text is in the DOM and not `hidden`); with a mocked
  `prefers-reduced-motion` each renders identically to `play={false}`.
- Unit (`SlideTransition.test.tsx`): with reduced motion, swapping
  children is synchronous (new child present, old child gone, no
  timers pending).
- Unit (existing `ProjectsDeck.test.tsx`): all current assertions
  (paging, disabled-at-end, jump-to-stack) still pass against the new
  render.
- e2e (`tests/projects.spec.ts`): existing deck tests stay green; add
  one — under `prefers-reduced-motion` the deck advances with an instant
  DOM swap (no transition element lingering) and the axe scan stays
  clean mid-deck.

---

## 4-G · Get Info panes

### What it does

`File ▸ Get Info` (enabled only with a front window) opens a small
`getinfo` window describing the **front window** at the moment it was
invoked — a place for one line of personality per window.

### Implementation

- `WindowId` gains `getinfo`. `DEFAULTS.getinfo = { x: 300, y: 180, w:
  300, h: 260 }`. `TITLES.getinfo = 'Info'` (the title bar shows
  `"<Subject> Info"` — see below).
- `src/windows/getInfo.ts` (pure data):
  ```ts
  export interface InfoCard {
    subject: string           // "Résumé", "Projects", …
    kind: string              // "Portfolio document", "Slide deck", "Terminal emulator"
    created: string           // period-accurate flavor: "March 2003"
    modified: string          // __BUILD_DATE__
    size: string              // playful: "42K on disk"
    where: string             // "samuelhabib.github.io"
    comment: string           // the one-liner of personality
  }
  export const INFO: Record<WindowId, InfoCard>
  ```
- `src/windows/GetInfoWindow.tsx` — a `<dl>` of the fields plus the
  window's own `IconGlyph` where the window has one; the **Comments**
  field is a bordered box (System 7 Get Info had exactly that).
- `Desktop` tracks `infoSubject: WindowId | null`; `File ▸ Get Info`
  sets it to the current `front` and opens `getinfo`. The window reads
  `INFO[infoSubject]`.
- Ships real static HTML for **one** default subject (`resume`) so the
  markup is pre-rendered; the needle set gains `'Portfolio document'`.

### Testing

- Unit (`getInfo.test.ts`): `INFO` has an entry for every `WindowId`
  that appears as a desktop icon or in the File menu; `modified` equals
  `__BUILD_DATE__`.
- Unit (`GetInfoWindow.test.tsx`): renders the subject's `kind`,
  `where`, and `comment`; axe-clean.
- e2e (`tests/get-info.spec.ts`): focus the Projects window, `File ▸ Get
  Info`, assert the Info window shows "Slide deck" and the Projects
  comment string.

---

## Cross-cutting: test + CI budget

After every sub-plan: `npx tsc --noEmit`, `npm test -- --run`,
`npm run build && npm run prerender:assert`, `npm run test:e2e` all
green before the task's commit. The CI build job already runs unit + e2e
before deploy (commit `77edf5d`) — no workflow change needed.

New needles in `scripts/assert-prerendered.mjs`: `'Appearance'`,
`'Desktop Pattern'`, `'Portfolio document'`.

---

## Content dependency (not a code task)

4-F's deck is only as sharp as its content. Independent of this plan,
these `content/` edits are **Samuel's to make** (real figures/outcomes,
not something to TDD):

- `content/projects/crisis-detection.md` — the `___` Result line.
- `content/projects/fitness-bot.md` — the whole stack (currently
  `placeholder: true`, all `___`).
- `content/about.md` — the `___` under "Outside work".
- `content/resume.md` — a read-through to confirm every date and figure.

4-F ships working motion regardless; filling these makes it land.

---

## Future (explicitly out of scope for Plan 4)

Recorded so they are not re-litigated:

- **Plan 5 candidate:** Sad Mac / bomb dialog as the 404 page **and** the
  React error boundary ("Sorry, a system error occurred" + Restart).
- Balloon Help (`? ` menu + speech-balloon tooltips over chrome).
- Calculator DA; Note Pad / Scrapbook DA (flip through the 1-bit
  diagrams); After Dark-style idle screensaver; MacinTalk "Speak"
  command (Web Speech API reads the résumé); ⌥-click-Apple credits
  scroll.
- Trash refinements: "Empty Trash?" confirm, crumple animation,
  full-vs-empty can icon.
- Contact window (form-styled, `mailto:` action); Chronology / career
  timeline window; "Notes" Finder folder of short write-ups; richer
  Skills visualization (1-bit chart / categorized board).
- Deferred from earlier plans: dithered card transitions for the deck
  (now **in** 4-F), general `?open=<window>` deep links, `hypercard`
  Terminal alias.
- **Color themes** — the 4-A token layer is built to accept them
  (add a `.theme-*` class that sets `--c-accent` etc. to real colors);
  no component rewrite required when that day comes.
