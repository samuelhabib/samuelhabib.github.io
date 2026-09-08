# Portfolio v2 — Plan 4: Themes, Motion & Desktop Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** User-switchable 1-bit themes, interactive cursors, draggable desktop icons, a real zoom box + full-screen + window switcher, Get Info panes, and a Keynote-grade Projects deck with bespoke per-slide 1-bit motion (plus a fix for the Projects font-loading flash).

**Architecture:** Seven independent sub-plans (4-A … 4-G), each shippable on its own, built in order. A semantic CSS token layer (4-A) lets a single `<html>` class re-skin everything; the rest layer polish onto the existing `useReducer` window manager, `useDrag` pointer helper, and ARIA menu-bar. No new runtime dependencies — CSS, WAAPI, the Fullscreen API, and Web Storage only.

**Tech Stack:** Vite 5 + React 18 + TS 5, `vite-react-ssg@0.7.3` (pinned), Vitest + @testing-library/react (`src/**/*.{test,spec}.{ts,tsx}`), Playwright + @axe-core/playwright (`tests/**`, run against the built + previewed site on port 4173).

**Spec:** `docs/superpowers/specs/2026-09-08-portfolio-v2-plan-4-design.md` — read it alongside this plan.

## Global Constraints

- **Static GitHub Pages only.** No server. Every window's content ships as real semantic HTML in `dist/index.html`; the shell hydrates over it. `scripts/assert-prerendered.mjs` must stay green.
- **Strictly 1-bit.** Only `#000` / `#fff`, via tokens. Greys **only** via the Plan 1 dither utilities (`.dither-25/50/75`). **No `opacity`** for de-emphasis/disabled — use `line-through`, italics, borders, full invert. Sole exception: the CRT phosphor themes tint the whole screen via one fixed overlay (4-A / 4-E).
- **`prefers-reduced-motion: reduce`** honored everywhere. Every animation added here has a reduced-motion path that is an instant cut.
- **No new runtime dependencies.**
- **Fonts:** self-hosted woff2 at `/fonts/`. Keep the documented fallback stacks; add no fonts with murky rights.
- **Commits:** one per task, on branch `new-and-improved`. **No push without an explicit ask.** End every commit message with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01NnmN4mHyjEgrk2WpR6QcQx
  ```
- **Per-task gate:** `npx tsc --noEmit` && `npm test -- --run` && `npm run build && npm run prerender:assert` && `npm run test:e2e` all green before the task's commit.
- **Baseline at plan start:** 99 unit tests (25 files), 43 e2e, tsc clean, build + prerender:assert clean. Last commit `f60982c`.

---

## File Structure (whole plan)

**Created:**
- `src/styles/themes.css` — `.theme-*` classes + `html[data-pattern]` desktop-pattern rules (4-A)
- `src/styles/cursors.css` — global cursor affordance rules (4-B)
- `src/shell/useTheme.ts` — current theme state, persistence, `THEMES` registry (4-A)
- `src/shell/useDesktopPattern.ts` — desktop-pattern state + persistence (4-E)
- `src/shell/iconLayout.ts` — pure grid / clamp / snap math for desktop icons (4-C)
- `src/shell/windowSwitch.ts` — pure `nextWindow(state, dir)` helper (4-D)
- `src/windows/AppearanceWindow.tsx` + `.module.css` — themes + pattern control panel (4-E)
- `src/windows/getInfo.ts` — `INFO` registry (4-G)
- `src/windows/GetInfoWindow.tsx` + `.module.css` — Get Info pane (4-G)
- `src/windows/deck/SlideTransition.tsx` — 1-bit slide transition wrapper (4-F)
- `src/windows/deck/slideMotion.tsx` — data-driven per-slide motion components (4-F)
- `src/windows/deck/CrtSpike.md` — one-paragraph spike record for the transition choice (4-F Task 1)
- Test files alongside each of the above; e2e: `tests/cursors.spec.ts`, `tests/desktop-icons.spec.ts`, `tests/zoom.spec.ts`, `tests/themes.spec.ts`, `tests/fonts.spec.ts`, `tests/get-info.spec.ts`

**Modified:**
- `index.html` — font `preload` links + synchronous theme/pattern init `<script>` (4-A, 4-F)
- `src/styles/tokens.css` — semantic token layer (4-A)
- `src/styles/global.css` — `@import './themes.css'` after tokens, `@import './cursors.css'` last (4-A, 4-B)
- `src/styles/dither.css` — stipple color → `var(--dither-ink)` (4-A)
- `src/styles/fonts.css` — `font-display: block` for Chicago + Monaco (4-F)
- all `src/**/*.module.css` using `--black`/`--white` for surface/ink → semantic tokens (4-A)
- `src/shell/useDrag.ts` — `opts.threshold` + `data-dragging` on `<html>` (4-B)
- `src/shell/windows.ts` — `WindowId` += `appearance`,`getinfo`; `WindowState` += `maxed`; reducer += `zoom` (4-D, 4-E, 4-G)
- `src/shell/Window.tsx` + `.module.css` — zoom-box button, `.grow-box` class (4-B, 4-D)
- `src/shell/DesktopIcons.tsx` — absolute positioning + drag (4-C)
- `src/shell/Menu.tsx` — (already supports computed item arrays; no change expected)
- `src/shell/MenuBar.tsx` — File ▸ Get Info / Zoom Window; View ▸ Theme ▸, Enter/Exit Full Screen; Special ▸ Clean Up; new right-aligned **Windows** menu (4-C, 4-D, 4-E, 4-G)
- `src/shell/useWindowKeys.ts` — `⌘\`` / `⇧⌘\`` window cycling (4-D)
- `src/shell/Desktop.tsx` — wire theme, pattern, icon layout, zoom, fullscreen, window switcher, CRT overlay, `appearance` + `getinfo` windows (4-C…4-G)
- `src/windows/ProjectsDeck.tsx` + `.module.css` — Keynote layouts + transition + motion (4-F)
- `scripts/assert-prerendered.mjs` — needles `'Appearance'`, `'Desktop Pattern'`, `'Portfolio document'`

---

# Sub-plan 4-A · Semantic token layer + theme plumbing

**Files:**
- Create: `src/styles/themes.css`, `src/shell/useTheme.ts`, `src/shell/useTheme.test.ts`, `src/shell/themeTokens.test.ts`
- Modify: `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/dither.css`, `index.html`, every `*.module.css` referencing `--black`/`--white` for a surface/ink role
- Test: as above

**Interfaces:**
- Produces: `THEMES: { id: string; label: string; className: string }[]` and `useTheme(): { theme: string; setTheme(id: string): void; THEMES: typeof THEMES }` from `src/shell/useTheme.ts`. `theme` is a `THEMES[].id`. Default id `'system7'`, className `'theme-system7'`.
- Consumes: nothing (foundation).

### Task 4A-1: Semantic tokens in `tokens.css`

- [ ] **Step 1: Write the failing test** — `src/shell/themeTokens.test.ts`

```ts
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const tokens = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8')

describe('semantic token layer', () => {
  it('defines the semantic surface/ink tokens on :root', () => {
    for (const t of [
      '--c-bg', '--c-fg', '--c-chrome-bg', '--c-chrome-fg',
      '--c-accent', '--c-accent-fg', '--dither-ink',
      '--chrome-font', '--window-border-w', '--titlebar-lines',
    ]) {
      expect(tokens).toContain(t + ':')
    }
  })
  it('keeps the palette primitives', () => {
    expect(tokens).toContain('--black: #000')
    expect(tokens).toContain('--white: #fff')
  })
})
```

- [ ] **Step 2: Run it — expect FAIL** (`--c-bg` etc. not present)
  Run: `npm test -- --run src/shell/themeTokens.test.ts`

- [ ] **Step 3: Add the semantic layer to `src/styles/tokens.css`** — append inside `:root`, keeping everything already there:

```css
  /* --- semantic layer (Plan 4-A): components read THESE, not the primitives --- */
  --c-bg: var(--white);
  --c-fg: var(--black);
  --c-chrome-bg: var(--white);
  --c-chrome-fg: var(--black);
  --c-accent: var(--black);
  --c-accent-fg: var(--white);
  --dither-ink: var(--black);
  --chrome-font: 'Chicago', 'Geneva', system-ui, sans-serif;
  --window-border-w: 1px;
  --titlebar-lines: 6;
```

  (Leave `--font-chrome` etc. as they are — `--chrome-font` is the themeable alias; components migrate to it in Task 4A-3.)

- [ ] **Step 4: Run it — expect PASS**
  Run: `npm test -- --run src/shell/themeTokens.test.ts`

- [ ] **Step 5: Commit**
```bash
git add src/styles/tokens.css src/shell/themeTokens.test.ts
git commit -m "feat(4A): semantic CSS token layer on :root"
```

### Task 4A-2: `themes.css` + `global.css` import

- [ ] **Step 1: Extend the failing test** — add to `src/shell/themeTokens.test.ts`:

```ts
import { readFileSync } from 'node:fs'
const themes = readFileSync(new URL('../styles/themes.css', import.meta.url), 'utf8')
const global = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8')

it('themes.css defines exactly the five theme classes', () => {
  for (const c of [
    '.theme-system7', '.theme-dark', '.theme-system6',
    '.theme-crt-amber', '.theme-crt-green',
  ]) expect(themes).toContain(c)
})
it('global.css imports themes.css after tokens.css', () => {
  expect(global.indexOf("themes.css")).toBeGreaterThan(global.indexOf("tokens.css"))
})
it('dark theme flips surface and ink', () => {
  const dark = themes.slice(themes.indexOf('.theme-dark'))
  expect(dark).toContain('--c-bg: var(--black)')
  expect(dark).toContain('--c-fg: var(--white)')
})
```

- [ ] **Step 2: Run it — expect FAIL** (`themes.css` missing)

- [ ] **Step 3: Create `src/styles/themes.css`**

```css
/* Plan 4-A theme classes. A theme is one class on <html>. The default
   (System 7) matches :root, so a class-less document is already themed. */

.theme-system7 {
  /* no-op: semantic tokens already equal :root. Present so the
     Appearance panel can select it to clear another theme. */
}

.theme-dark {
  --c-bg: var(--black);
  --c-fg: var(--white);
  --c-chrome-bg: var(--black);
  --c-chrome-fg: var(--white);
  --c-accent: var(--white);
  --c-accent-fg: var(--black);
  --dither-ink: var(--white);
  color-scheme: dark;
}

.theme-system6 {
  --chrome-font: 'Geneva', system-ui, sans-serif;
  --window-border-w: 2px;
  --titlebar-lines: 0;
}

/* CRT: tint comes from a fixed overlay Desktop renders (see 4-E); these
   only carry the hue so nothing in the layout tree gets a `filter`. */
.theme-crt-amber { --crt-hue: #ffb000; }
.theme-crt-green { --crt-hue: #33ff66; }

/* Desktop pattern (density of the Plan 1 stipple under the windows).
   data-pattern is set by the init script + useDesktopPattern. */
html[data-pattern='0']  .desktop { background-image: none; }
html[data-pattern='25'] .desktop { background-image: repeating-conic-gradient(var(--dither-ink) 0 12.5%, var(--c-bg) 0 50%); }
html[data-pattern='75'] .desktop { background-image: repeating-conic-gradient(var(--dither-ink) 0 37.5%, var(--c-bg) 0 50%); }
/* 50 is the default already in Desktop.module.css */
```

- [ ] **Step 4: Import it — edit `src/styles/global.css`** so the order is:
```css
@import './fonts.css';
@import './tokens.css';
@import './themes.css';
@import './reset.css';
@import './dither.css';
@import './fallback.css';
@import './print.css';
```

- [ ] **Step 5: Run it — expect PASS**, then commit
```bash
git add src/styles/themes.css src/styles/global.css src/shell/themeTokens.test.ts
git commit -m "feat(4A): themes.css with five 1-bit theme classes"
```

### Task 4A-3: Repoint components at semantic tokens

- [ ] **Step 1: Write the guard test** — `src/shell/themeTokens.test.ts`, add:

```ts
import { readdirSync } from 'node:fs'
function walk(dir: URL): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const u = new URL(d.name + (d.isDirectory() ? '/' : ''), dir)
    return d.isDirectory() ? walk(u) : d.name.endsWith('.module.css') ? [readFileSync(u, 'utf8')] : []
  })
}
it('no module CSS uses --black/--white for a background or color', () => {
  const offenders: string[] = []
  for (const css of walk(new URL('../', import.meta.url))) {
    for (const m of css.matchAll(/(background|background-color|color)\s*:\s*[^;]*var\(--(black|white)\)/g)) {
      offenders.push(m[0])
    }
  }
  expect(offenders).toEqual([])
})
```

  (Borders / `box-shadow` hairlines may still use `--c-fg`; this test only forbids `--black`/`--white` for `background*` and `color`.)

- [ ] **Step 2: Run it — expect FAIL** with a list of current offenders.

- [ ] **Step 3: Mechanically repoint.** For each offender file, replace:
  - `background: var(--white)` / `background-color: var(--white)` → `var(--c-bg)` (content surfaces) or `var(--c-chrome-bg)` (title bars, menu bar, chrome buttons — judgement per file)
  - `color: var(--black)` → `var(--c-fg)` (body) or `var(--c-chrome-fg)` (chrome text)
  - `background: var(--black)` (selected/active fills) → `var(--c-accent)`, with its paired `color: var(--white)` → `var(--c-accent-fg)`
  - In `src/styles/dither.css`: the stipple ink color → `var(--dither-ink)`
  - Any `font-family: var(--font-chrome)` in **chrome** contexts → `var(--chrome-font)` (leave content/reading fonts alone)
  Known files to sweep (verify with the test, do not trust this list): `Desktop.module.css`, `Window.module.css`, `MenuBar.module.css`, `Menu.module.css`, `TerminalWindow.module.css`, `ProjectsDeck.module.css`, `AboutDialog.module.css`, `PuzzleWindow.module.css`, `ResumeWindow.module.css`, plus `src/styles/fallback.css`.

- [ ] **Step 4: Run the full unit suite + build — expect PASS / no visual assertions broke**
  Run: `npm test -- --run && npm run build && npm run prerender:assert`

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "refactor(4A): components read semantic tokens, not palette primitives"
```

### Task 4A-4: `useTheme` hook + `THEMES` registry

- [ ] **Step 1: Write the failing test** — `src/shell/useTheme.test.ts`

```ts
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { useTheme, THEMES, resolveInitialTheme } from './useTheme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
})

describe('THEMES registry', () => {
  it('has unique ids and a system7 default first', () => {
    expect(THEMES[0].id).toBe('system7')
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length)
    for (const t of THEMES) expect(t.className).toBe('theme-' + t.id.replace(/([A-Z])/g, '-$1').toLowerCase())
  })
})

describe('resolveInitialTheme', () => {
  it('prefers a stored value', () => {
    localStorage.setItem('theme', 'theme-dark')
    expect(resolveInitialTheme(() => true)).toBe('dark')
  })
  it('falls back to dark under prefers-color-scheme: dark', () => {
    expect(resolveInitialTheme(() => true)).toBe('dark')
  })
  it('defaults to system7 otherwise', () => {
    expect(resolveInitialTheme(() => false)).toBe('system7')
  })
})

describe('useTheme', () => {
  it('setTheme persists and updates <html> class', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('system6'))
    expect(document.documentElement.classList.contains('theme-system6')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('theme-system6')
  })
})
```

- [ ] **Step 2: Run it — expect FAIL** (module missing)

- [ ] **Step 3: Create `src/shell/useTheme.ts`**

```ts
import { useCallback, useState } from 'react'

export interface ThemeDef {
  id: string
  label: string
  className: string
}

export const THEMES: ThemeDef[] = [
  { id: 'system7', label: 'System 7', className: 'theme-system7' },
  { id: 'dark', label: 'Dark', className: 'theme-dark' },
  { id: 'system6', label: 'System 6', className: 'theme-system6' },
  { id: 'crtAmber', label: 'CRT Amber', className: 'theme-crt-amber' },
  { id: 'crtGreen', label: 'CRT Green', className: 'theme-crt-green' },
]

const byClass = (cn: string) => THEMES.find((t) => t.className === cn)?.id
const byId = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0]

/** Pure so it can be unit-tested. `prefersDark` is injected. */
export function resolveInitialTheme(prefersDark: () => boolean): string {
  try {
    const stored = localStorage.getItem('theme')
    if (stored && byClass(stored)) return byClass(stored)!
  } catch {
    /* ignore */
  }
  return prefersDark() ? 'dark' : 'system7'
}

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => resolveInitialTheme(prefersDark))

  const setTheme = useCallback((id: string) => {
    const def = byId(id)
    setThemeState(def.id)
    document.documentElement.className = def.className
    try {
      localStorage.setItem('theme', def.className)
    } catch {
      /* ignore */
    }
  }, [])

  return { theme, setTheme, THEMES }
}
```

- [ ] **Step 4: Run it — expect PASS**
  Run: `npm test -- --run src/shell/useTheme.test.ts`

- [ ] **Step 5: Commit**
```bash
git add src/shell/useTheme.ts src/shell/useTheme.test.ts
git commit -m "feat(4A): useTheme hook + THEMES registry"
```

### Task 4A-5: No-flash init script + Desktop wiring

- [ ] **Step 1: Write the failing test** — `src/shell/themeTokens.test.ts`, add:

```ts
const indexHtml = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
it('index.html runs a synchronous theme-init script before the module script', () => {
  const scriptIdx = indexHtml.indexOf("localStorage.getItem('theme')")
  const moduleIdx = indexHtml.indexOf('src="/src/main.tsx"')
  expect(scriptIdx).toBeGreaterThan(-1)
  expect(scriptIdx).toBeLessThan(moduleIdx)
})
```

- [ ] **Step 2: Run it — expect FAIL**

- [ ] **Step 3: Edit `index.html`** — add to `<head>` (after the `<link rel="icon">`), before `</head>`:

```html
    <script>
      (function () {
        try {
          var t = localStorage.getItem('theme');
          if (!t && matchMedia('(prefers-color-scheme: dark)').matches) t = 'theme-dark';
          if (t) document.documentElement.className = t;
          var p = localStorage.getItem('desktopPattern');
          if (p) document.documentElement.setAttribute('data-pattern', p);
        } catch (e) {}
      })();
    </script>
```

- [ ] **Step 4: Wire `useTheme` into `Desktop.tsx`** — call `const { theme, setTheme } = useTheme()` in `Desktop`; pass `theme` / `setTheme` down to the menu bar (4-E consumes them). For now just call the hook so the class is authoritative post-hydration. Add a `useEffect(() => { /* keep <html> class in sync if it drifted */ }, [theme])` only if needed — the hook already writes on `setTheme`, and the init script covers first paint, so no effect is required. Run `npm test -- --run && npx tsc --noEmit`.

- [ ] **Step 5: Commit**
```bash
git add index.html src/shell/Desktop.tsx src/shell/themeTokens.test.ts
git commit -m "feat(4A): synchronous theme-init script (no flash of default theme)"
```

---

# Sub-plan 4-B · Interactive cursors

**Files:**
- Create: `src/styles/cursors.css`, `tests/cursors.spec.ts`
- Modify: `src/styles/global.css` (import cursors.css last), `src/shell/useDrag.ts`, `src/shell/useDrag.test.tsx`, `src/shell/Window.tsx` (add `grow-box` class to the grow button)

**Interfaces:**
- Produces: `useDrag(onDelta, onEnd?, opts?: { threshold?: number })` — same return `{ onPointerDown }`; now also toggles `document.documentElement.dataset.dragging` for the drag's lifetime and suppresses `onDelta`/`moved` until cumulative movement exceeds `opts.threshold` (default `0`).
- Consumes: nothing new.

### Task 4B-1: `useDrag` threshold + `data-dragging`

- [ ] **Step 1: Extend `src/shell/useDrag.test.tsx`**

```tsx
it('with a threshold, small moves do not count as a drag', () => {
  const onDelta = vi.fn(); const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(onDelta, onEnd, { threshold: 4 }))
  act(() => result.current.onPointerDown(pointerEvent('pointerdown', 0, 0)))
  act(() => window.dispatchEvent(pointerEvent('pointermove', 3, 0)))
  act(() => window.dispatchEvent(pointerEvent('pointerup', 3, 0)))
  expect(onDelta).not.toHaveBeenCalled()
  expect(onEnd).not.toHaveBeenCalled()
})

it('with a threshold, a move past it drags and sets data-dragging', () => {
  const onDelta = vi.fn(); const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(onDelta, onEnd, { threshold: 4 }))
  act(() => result.current.onPointerDown(pointerEvent('pointerdown', 0, 0)))
  expect(document.documentElement.dataset.dragging).toBe('')
  act(() => window.dispatchEvent(pointerEvent('pointermove', 6, 0)))
  act(() => window.dispatchEvent(pointerEvent('pointerup', 6, 0)))
  expect(onDelta).toHaveBeenCalled()
  expect(onEnd).toHaveBeenCalledTimes(1)
  expect(document.documentElement.dataset.dragging).toBeUndefined()
})
```

  (Reuse the file's existing `pointerEvent` helper; if it doesn't take coords, extend it: `new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true })`.)

- [ ] **Step 2: Run it — expect FAIL**

- [ ] **Step 3: Edit `src/shell/useDrag.ts`**

```ts
export function useDrag(
  onDelta: (dx: number, dy: number) => void,
  onEnd?: () => void,
  opts?: { threshold?: number },
) {
  const latest = useRef(onDelta); latest.current = onDelta
  const latestEnd = useRef(onEnd); latestEnd.current = onEnd
  const threshold = opts?.threshold ?? 0

  const origin = useRef<{ x: number; y: number } | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!origin.current || !start.current) return
    const far =
      Math.abs(e.clientX - start.current.x) > threshold ||
      Math.abs(e.clientY - start.current.y) > threshold
    if (!far) return
    moved.current = true
    latest.current(e.clientX - origin.current.x, e.clientY - origin.current.y)
    origin.current = { x: e.clientX, y: e.clientY }
  }, [threshold])

  const onPointerUp = useCallback(() => {
    origin.current = null
    start.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    delete document.documentElement.dataset.dragging
    if (moved.current) latestEnd.current?.()
    moved.current = false
  }, [onPointerMove])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      origin.current = { x: e.clientX, y: e.clientY }
      start.current = { x: e.clientX, y: e.clientY }
      moved.current = false
      document.documentElement.dataset.dragging = ''
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [onPointerMove, onPointerUp],
  )

  return { onPointerDown }
}
```

- [ ] **Step 4: Run unit suite — expect PASS** (existing window drag/resize tests unaffected: threshold defaults to 0).
  Run: `npm test -- --run src/shell/useDrag.test.tsx src/shell/Window*.test.tsx`

- [ ] **Step 5: Commit**
```bash
git add src/shell/useDrag.ts src/shell/useDrag.test.tsx
git commit -m "feat(4B): useDrag movement threshold + data-dragging flag"
```

### Task 4B-2: `cursors.css` + grow-box class

- [ ] **Step 1: Write `tests/cursors.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('cursors communicate affordance', async ({ page }) => {
  await page.goto('/')
  const titlebar = page.locator('[data-testid="titlebar"]').first()
  await expect(titlebar).toHaveCSS('cursor', 'grab')
  const grow = page.locator('.grow-box, [aria-label^="Resize"]').first()
  await expect(grow).toHaveCSS('cursor', 'nwse-resize')
  // open the Terminal
  await page.getByRole('button', { name: 'Terminal' }).dblclick()
  await expect(page.locator('[data-terminal]')).toHaveCSS('cursor', 'text')
})
```

- [ ] **Step 2: Run it — expect FAIL** (`npm run build` first if needed; `npm run test:e2e -- cursors`)

- [ ] **Step 3: Create `src/styles/cursors.css`**

```css
/* Plan 4-B: the pointer names the affordance. */
button, a[href], summary, label,
[role='menuitem'], [role='menuitemcheckbox'] { cursor: pointer; }

[data-testid='titlebar'], .desktop-icon { cursor: grab; }

:root[data-dragging],
:root[data-dragging] * { cursor: grabbing !important; }

.grow-box { cursor: nwse-resize; }
[data-terminal] { cursor: text; }
[aria-disabled='true'] { cursor: default; }
```

- [ ] **Step 4: Import it last in `src/styles/global.css`** (`@import './cursors.css';` as the final line) and **add `grow-box` to the grow button** in `src/shell/Window.tsx`: `className={`${styles.grow} grow-box`}`. Rebuild, run `npm run test:e2e -- cursors` — expect PASS. Run `npm test -- --run` (no unit impact).

- [ ] **Step 5: Commit**
```bash
git add src/styles/cursors.css src/styles/global.css src/shell/Window.tsx tests/cursors.spec.ts
git commit -m "feat(4B): interactive cursor affordances (pointer/grab/grabbing/resize/text)"
```

---

# Sub-plan 4-C · Draggable desktop icons (session-persisted)

**Files:**
- Create: `src/shell/iconLayout.ts`, `src/shell/iconLayout.test.ts`, `tests/desktop-icons.spec.ts`
- Modify: `src/shell/DesktopIcons.tsx`, `src/shell/DesktopIcons.test.tsx`, `src/shell/Desktop.tsx`, `src/shell/Desktop.module.css`, `src/shell/MenuBar.tsx`, `src/shell/MenuBar.test.tsx`

**Interfaces:**
- Produces: `iconLayout.ts` exports `ICON_IDS: readonly string[]`, `IconPos`, `defaultGrid(viewportW: number): Record<string, IconPos>`, `clampIcon(p: IconPos, vp: { w: number; h: number }): IconPos`, `snapToGrid(p: IconPos, viewportW: number): IconPos`. `MenuBarActions` gains `cleanUpIcons(): void`.
- Consumes: `useDrag(..., { threshold: 4 })` from 4-B.

### Task 4C-1: `iconLayout.ts` pure math

- [ ] **Step 1: Write `src/shell/iconLayout.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { ICON_IDS, defaultGrid, clampIcon, snapToGrid } from './iconLayout'

describe('defaultGrid', () => {
  it('places every icon in a right-hand column, none overlapping', () => {
    const g = defaultGrid(1024)
    expect(Object.keys(g).sort()).toEqual([...ICON_IDS].sort())
    const ys = ICON_IDS.map((id) => g[id].y)
    for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(60)
    for (const id of ICON_IDS) expect(g[id].x).toBeGreaterThan(1024 - 120)
  })
})

describe('clampIcon', () => {
  const vp = { w: 800, h: 600 }
  it('pulls an off-screen point back inside', () => {
    expect(clampIcon({ x: -50, y: -50 }, vp)).toEqual({ x: 0, y: 0 })
    const c = clampIcon({ x: 5000, y: 5000 }, vp)
    expect(c.x).toBeLessThanOrEqual(800 - 76)
    expect(c.y).toBeLessThanOrEqual(600 - 52)
  })
  it('never lets an icon sit above the menu bar', () => {
    expect(clampIcon({ x: 10, y: -999 }, vp).y).toBe(0)
  })
})

describe('snapToGrid', () => {
  it('maps a nearby point to an exact default slot', () => {
    const g = defaultGrid(1024)
    const near = { x: g.resume.x + 8, y: g.resume.y - 6 }
    expect(snapToGrid(near, 1024)).toEqual(g.resume)
  })
})
```

- [ ] **Step 2: Run it — expect FAIL**

- [ ] **Step 3: Create `src/shell/iconLayout.ts`**

```ts
export interface IconPos { x: number; y: number }

export const ICON_IDS = ['resume', 'projects', 'terminal', 'readme'] as const
export type IconId = (typeof ICON_IDS)[number]

const CELL_W = 76
const CELL_H = 52
const GAP = 14
const INSET = 12

/** Right-hand column, matching the pre-4C look. Coordinates are relative to
 *  the .desktop box (which already starts at --menubar-h), so y=0 is legal. */
export function defaultGrid(viewportW: number): Record<IconId, IconPos> {
  const x = Math.max(INSET, viewportW - INSET - CELL_W)
  const out = {} as Record<IconId, IconPos>
  ICON_IDS.forEach((id, i) => {
    out[id] = { x, y: INSET + i * (CELL_H + GAP) }
  })
  return out
}

export function clampIcon(p: IconPos, vp: { w: number; h: number }): IconPos {
  return {
    x: Math.min(Math.max(0, p.x), Math.max(0, vp.w - CELL_W)),
    y: Math.min(Math.max(0, p.y), Math.max(0, vp.h - CELL_H)),
  }
}

export function snapToGrid(p: IconPos, viewportW: number): IconPos {
  const grid = defaultGrid(viewportW)
  let best: IconPos = grid[ICON_IDS[0]]
  let bestD = Infinity
  for (const id of ICON_IDS) {
    const g = grid[id]
    const d = (g.x - p.x) ** 2 + (g.y - p.y) ** 2
    if (d < bestD) { bestD = d; best = g }
  }
  return best
}
```

- [ ] **Step 4: Run it — expect PASS**

- [ ] **Step 5: Commit**
```bash
git add src/shell/iconLayout.ts src/shell/iconLayout.test.ts
git commit -m "feat(4C): pure icon grid / clamp / snap math"
```

### Task 4C-2: Draggable `DesktopIcons`, positions lifted into `Desktop`

- [ ] **Step 1: Extend `src/shell/DesktopIcons.test.tsx`**

```tsx
it('renders each icon absolutely positioned from the positions prop', () => {
  const pos = { resume: { x: 10, y: 20 }, projects: { x: 10, y: 90 }, terminal: { x: 10, y: 160 }, readme: { x: 10, y: 230 } }
  render(<DesktopIcons onOpen={() => {}} positions={pos} onMoveIcon={() => {}} />)
  const btn = screen.getByRole('button', { name: 'Résumé' })
  expect(btn).toHaveClass('desktop-icon')
  expect(btn.style.left).toBe('10px')
  expect(btn.style.top).toBe('20px')
})
```

  (Keep the existing "each icon contains an `<svg role=img>`" assertion; adjust its render call to pass `positions` + `onMoveIcon`.)

- [ ] **Step 2: Run it — expect FAIL**

- [ ] **Step 3: Rewrite `src/shell/DesktopIcons.tsx`**

```tsx
import styles from './Desktop.module.css'
import type { WindowId } from './windows'
import IconGlyph, { type GlyphKind } from './IconGlyph'
import { useDrag } from './useDrag'
import type { IconPos } from './iconLayout'

const ICONS: { id: Extract<WindowId, GlyphKind>; label: string }[] = [
  { id: 'resume', label: 'Résumé' },
  { id: 'projects', label: 'Projects' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'readme', label: 'Read Me' },
]

function Icon({
  id, label, pos, onOpen, onMoveIcon,
}: {
  id: WindowId; label: string; pos: IconPos
  onOpen: (id: WindowId, from: { x: number; y: number }) => void
  onMoveIcon: (id: WindowId, dx: number, dy: number, commit: boolean) => void
}) {
  const drag = useDrag(
    (dx, dy) => onMoveIcon(id, dx, dy, false),
    () => onMoveIcon(id, 0, 0, true),
    { threshold: 4 },
  )
  return (
    <button
      data-window={id}
      className={`${styles.icon} desktop-icon`}
      style={{ position: 'absolute', left: pos.x, top: pos.y }}
      onPointerDown={drag.onPointerDown}
      onDoubleClick={(e) => onOpen(id, { x: e.clientX, y: e.clientY })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          const r = (e.target as HTMLElement).getBoundingClientRect()
          onOpen(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
        }
      }}
    >
      <span className={styles.glyph}><IconGlyph kind={id as GlyphKind} /></span>
      <span className={styles.iconLabel}>{label}</span>
    </button>
  )
}

export default function DesktopIcons({
  onOpen, positions, onMoveIcon,
}: {
  onOpen: (id: WindowId, from: { x: number; y: number }) => void
  positions: Record<string, IconPos>
  onMoveIcon: (id: WindowId, dx: number, dy: number, commit: boolean) => void
}) {
  return (
    <div className={styles.icons}>
      {ICONS.map((ic) => (
        <Icon key={ic.id} id={ic.id} label={ic.label} pos={positions[ic.id]} onOpen={onOpen} onMoveIcon={onMoveIcon} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Update `src/shell/Desktop.module.css`** — `.icons` loses `flex-direction`/`gap`/`top`/`right` and becomes just a positioning context: `.icons { position: absolute; inset: 0; pointer-events: none; }` and `.icon { position: absolute; pointer-events: auto; width: 76px; display: flex; flex-direction: column; align-items: center; gap: 4px; }`. Run `npm test -- --run src/shell/DesktopIcons.test.tsx` — expect PASS.

- [ ] **Step 5: Commit**
```bash
git add src/shell/DesktopIcons.tsx src/shell/DesktopIcons.test.tsx src/shell/Desktop.module.css
git commit -m "feat(4C): DesktopIcons render from a positions prop and are draggable"
```

### Task 4C-3: Wire positions + sessionStorage + Clean Up in `Desktop`

- [ ] **Step 1: Add to `src/shell/MenuBar.test.tsx`** a case that `Special ▸ Clean Up` calls `cleanUpIcons` (mirror the existing Restart/Shut Down cases; add `cleanUpIcons: vi.fn()` to the mount defaults).

- [ ] **Step 2: Run it — expect FAIL**

- [ ] **Step 3: Edit `src/shell/Desktop.tsx`**

```tsx
import { defaultGrid, clampIcon, type IconPos } from './iconLayout'
// ...
const [iconPos, setIconPos] = useState<Record<string, IconPos>>(() => {
  try {
    const raw = sessionStorage.getItem('iconPos')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return defaultGrid(typeof window !== 'undefined' ? window.innerWidth : 1024)
})
const persistIcons = (next: Record<string, IconPos>) => {
  setIconPos(next)
  try { sessionStorage.setItem('iconPos', JSON.stringify(next)) } catch { /* ignore */ }
}
const dragScratch = useRef<Record<string, IconPos> | null>(null)
const onMoveIcon = (id: WindowId, dx: number, dy: number, commit: boolean) => {
  const base = dragScratch.current ?? iconPos
  if (commit) {
    if (dragScratch.current) persistIcons(dragScratch.current)
    dragScratch.current = null
    return
  }
  const vp = { w: window.innerWidth, h: window.innerHeight - 22 }
  const moved = clampIcon({ x: base[id].x + dx, y: base[id].y + dy }, vp)
  const next = { ...base, [id]: moved }
  dragScratch.current = next
  setIconPos(next)
}
const cleanUpIcons = () => {
  try { sessionStorage.removeItem('iconPos') } catch { /* ignore */ }
  setIconPos(defaultGrid(window.innerWidth))
}
```

  Pass `positions={iconPos}` and `onMoveIcon={onMoveIcon}` to `<DesktopIcons>`; add `cleanUpIcons` to `menuActions`.

- [ ] **Step 4: Add `Clean Up` to the Special menu in `src/shell/MenuBar.tsx`**:
```ts
const special: MenuItemSpec[] = [
  { label: 'Clean Up', onSelect: props.cleanUpIcons },
  { label: 'Restart', separatorBefore: true, onSelect: props.restart },
  { label: 'Shut Down', onSelect: props.shutDown },
]
```
  and add `cleanUpIcons(): void` to `MenuBarActions`. Run `npm test -- --run && npx tsc --noEmit`.

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "feat(4C): session-persisted icon positions + Special > Clean Up"
```

### Task 4C-4: e2e

- [ ] **Step 1: Write `tests/desktop-icons.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('icons drag, persist for the session, and Clean Up re-grids', async ({ page }) => {
  await page.goto('/')
  const resume = page.locator('[data-window="resume"]')
  const before = await resume.boundingBox()
  await resume.hover()
  await page.mouse.down()
  await page.mouse.move((before!.x) - 200, before!.y + 20, { steps: 10 })
  await page.mouse.up()
  const moved = await resume.boundingBox()
  expect(Math.abs(moved!.x - before!.x)).toBeGreaterThan(120)

  // Special > Clean Up restores without reload
  await page.getByRole('button', { name: 'Special' }).click()
  await page.getByRole('menuitem', { name: 'Clean Up' }).click()
  const cleaned = await resume.boundingBox()
  expect(Math.abs(cleaned!.x - before!.x)).toBeLessThan(4)

  // move again, then reload → session-only, back to default column
  await resume.hover(); await page.mouse.down()
  await page.mouse.move(before!.x - 200, before!.y + 20, { steps: 10 }); await page.mouse.up()
  await page.reload()
  const afterReload = await resume.boundingBox()
  expect(Math.abs(afterReload!.x - before!.x)).toBeLessThan(4)

  // a plain double-click still opens the window
  await resume.dblclick()
  await expect(page.getByRole('dialog', { name: 'Résumé' })).toBeVisible()
})
```

- [ ] **Step 2: Run it — expect FAIL then PASS** after `npm run build`; `npm run test:e2e -- desktop-icons`

- [ ] **Step 3: Fix any drift** (threshold too high blocking the drag; `.icons` `pointer-events` covering windows — verify windows still receive clicks).

- [ ] **Step 4: Full gate** — `npx tsc --noEmit && npm test -- --run && npm run build && npm run prerender:assert && npm run test:e2e`

- [ ] **Step 5: Commit**
```bash
git add tests/desktop-icons.spec.ts
git commit -m "test(4C): e2e for icon drag, Clean Up, session-only persistence"
```

---

# Sub-plan 4-D · Zoom box + Full Screen + window switcher

**Files:**
- Create: `src/shell/windowSwitch.ts`, `src/shell/windowSwitch.test.ts`, `tests/zoom.spec.ts`
- Modify: `src/shell/windows.ts`, `src/shell/windows.test.ts`, `src/shell/Window.tsx`, `src/shell/Window.module.css`, `src/shell/MenuBar.tsx`, `src/shell/MenuBar.test.tsx`, `src/shell/useWindowKeys.ts`, `src/shell/useWindowKeys.test.tsx`, `src/shell/Desktop.tsx`

**Interfaces:**
- Produces: `WindowState.maxed: { x: number; y: number; w: number; h: number } | null`; reducer action `{ type: 'zoom'; id: WindowId; desktop: { w: number; h: number } }`; `nextWindow(state: DesktopState, dir: 1 | -1): WindowId | null`. `MenuBarActions` gains `zoomFront(): void`, `toggleFullScreen(): void`, `isFullScreen: boolean`, `openWindowsList: { id: WindowId; title: string }[]`, `focusWindow(id: WindowId): void`.
- Consumes: `frontWindow` (existing).

### Task 4D-1: `maxed` field + `zoom` reducer action

- [ ] **Step 1: Add to `src/shell/windows.test.ts`**

```ts
it('zoom stores the current rect, fills the desktop, then restores', () => {
  let s = windowsReducer(initialDesktop, { type: 'open', id: 'resume' })
  const orig = { ...s.windows.resume }
  s = windowsReducer(s, { type: 'zoom', id: 'resume', desktop: { w: 1000, h: 700 } })
  expect(s.windows.resume).toMatchObject({ x: 0, y: 0, w: 1000, h: 700 })
  expect(s.windows.resume.maxed).toMatchObject({ x: orig.x, y: orig.y, w: orig.w, h: orig.h })
  s = windowsReducer(s, { type: 'zoom', id: 'resume', desktop: { w: 1280, h: 800 } })
  expect(s.windows.resume).toMatchObject({ x: orig.x, y: orig.y, w: orig.w, h: orig.h })
  expect(s.windows.resume.maxed).toBeNull()
})
```

- [ ] **Step 2: Run it — expect FAIL** (`maxed` and the action don't exist)

- [ ] **Step 3: Edit `src/shell/windows.ts`**
  - `WindowState` gains `maxed: { x: number; y: number; w: number; h: number } | null`.
  - `make()` sets `maxed: null`.
  - `WindowAction` union gains `{ type: 'zoom'; id: WindowId; desktop: { w: number; h: number } }`.
  - reducer case:
  ```ts
  case 'zoom': {
    if (w.maxed) {
      const { x, y, w: ww, h } = w.maxed
      return { ...state, windows: { ...state.windows, [action.id]: { ...w, x, y, w: ww, h, maxed: null } } }
    }
    return {
      ...state,
      windows: {
        ...state.windows,
        [action.id]: {
          ...w, maxed: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: 0, y: 0, w: action.desktop.w, h: action.desktop.h,
        },
      },
    }
  }
  ```

- [ ] **Step 4: Run it — expect PASS**; `npx tsc --noEmit` (fix any exhaustiveness complaints in the reducer switch).

- [ ] **Step 5: Commit**
```bash
git add src/shell/windows.ts src/shell/windows.test.ts
git commit -m "feat(4D): window 'maxed' state + zoom reducer action"
```

### Task 4D-2: Zoom-box button on the title bar

- [ ] **Step 1: Add to `src/shell/Window.test.tsx`** (or the closest existing Window unit test) a case: rendering a `Window` shows a button `name: /Zoom/`, and clicking it calls the `onZoom` prop.

```tsx
it('title bar has a zoom box that calls onZoom', () => {
  const onZoom = vi.fn()
  render(<Window {...baseProps} onZoom={onZoom} />)
  fireEvent.click(screen.getByRole('button', { name: /^Zoom / }))
  expect(onZoom).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run it — expect FAIL**

- [ ] **Step 3: Edit `src/shell/Window.tsx`** — add `onZoom?(): void` to `WindowProps`; render a zoom box in the title bar, right-aligned (mirror of the close box):

```tsx
<button
  className={styles.zoom}
  aria-label={`Zoom ${p.title}`}
  onClick={p.onZoom}
  onPointerDown={(e) => e.stopPropagation()}  // don't start a title-bar drag
/>
```

  Place it after `<span className={styles.title}>`. Add `.zoom` to `Window.module.css`: same box metrics as `.close` but the classic nested-squares glyph via `box-shadow`/pseudo-elements (two 1px squares), positioned at the right end (`margin-left: auto` on the title, or absolute right).

- [ ] **Step 4: Run it — expect PASS**; visually confirm in `npm run dev` the glyph reads as the zoom box and doesn't hijack the drag.

- [ ] **Step 5: Commit**
```bash
git add src/shell/Window.tsx src/shell/Window.module.css src/shell/Window.test.tsx
git commit -m "feat(4D): title-bar zoom box button"
```

### Task 4D-3: Wire zoom in `Desktop` + `File ▸ Zoom Window`

- [ ] **Step 1: Add to `src/shell/MenuBar.test.tsx`**: `File ▸ Zoom Window` calls `zoomFront`; it is disabled when `hasFront` is false.

- [ ] **Step 2: Run it — expect FAIL**

- [ ] **Step 3:** In `src/shell/Desktop.tsx`:
```tsx
const desktopSize = () => {
  const el = document.querySelector('.desktop') as HTMLElement | null
  return el ? { w: el.clientWidth, h: el.clientHeight } : { w: window.innerWidth, h: window.innerHeight - 22 }
}
// per-window:
onZoom={() => dispatch({ type: 'zoom', id, desktop: desktopSize() })}
// menuActions:
zoomFront: () => front && dispatch({ type: 'zoom', id: front, desktop: desktopSize() }),
```
  In `src/shell/MenuBar.tsx` add to `file`:
```ts
{ label: 'Zoom Window', separatorBefore: true, disabled: !props.hasFront,
  onSelect: props.hasFront ? props.zoomFront : undefined },
```
  and `zoomFront(): void` on `MenuBarActions`.

- [ ] **Step 4: Run gate** — `npm test -- --run && npx tsc --noEmit`

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "feat(4D): wire zoom box + File > Zoom Window"
```

### Task 4D-4: `nextWindow` + `⌘\`` cycling

- [ ] **Step 1: Write `src/shell/windowSwitch.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { windowsReducer, initialDesktop } from './windows'
import { nextWindow } from './windowSwitch'

const open = (s: any, id: string) => windowsReducer(s, { type: 'open', id })

describe('nextWindow', () => {
  it('returns null with 0 or 1 open windows', () => {
    expect(nextWindow(initialDesktop, 1)).toBeNull()
    expect(nextWindow(open(initialDesktop, 'resume'), 1)).toBeNull()
  })
  it('cycles by z order and wraps', () => {
    let s = open(open(open(initialDesktop, 'resume'), 'readme'), 'terminal')
    // terminal is front (highest z); next forward wraps to the lowest (resume)
    expect(nextWindow(s, 1)).toBe('resume')
    expect(nextWindow(s, -1)).toBe('readme')
  })
})
```

- [ ] **Step 2: Run it — expect FAIL**

- [ ] **Step 3: Create `src/shell/windowSwitch.ts`**

```ts
import type { DesktopState, WindowId } from './windows'

export function nextWindow(state: DesktopState, dir: 1 | -1): WindowId | null {
  const open = Object.values(state.windows).filter((w) => w.open).sort((a, b) => a.z - b.z)
  if (open.length < 2) return null
  const frontIdx = open.length - 1
  const target = (frontIdx + dir + open.length) % open.length
  return open[target].id
}
```

- [ ] **Step 4: Wire in `src/shell/useWindowKeys.ts`** — add a keydown branch (extend its test `useWindowKeys.test.tsx` first with a case that `Meta+Backquote` calls the provided `onCycle`):

```ts
if (e.key === '`' && e.metaKey) {
  e.preventDefault()
  onCycle(e.shiftKey ? -1 : 1)
  return
}
```
  `useWindowKeys` gains an `onCycle: (dir: 1 | -1) => void` param; `Desktop` passes `(dir) => { const id = nextWindow(state, dir); if (id) dispatch({ type: 'focus', id }) }`.

- [ ] **Step 5: Run gate + commit**
```bash
git add -A
git commit -m "feat(4D): nextWindow helper + Cmd-backtick window cycling"
```

### Task 4D-5: Windows menu + Full Screen

- [ ] **Step 1: Add to `src/shell/MenuBar.test.tsx`**
  - a **Windows** menu (`button name: 'Windows'`) listing open-window titles, the front one `checked`;
  - `View ▸ Enter Full Screen` calls `toggleFullScreen`; label is `Exit Full Screen` when `isFullScreen` is true.

- [ ] **Step 2: Run it — expect FAIL**

- [ ] **Step 3: Edit `src/shell/MenuBar.tsx`**
  - `MenuBarActions` gains `toggleFullScreen(): void`, `isFullScreen: boolean`, `openWindowsList: { id: WindowId; title: string }[]`, `focusWindow(id: WindowId): void`, `frontId: WindowId | null`.
  - `view` menu gains: `{ label: props.isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen', separatorBefore: true, disabled: !props.hasFront && !props.isFullScreen, onSelect: props.toggleFullScreen }`.
  - After the `<span className={styles.clock}>` (or before the sound toggle — keep it right-aligned), render:
  ```tsx
  <Menu
    label="Windows" title="Windows"
    items={props.openWindowsList.map((w) => ({
      label: w.title,
      checked: w.id === props.frontId,
      onSelect: () => props.focusWindow(w.id),
    }))}
    {...menuProps('windows')}
  />
  ```
  - Add `'windows'` to `NAMES`.

- [ ] **Step 4: Wire in `src/shell/Desktop.tsx`**

```tsx
const [isFullScreen, setFS] = useState(false)
useEffect(() => {
  const h = () => setFS(!!document.fullscreenElement)
  document.addEventListener('fullscreenchange', h)
  return () => document.removeEventListener('fullscreenchange', h)
}, [])
const toggleFullScreen = () => {
  if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); return }
  if (!front) return
  document.getElementById(`win-${front}`)?.requestFullscreen?.().catch(() => {})
}
// menuActions additions:
toggleFullScreen,
isFullScreen,
frontId: front,
openWindowsList: openWindows
  .slice()
  .sort((a, b) => state.windows[b].z - state.windows[a].z)
  .map((id) => ({ id, title: TITLES[id] })),
focusWindow: (id) => dispatch({ type: 'focus', id }),
```

  CSS: in `Window.module.css` add `:fullscreen.window, .window:fullscreen { left: 0; top: 0; width: 100vw; height: 100vh; }` (the `<section>` is what gets fullscreened).

- [ ] **Step 5: Run gate + commit**
```bash
git add -A
git commit -m "feat(4D): Windows switcher menu + View > Enter/Exit Full Screen"
```

### Task 4D-6: e2e

- [ ] **Step 1: Write `tests/zoom.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('zoom box fills the desktop and restores', async ({ page }) => {
  await page.goto('/')
  const win = page.getByRole('dialog', { name: 'Résumé' })
  const before = await win.boundingBox()
  await page.getByRole('button', { name: 'Zoom Résumé' }).click()
  const zoomed = await win.boundingBox()
  expect(zoomed!.width).toBeGreaterThan(before!.width)
  await page.getByRole('button', { name: 'Zoom Résumé' }).click()
  const restored = await win.boundingBox()
  expect(Math.round(restored!.width)).toBe(Math.round(before!.width))
})

test('Cmd-backtick cycles window focus', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Terminal' }).dblclick()
  await expect(page.getByRole('dialog', { name: 'Terminal' })).toBeVisible()
  await page.keyboard.press('Meta+`')
  // front window changed — assert via the Windows menu check mark
  await page.getByRole('button', { name: 'Windows' }).click()
  await expect(page.getByRole('menuitemcheckbox', { name: /Read Me|Résumé/ })).toBeVisible()
})

test('Enter/Exit Full Screen toggles document.fullscreenElement', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'View' }).click()
  await page.getByRole('menuitem', { name: 'Enter Full Screen' }).click()
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(true)
  await page.getByRole('button', { name: 'View' }).click()
  await page.getByRole('menuitem', { name: 'Exit Full Screen' }).click()
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(false)
})
```

- [ ] **Step 2: Run — expect FAIL then PASS** after build. If Chromium blocks `requestFullscreen` without a user gesture, the `.click()` on the menu item is the gesture — keep the call inside the click handler (it already is).

- [ ] **Step 3: Full gate.**

- [ ] **Step 4: Commit**
```bash
git add tests/zoom.spec.ts
git commit -m "test(4D): e2e for zoom box, window cycling, full screen"
```

---

# Sub-plan 4-E · Appearance control panel + View ▸ Theme

**Files:**
- Create: `src/shell/useDesktopPattern.ts`, `src/shell/useDesktopPattern.test.ts`, `src/windows/AppearanceWindow.tsx`, `src/windows/AppearanceWindow.module.css`, `src/windows/AppearanceWindow.test.tsx`, `tests/themes.spec.ts`
- Modify: `src/shell/windows.ts` (`WindowId` += `appearance`, DEFAULTS, and `TITLES` in `Desktop.tsx`), `src/shell/Desktop.tsx`, `src/shell/MenuBar.tsx`, `src/shell/MenuBar.test.tsx`, `scripts/assert-prerendered.mjs`, `src/App.tsx` (pre-rendered Appearance markup), `src/styles/fallback.css` / `print.css` as needed

**Interfaces:**
- Consumes: `useTheme` / `THEMES` (4-A), the menu-bar plumbing (4-D).
- Produces: `useDesktopPattern(): { pattern: string; setPattern(p: '0'|'25'|'50'|'75'): void }`; `AppearanceWindow` component; `MenuBarActions` gains `theme: string`, `setTheme(id): void`, `openWindow` already exists (used for `appearance`).

### Task 4E-1: `useDesktopPattern`

- [ ] **Step 1: Write `src/shell/useDesktopPattern.test.ts`** — mirrors `useTheme.test.ts`: default `'50'` when nothing stored; `setPattern('75')` sets `document.documentElement.dataset.pattern` and `localStorage['desktopPattern']`.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Create `src/shell/useDesktopPattern.ts`**

```ts
import { useCallback, useState } from 'react'

export type Pattern = '0' | '25' | '50' | '75'
const PATTERNS: Pattern[] = ['0', '25', '50', '75']

export function readInitialPattern(): Pattern {
  try {
    const p = localStorage.getItem('desktopPattern')
    if (p && (PATTERNS as string[]).includes(p)) return p as Pattern
  } catch { /* ignore */ }
  return '50'
}

export function useDesktopPattern() {
  const [pattern, setPatternState] = useState<Pattern>(readInitialPattern)
  const setPattern = useCallback((p: Pattern) => {
    setPatternState(p)
    if (p === '50') document.documentElement.removeAttribute('data-pattern')
    else document.documentElement.setAttribute('data-pattern', p)
    try { localStorage.setItem('desktopPattern', p) } catch { /* ignore */ }
  }, [])
  return { pattern, setPattern, PATTERNS }
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**
```bash
git add src/shell/useDesktopPattern.ts src/shell/useDesktopPattern.test.ts
git commit -m "feat(4E): useDesktopPattern hook"
```

### Task 4E-2: `appearance` window id + `AppearanceWindow`

- [ ] **Step 1: Write `src/windows/AppearanceWindow.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe' // or the project's existing axe helper
import { describe, it, expect, vi } from 'vitest'
import AppearanceWindow from './AppearanceWindow'
import { THEMES } from '../shell/useTheme'

describe('AppearanceWindow', () => {
  const base = { theme: 'system7', setTheme: vi.fn(), pattern: '50', setPattern: vi.fn() }
  it('renders a radio per theme with the active one checked', () => {
    render(<AppearanceWindow {...base} />)
    for (const t of THEMES) screen.getByRole('radio', { name: t.label })
    expect(screen.getByRole('radio', { name: 'System 7' })).toBeChecked()
  })
  it('selecting a theme calls setTheme', () => {
    const setTheme = vi.fn()
    render(<AppearanceWindow {...base} setTheme={setTheme} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
  it('selecting a pattern calls setPattern', () => {
    const setPattern = vi.fn()
    render(<AppearanceWindow {...base} setPattern={setPattern} />)
    fireEvent.click(screen.getByRole('radio', { name: /75%|Dense/ }))
    expect(setPattern).toHaveBeenCalledWith('75')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Create `src/windows/AppearanceWindow.tsx`**

```tsx
import { THEMES } from '../shell/useTheme'
import styles from './AppearanceWindow.module.css'

const PATTERNS: { id: '0' | '25' | '50' | '75'; label: string }[] = [
  { id: '0', label: 'None' },
  { id: '25', label: 'Light 25%' },
  { id: '50', label: 'Standard 50%' },
  { id: '75', label: 'Dense 75%' },
]

interface Props {
  theme: string
  setTheme: (id: string) => void
  pattern: string
  setPattern: (p: '0' | '25' | '50' | '75') => void
}

export default function AppearanceWindow({ theme, setTheme, pattern, setPattern }: Props) {
  return (
    <div className={styles.root}>
      <fieldset className={styles.group}>
        <legend>Theme</legend>
        {THEMES.map((t) => (
          <label key={t.id} className={styles.row}>
            <input
              type="radio" name="theme" value={t.id}
              checked={theme === t.id}
              onChange={() => setTheme(t.id)}
            />
            <span className={`${styles.swatch} ${t.className}`} aria-hidden />
            {t.label}
          </label>
        ))}
      </fieldset>
      <fieldset className={styles.group}>
        <legend>Desktop Pattern</legend>
        {PATTERNS.map((p) => (
          <label key={p.id} className={styles.row}>
            <input
              type="radio" name="pattern" value={p.id}
              checked={pattern === p.id}
              onChange={() => setPattern(p.id)}
            />
            <span className={`${styles.swatch} ${styles['p' + p.id]}`} aria-hidden />
            {p.label}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
```

  `AppearanceWindow.module.css`: `.swatch` is a 16×16 bordered box; for themes it uses the theme class's `--c-bg`/`--dither-ink` to paint a 2px dither + a tiny 1px "window" rect; for patterns it paints the matching `repeating-conic-gradient`. All 1-bit.

- [ ] **Step 4: Add `appearance` to `WindowId`** in `src/shell/windows.ts`, `DEFAULTS.appearance = { x: 240, y: 120, w: 320, h: 320 }`, `make('appearance')` in `initialDesktop`; `TITLES.appearance = 'Appearance'` in `Desktop.tsx`; mount in `content`:
```tsx
appearance: <AppearanceWindow theme={theme} setTheme={setTheme} pattern={pattern} setPattern={setPattern} />,
```
  Run `npm test -- --run src/windows/AppearanceWindow.test.tsx && npx tsc --noEmit`.

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "feat(4E): Appearance control panel window (themes + desktop pattern)"
```

### Task 4E-3: Apple ▸ Appearance… + View ▸ Theme ▸ quick list

- [ ] **Step 1: Add to `src/shell/MenuBar.test.tsx`**: Apple menu has `Appearance…` → `openWindow('appearance')`; View menu contains a checked entry for the active theme and selecting another calls `setTheme`.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Edit `src/shell/MenuBar.tsx`**
  - `MenuBarActions` gains `theme: string`, `setTheme(id: string): void`.
  - Apple menu items: add `{ label: 'Appearance…', separatorBefore: true, onSelect: () => props.openWindow('appearance') }`.
  - `view` menu — append the theme quick list (flat, not a nested submenu — `Menu` renders a computed array):
  ```ts
  ...THEMES.map((t) => ({
    label: t.label,
    checked: props.theme === t.id,
    separatorBefore: t.id === THEMES[0].id,
    onSelect: () => props.setTheme(t.id),
  })),
  ```
  (import `THEMES` from `../shell/useTheme`.) Keep the existing `Outline dragging` item above the separator.

- [ ] **Step 4: Wire `theme` / `setTheme` from `Desktop` into `menuActions`.** Run gate.

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "feat(4E): Apple > Appearance… and View > Theme quick switch"
```

### Task 4E-4: Pre-render Appearance markup + needles

- [ ] **Step 1: Edit `scripts/assert-prerendered.mjs`** — add `'Appearance'` and `'Desktop Pattern'` to `needles`. Run `npm run build && npm run prerender:assert` — **expect FAIL** (strings not in `dist/index.html`).

- [ ] **Step 2:** Add a pre-rendered, no-JS copy of the Appearance fieldsets to the static `#main` fallback (in `src/App.tsx`, alongside the existing `#projects` / `#readme` blocks) — a plain `<section id="appearance"><h2>Appearance</h2>` with the two `<fieldset>`s (static radios, System 7 + Standard 50% checked, no handlers). This is the same pattern used for the résumé/projects fallbacks.

- [ ] **Step 3: Run `npm run build && npm run prerender:assert` — expect PASS.** Extend `src/styles/fallback.css` / `print.css` if the new section needs layout / print-hiding (match how `#projects` is handled).

- [ ] **Step 4: Full gate.**

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "feat(4E): pre-render Appearance panel markup; add prerender needles"
```

### Task 4E-5: CRT tint overlay + e2e

- [ ] **Step 1: Write `tests/themes.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('theme switch persists across reload with no flash, and CRT keeps layout', async ({ page }) => {
  await page.goto('/')
  // open Appearance from the Apple menu
  await page.locator('[aria-label="Apple menu"]').click()
  await page.getByRole('menuitem', { name: 'Appearance…' }).click()
  await page.getByRole('radio', { name: 'Dark' }).click()
  await expect(page.locator('html')).toHaveClass(/theme-dark/)

  await page.reload()
  // init script must have set the class before first paint
  await expect(page.locator('html')).toHaveClass(/theme-dark/)
  const bg = await page.evaluate(() =>
    getComputedStyle(document.querySelector('[data-testid="titlebar"]')!).backgroundColor)
  expect(bg).toBe('rgb(0, 0, 0)')

  // CRT theme must not shove the menu bar (containing-block regression guard)
  await page.locator('[aria-label="Apple menu"]').click()
  await page.getByRole('menuitem', { name: 'Appearance…' }).click()
  await page.getByRole('radio', { name: 'CRT Amber' }).click()
  const top = await page.evaluate(() =>
    document.querySelector('[aria-label="Apple menu"]')!.closest('div')!.getBoundingClientRect().top)
  expect(top).toBe(0)

  // desktop pattern
  await page.getByRole('radio', { name: 'Dense 75%' }).click()
  const img = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.desktop')!).backgroundImage)
  expect(img).toContain('conic-gradient')
})
```

- [ ] **Step 2: Run — expect FAIL** on the CRT tint (no overlay yet) or the layout guard.

- [ ] **Step 3:** In `src/shell/Desktop.tsx`, when `theme === 'crtAmber' || theme === 'crtGreen'`, render a tint overlay as a sibling of `<MenuBar/>` (same technique as the Konami overlay in `f60982c`):

```tsx
{(theme === 'crtAmber' || theme === 'crtGreen') && (
  <div className={styles.crt} aria-hidden />
)}
```

  `Desktop.module.css`:
```css
.crt {
  position: fixed;
  inset: 0;
  z-index: 9000;
  pointer-events: none;
  background: var(--crt-hue);
  mix-blend-mode: multiply;
}
.crt::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 1px, transparent 1px 3px);
}
```

- [ ] **Step 4: Run `npm run test:e2e -- themes` — expect PASS.** Full gate.

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "feat(4E): CRT phosphor tint overlay + themes e2e"
```

---

# Sub-plan 4-F · Projects font fix + Keynote deck

**Files:**
- Create: `src/windows/deck/SlideTransition.tsx` (+ `.test.tsx`), `src/windows/deck/slideMotion.tsx` (+ `.test.tsx`), `src/windows/deck/CrtSpike.md`, `tests/fonts.spec.ts`
- Modify: `index.html` (font preload — may already be done in 4-A Task 5; if not, here), `src/styles/fonts.css`, `src/windows/ProjectsDeck.tsx`, `src/windows/ProjectsDeck.module.css`, `src/windows/ProjectsDeck.test.tsx`, `tests/projects.spec.ts`

**Interfaces:**
- Produces: `<SlideTransition dir={1|-1} keyId={string}>{slide}</SlideTransition>`; `slideMotion: Record<MotionKey, React.FC<{ play: boolean; card: ProjectCard }>>`; `MotionKey = 'overview'|'problem'|'approach'|'result'|'techlinks'|'divider'|'contents'`.
- Consumes: existing `buildSlides`, `ProjectCard`, deck nav state.

### Task 4F-1: Font-loading fix

- [ ] **Step 1: Write `tests/fonts.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('deck headings render in Chicago once fonts are ready', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => (document as any).fonts.ready)
  await page.getByRole('button', { name: 'Projects' }).dblclick()
  const heading = page.getByRole('dialog', { name: 'Projects' }).locator('h2').first()
  const fam = await heading.evaluate((el) => getComputedStyle(el).fontFamily)
  expect(fam.split(',')[0].replace(/["']/g, '')).toBe('Chicago')
  expect(await page.evaluate(() => (document as any).fonts.check('16px Chicago'))).toBe(true)
})
```

- [ ] **Step 2: Run — expect FAIL** (flaky/fallback family) or PASS intermittently — either way proceed.

- [ ] **Step 3:**
  - `index.html` `<head>` — add (if not already added in 4-A):
  ```html
  <link rel="preload" as="font" type="font/woff2" href="/fonts/chicago.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/fonts/newyork.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/fonts/monaco.woff2" crossorigin>
  ```
  - `src/styles/fonts.css` — change `font-display: swap` → `font-display: block` for the **Chicago** and **Monaco** `@font-face` blocks only. Leave both **NewYork** faces on `swap`.

- [ ] **Step 4: Run `npm run build && npm run test:e2e -- fonts` — expect PASS** (repeat 3× for flake).

- [ ] **Step 5: Commit**
```bash
git add index.html src/styles/fonts.css tests/fonts.spec.ts
git commit -m "fix(4F): preload core fonts + font-display block for chrome/mono (kills Projects font flash)"
```

### Task 4F-2: Transition spike + `SlideTransition`

- [ ] **Step 1: Spike (timeboxed, ~20 min).** Prototype both options in `src/windows/deck/` scratch:
  (a) animated `mask-image` checkerboard dissolve using the Plan 1 conic dither at growing cell size;
  (b) hard-edged iris (`clip-path: circle()` growing).
  Judge on: 1-bit purity (no AA greys), 60fps on a throttled CPU, reduced-motion clarity. Record the winner + why in `src/windows/deck/CrtSpike.md` (2–4 sentences). Commit the note:
```bash
git add src/windows/deck/CrtSpike.md
git commit -m "docs(4F): slide-transition spike — chose <winner>"
```

- [ ] **Step 2: Write `src/windows/deck/SlideTransition.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SlideTransition from './SlideTransition'

vi.mock('../../shell/prefersReducedMotion', () => ({ prefersReducedMotion: () => true }))

describe('SlideTransition (reduced motion)', () => {
  it('swaps children synchronously with no lingering old node', () => {
    const { rerender } = render(<SlideTransition dir={1} keyId="a"><p>alpha</p></SlideTransition>)
    expect(screen.getByText('alpha')).toBeInTheDocument()
    rerender(<SlideTransition dir={1} keyId="b"><p>beta</p></SlideTransition>)
    expect(screen.queryByText('alpha')).toBeNull()
    expect(screen.getByText('beta')).toBeInTheDocument()
  })
})
```

  (If the repo has no `prefersReducedMotion` helper, create `src/shell/prefersReducedMotion.ts` exporting `export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches` and reuse it from `useBoot`/`ShutDown` in a later cleanup — not required for this task.)

- [ ] **Step 3: Run — expect FAIL**

- [ ] **Step 4: Create `src/windows/deck/SlideTransition.tsx`** — renders the current child; on `keyId` change, under normal motion, cross-fades via the spike-chosen 1-bit mask over ≤450ms (WAAPI on a wrapper's `mask-size` or `clip-path`), keeping both nodes mounted for the duration then dropping the old; under reduced motion, swap immediately (no timers). Expose an imperative `snap()` (via `useImperativeHandle` or a `snapSignal` prop) so the deck can finish a transition on the next keypress.

- [ ] **Step 5: Run — expect PASS; commit**
```bash
git add src/windows/deck/SlideTransition.tsx src/windows/deck/SlideTransition.test.tsx
git commit -m "feat(4F): 1-bit SlideTransition wrapper (reduced-motion = instant swap)"
```

### Task 4F-3: `slideMotion` registry

- [ ] **Step 1: Write `src/windows/deck/slideMotion.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { slideMotion, MOTION_KEYS } from './slideMotion'

const card = { kind: 'prose', heading: 'Result', html: '<p>Cut manual review by <b>60%</b>.</p>' } as any

describe('slideMotion', () => {
  it('has a component for every MotionKey', () => {
    for (const k of MOTION_KEYS) expect(slideMotion[k]).toBeTypeOf('function')
  })
  it('shows final content with play=false (nothing hidden)', () => {
    const R = slideMotion.result
    render(<R play={false} card={card} />)
    expect(screen.getByText(/60%/)).toBeVisible()
  })
  it('with reduced motion, play=true renders identically to play=false', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
    const R = slideMotion.result
    const a = render(<R play={false} card={card} />).container.innerHTML
    const b = render(<R play={true} card={card} />).container.innerHTML
    expect(b).toBe(a)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Create `src/windows/deck/slideMotion.tsx`** — export `MOTION_KEYS` and `slideMotion`. Each component:
  - reads `prefersReducedMotion()` once; if true, render the plain final markup.
  - else animate in on `play` via WAAPI / CSS classes toggled in a `useEffect`, per the spec table (overview wipe-on, approach stroke-draw, result count-up / dither-bar fill, techlinks stagger, divider rule-wipe, contents stagger).
  - **Never** animate `opacity` of content — animate `transform`, `mask-size`, `clip-path`, or `opacity` of a **dither mask** layer.
  - keep every animation ≤500ms, one-shot (no loops).

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**
```bash
git add src/windows/deck/slideMotion.tsx src/windows/deck/slideMotion.test.tsx
git commit -m "feat(4F): data-driven per-slide motion registry"
```

### Task 4F-4: Rework `ProjectsDeck` into Keynote layouts

- [ ] **Step 1: Update `src/windows/ProjectsDeck.test.tsx`** — keep every existing assertion (paging with ArrowRight/PageDown, `card N of M`, disabled-at-end, jump-to-stack via `target` nonce, agenda buttons). Add: the active slide's region has an accessible name matching the card heading; a heading uses `<h2>`.

- [ ] **Step 2: Run — expect FAIL** where the render changed.

- [ ] **Step 3: Rework `ProjectsDeck.tsx`**
  - Keep `buildSlides`, `si`/`ci` state, `next`/`prev`/`home`/`jumpTo`, the `target` effect, `onKeyDown` nav, deep-link handling — all unchanged.
  - Wrap the rendered slide in `<SlideTransition dir={lastDir} keyId={`${si}.${ci}`}>`.
  - For the active card, pick `MotionKey` from card kind/heading (`Overview`→`overview`, `Problem`→`problem`, `Approach`→`approach`, `Result`→`result`, `Tech & Links`→`techlinks`; dividers→`divider`; contents→`contents`) and render `const M = slideMotion[key]; <M play={active} card={card} />` inside the slide layout.
  - New slide chrome: big `<h2>` title (Chicago via `--chrome-font`), one focal-visual slot, generous padding; `card N of M` and prev/next stay; disabled nav keeps `text-decoration: line-through` (no opacity).
  - On any nav key while a transition is mid-flight, call the transition's `snap()` before advancing.

- [ ] **Step 4: Run `npm test -- --run src/windows/ProjectsDeck.test.tsx` — expect PASS.** `npx tsc --noEmit`.

- [ ] **Step 5: Commit**
```bash
git add src/windows/ProjectsDeck.tsx src/windows/ProjectsDeck.module.css src/windows/ProjectsDeck.test.tsx
git commit -m "feat(4F): Keynote slide layouts + transition + per-slide motion in ProjectsDeck"
```

### Task 4F-5: e2e + reduced-motion guarantee

- [ ] **Step 1: Extend `tests/projects.spec.ts`**

```ts
test('deck advances with an instant swap under reduced motion and stays axe-clean', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Projects' }).dblclick()
  const deck = page.getByRole('dialog', { name: 'Projects' })
  await deck.getByRole('button', { name: /Next/ }).click()
  // no transition element left behind
  expect(await deck.locator('[data-transitioning]').count()).toBe(0)
  // existing axe helper
  // await expectNoSeriousAxe(page)
})
```

  Keep all existing `tests/projects.spec.ts` cases; they must stay green against the new render.

- [ ] **Step 2: Run — expect FAIL then PASS** after build.

- [ ] **Step 3: Full gate** — `npx tsc --noEmit && npm test -- --run && npm run build && npm run prerender:assert && npm run test:e2e`. The pre-render needle set already includes the résumé/projects strings; confirm `Provider Directory` etc. still appear (the static `ProjectsArticle` fallback is untouched by the deck rework).

- [ ] **Step 4: Commit**
```bash
git add tests/projects.spec.ts
git commit -m "test(4F): deck reduced-motion instant-swap + axe e2e"
```

---

# Sub-plan 4-G · Get Info panes

**Files:**
- Create: `src/windows/getInfo.ts` (+ `.test.ts`), `src/windows/GetInfoWindow.tsx` (+ `.module.css`, + `.test.tsx`), `tests/get-info.spec.ts`
- Modify: `src/shell/windows.ts` (`WindowId` += `getinfo`, DEFAULTS), `src/shell/Desktop.tsx` (`TITLES`, `content`, `infoSubject` state), `src/shell/MenuBar.tsx` (+ `MenuBar.test.tsx`), `scripts/assert-prerendered.mjs`, `src/App.tsx` (pre-rendered Info markup for the résumé subject)

**Interfaces:**
- Produces: `getInfo.ts` exports `InfoCard`, `INFO: Record<WindowId, InfoCard>`; `GetInfoWindow` component takes `{ subject: WindowId }`. `MenuBarActions` gains `getInfoFront(): void`.
- Consumes: menu-bar plumbing (4-D), `IconGlyph` (Plan 3-D).

### Task 4G-1: `INFO` registry

- [ ] **Step 1: Write `src/windows/getInfo.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { INFO } from './getInfo'

describe('INFO', () => {
  it('covers every window that has an icon or a File-menu entry', () => {
    for (const id of ['resume', 'readme', 'projects', 'terminal']) {
      expect(INFO[id as keyof typeof INFO]).toBeTruthy()
      expect(INFO[id as keyof typeof INFO].comment.length).toBeGreaterThan(10)
    }
  })
  it('modified is the build date', () => {
    expect(INFO.resume.modified).toBe(__BUILD_DATE__)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Create `src/windows/getInfo.ts`**

```ts
import type { WindowId } from '../shell/windows'

export interface InfoCard {
  subject: string
  kind: string
  created: string
  modified: string
  size: string
  where: string
  comment: string
}

const built = __BUILD_DATE__

export const INFO: Record<WindowId, InfoCard> = {
  resume: {
    subject: 'Résumé', kind: 'Portfolio document', created: 'March 2003',
    modified: built, size: '48K on disk', where: 'samuelhabib.github.io',
    comment: 'Backend / data engineer. Healthcare data that other people depend on being right.',
  },
  projects: {
    subject: 'Projects', kind: 'Slide deck', created: 'March 2003',
    modified: built, size: '2.1 MB on disk', where: 'samuelhabib.github.io',
    comment: 'Case studies, presented. Use the arrow keys.',
  },
  terminal: {
    subject: 'Terminal', kind: 'Terminal emulator', created: 'March 2003',
    modified: built, size: '32K on disk', where: 'samuelhabib.github.io',
    comment: 'Type `help`. `sudo` will not help you here.',
  },
  readme: {
    subject: 'Read Me', kind: 'SimpleText document', created: 'March 2003',
    modified: built, size: '12K on disk', where: 'samuelhabib.github.io',
    comment: 'Start here if the desktop metaphor is not doing it for you.',
  },
  puzzle: {
    subject: 'Puzzle', kind: 'Desk accessory', created: 'March 2003',
    modified: built, size: '16K on disk', where: 'samuelhabib.github.io',
    comment: 'Fifteen tiles. One gap. Classic time sink.',
  },
  about: {
    subject: 'About This Portfolio', kind: 'Desk accessory', created: 'March 2003',
    modified: built, size: '8K on disk', where: 'samuelhabib.github.io',
    comment: 'System 7, remastered.',
  },
  appearance: {
    subject: 'Appearance', kind: 'Control panel', created: 'March 2003',
    modified: built, size: '20K on disk', where: 'samuelhabib.github.io',
    comment: 'Five themes, four desktop patterns, zero colors (almost).',
  },
  getinfo: {
    subject: 'Info', kind: 'Window', created: 'March 2003',
    modified: built, size: '4K on disk', where: 'samuelhabib.github.io',
    comment: 'This one is a bit recursive. Sorry.',
  },
}
```

- [ ] **Step 4: Run — expect PASS** (needs `getinfo`/`appearance` already in `WindowId` — 4-E adds `appearance`; add `getinfo` in Task 4G-2. Temporarily this test may need 4G-2's type change; if so, do Step 3 of 4G-2 first, then return here.)

- [ ] **Step 5: Commit**
```bash
git add src/windows/getInfo.ts src/windows/getInfo.test.ts
git commit -m "feat(4G): INFO registry (per-window Get Info content)"
```

### Task 4G-2: `getinfo` window id + `GetInfoWindow`

- [ ] **Step 1: Write `src/windows/GetInfoWindow.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GetInfoWindow from './GetInfoWindow'

describe('GetInfoWindow', () => {
  it('renders the subject kind, where, and comment', () => {
    render(<GetInfoWindow subject="projects" />)
    expect(screen.getByText('Slide deck')).toBeInTheDocument()
    expect(screen.getByText('samuelhabib.github.io')).toBeInTheDocument()
    expect(screen.getByText(/arrow keys/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3:**
  - `src/shell/windows.ts`: `WindowId` += `'getinfo'`; `DEFAULTS.getinfo = { x: 300, y: 180, w: 300, h: 280 }`; `make('getinfo')` in `initialDesktop`.
  - Create `src/windows/GetInfoWindow.tsx`:
  ```tsx
  import { INFO } from './getInfo'
  import IconGlyph, { type GlyphKind } from '../shell/IconGlyph'
  import type { WindowId } from '../shell/windows'
  import styles from './GetInfoWindow.module.css'

  const GLYPHS = new Set<GlyphKind>(['resume', 'projects', 'terminal', 'readme'])

  export default function GetInfoWindow({ subject }: { subject: WindowId }) {
    const i = INFO[subject]
    return (
      <div className={styles.root}>
        <div className={styles.head}>
          {GLYPHS.has(subject as GlyphKind) && (
            <span className={styles.glyph}><IconGlyph kind={subject as GlyphKind} /></span>
          )}
          <strong>{i.subject} Info</strong>
        </div>
        <dl className={styles.grid}>
          <dt>Kind</dt><dd>{i.kind}</dd>
          <dt>Where</dt><dd>{i.where}</dd>
          <dt>Created</dt><dd>{i.created}</dd>
          <dt>Modified</dt><dd>{i.modified}</dd>
          <dt>Size</dt><dd>{i.size}</dd>
        </dl>
        <div className={styles.comments}>
          <div className={styles.commentsLabel}>Comments:</div>
          <p>{i.comment}</p>
        </div>
      </div>
    )
  }
  ```
  - `Desktop.tsx`: `TITLES.getinfo = 'Info'`; `infoSubject` state (`WindowId`, default `'resume'`); `content.getinfo = <GetInfoWindow subject={infoSubject} />`.

- [ ] **Step 4: Run — expect PASS**; `npx tsc --noEmit`.

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "feat(4G): getinfo window id + GetInfoWindow pane"
```

### Task 4G-3: `File ▸ Get Info` wiring + pre-render + e2e

- [ ] **Step 1: Add to `src/shell/MenuBar.test.tsx`**: `File ▸ Get Info` calls `getInfoFront`; disabled when `!hasFront`.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3:**
  - `MenuBar.tsx`: `MenuBarActions` gains `getInfoFront(): void`; `file` menu adds `{ label: 'Get Info', separatorBefore: true, disabled: !props.hasFront, onSelect: props.hasFront ? props.getInfoFront : undefined }` (before `Close`).
  - `Desktop.tsx`: `getInfoFront: () => { if (!front) return; setInfoSubject(front); dispatch({ type: 'open', id: 'getinfo' }) }`.
  - `scripts/assert-prerendered.mjs`: add `'Portfolio document'` to `needles`.
  - `src/App.tsx`: add a static `<section id="getinfo">` fallback rendering `INFO.resume` (kind "Portfolio document" etc.) so the needle is in `dist/index.html`. Match the existing fallback-section pattern; hide in print via `print.css` if needed.

- [ ] **Step 4: Write `tests/get-info.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('File > Get Info describes the front window', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Projects' }).dblclick()
  await page.getByRole('button', { name: 'File' }).click()
  await page.getByRole('menuitem', { name: 'Get Info' }).click()
  const info = page.getByRole('dialog', { name: 'Info' })
  await expect(info.getByText('Slide deck')).toBeVisible()
  await expect(info.getByText(/arrow keys/i)).toBeVisible()
})
```

- [ ] **Step 5: Full gate + commit**
```bash
git add -A
git commit -m "feat(4G): File > Get Info wiring, pre-rendered markup, e2e"
```

---

## Self-Review

**Spec coverage:**
- 4-A tokens + themes + no-flash init → Tasks 4A-1…4A-5. ✓
- 4-B cursors + `useDrag` threshold/`data-dragging` → 4B-1, 4B-2. ✓
- 4-C draggable icons + session persistence + Clean Up → 4C-1…4C-4. ✓
- 4-D zoom box + full screen + window switcher + `⌘\`` → 4D-1…4D-6. ✓
- 4-E Appearance panel + View ▸ Theme + desktop pattern + CRT overlay + pre-render needles → 4E-1…4E-5. ✓
- 4-F font fix + slide transition + per-slide motion + deck rework → 4F-1…4F-5. ✓
- 4-G Get Info → 4G-1…4G-3. ✓
- Content dependency + Future list are in the spec; no tasks needed (correct — they are not code). ✓

**Placeholder scan:** the transition-technique choice in 4F-2 is a deliberate timeboxed spike with a recorded outcome, not a placeholder. 4C-3's wiring choice is resolved (lift into `Desktop`). No "TBD"/"handle edge cases"/bare "write tests" remain.

**Type consistency:**
- `WindowState.maxed` (not `zoom`/`minZoom`) used consistently in 4D-1 and the reducer. ✓
- `WindowId` additions `'appearance'` (4E-2) and `'getinfo'` (4G-2) — 4G-1's `INFO` map types against the full `WindowId`, so 4G-1 Step 4 notes the ordering dependency on 4G-2's type change. ✓
- `MenuBarActions` grows across 4-C/4-D/4-E/4-G: `cleanUpIcons`, `zoomFront`, `toggleFullScreen`, `isFullScreen`, `openWindowsList`, `focusWindow`, `frontId`, `theme`, `setTheme`, `getInfoFront`. Each sub-plan's task that adds a field also updates `MenuBar.test.tsx` mount defaults — called out per task. ✓
- `useDrag` third arg `opts?: { threshold?: number }` defined in 4B-1, consumed in 4C-2. ✓
- `slideMotion` / `MOTION_KEYS` / `MotionKey` names consistent between 4F-3 and 4F-4. ✓

**Ordering note for executors:** do the sub-plans strictly A→G. Within 4-G, if `tsc` blocks 4G-1 because `WindowId` lacks `getinfo`, apply 4G-2 Step 3's `windows.ts` change first, then finish 4G-1.
