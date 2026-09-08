# Portfolio v2 — Plan 3-C: Desk Accessories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## The Plan-3 split

| | Scope | Status |
|---|---|---|
| **3-A** | Projects deck | ✅ done |
| **3-B** | Interactive menu bar (dropdowns, About This Portfolio, Restart, Shut Down / CRT power-off) | ✅ done |
| **3-C** | **Desk accessories — this plan.** 15-tile sliding Puzzle window (Apple menu ▸ Puzzle); Trash icon + drag-a-window-to-trash | this doc |
| **3-D** | Polish — Read Me easter eggs, outline-drag toggle, drawn desktop-icon glyphs | after |

Deferred out of all four (from earlier reviews): dithered card transitions, general `?open=<window>` deep links, `hypercard` Terminal alias.

---

**Goal:** Two small period-accurate flourishes. (1) The authentic 15-tile sliding **Puzzle** as a real window, opened from the Apple menu — shuffled, solvable, click a tile next to the gap to slide it, with a Shuffle button and a "Solved!" state. (2) A **Trash** icon at the bottom-right of the desktop: drag a window so its title bar lands on the Trash and the window "crumples" away (a beep + close); it's back on the next load because nothing persists.

**Architecture:** `puzzle.ts` is pure board logic (`move` / `isSolved` / `shuffle`-by-random-legal-moves). `PuzzleWindow` renders a 4×4 grid of `<button>` tiles + Shuffle, and is mounted as the existing `puzzle` window id — the Apple menu gains a `Puzzle` item that calls `openWindow('puzzle')`. For Trash, `useDrag` gains an `onEnd` callback (ref'd, same as `onDelta`) that fires **only if the pointer actually moved**; `Window` forwards it as `onDragEnd`; `Desktop` renders `<Trash>` (a `[data-trash]` button, bottom-right) and, on a window's drag end, intersects that window's **title-bar** rect (`#win-<id> [data-testid="titlebar"]`, using the `id` added in 3-B) with the Trash rect — overlap ⇒ `beep()` + `close(id)`.

**Tech Stack:** React 18, TypeScript 5, Vitest + @testing-library/react (unit), Playwright (e2e). No new dependencies. No animation library — the Trash "crumple" is a beep + close in this plan (see Deferred).

**Spec:** `docs/superpowers/specs/2026-09-07-portfolio-v2-classic-mac-design.md` — "Desktop" (Trash icon, bottom-right), "Easter eggs" #1 (the 15-tile Puzzle) and #3 (Trash), "the toggle also governs … the Trash crumple".

## Global Constraints

- **Strictly 1-bit.** `#000` / `#fff` via tokens; greys only via the Plan 1 dither utilities. **No `opacity`** for disabled/de-emphasis — a solved tile or the gap uses borders / invert, never fade. Tile hover / active is a full invert.
- **The Puzzle is self-contained** — hand-rolled, ~1 file of logic + 1 component, no dependency (spec allows an MIT/CC0 drop-in "if cleaner"; hand-rolling 16 cells is cleaner here).
- **`shuffle()` never returns an already-solved board** — a puzzle that opens solved reads as broken.
- **Trash is a themed close, not persistence.** Trashing a window sets `open: false`; on reload the initial state restores it. No storage.
- **The Trash hit test is title-bar-only and drag-only.** Full-window-rect intersection is too generous (the 560×600 Résumé window can already overlap a corner icon at rest); a bare click near the Trash must never delete a window.
- **`prefers-reduced-motion`** — nothing in 3-C animates; do not add motion.
- **Accessibility.** `tests/a11y.spec.ts` stays green. The Puzzle tiles and the Trash are real `<button>`s with labels. A new e2e asserts axe is clean with the Puzzle open.
- **No new page content.** The Puzzle and Trash are chrome; `scripts/assert-prerendered.mjs` and `#main` are untouched. Both are desktop-shell-only (`≥768px`).

---

### Task 1: The 15-tile Puzzle

**Files:**
- Create: `src/windows/puzzle.ts`
- Create: `src/windows/PuzzleWindow.tsx`
- Create: `src/windows/PuzzleWindow.module.css`
- Test: `src/windows/puzzle.test.ts`
- Test: `src/windows/PuzzleWindow.test.tsx`
- Modify: `src/shell/MenuBar.tsx` (Apple menu ▸ Puzzle)
- Modify: `src/shell/Desktop.tsx` (mount `puzzle`)

**Interfaces:**
- Produces:
  ```ts
  // src/windows/puzzle.ts
  export type Board = number[]              // length 16; 0 is the gap
  export const SOLVED: Board               // [1..15, 0]
  export function isSolved(b: Board): boolean
  export function adjacentToGap(b: Board): number[]   // tile indices that can move
  export function slide(b: Board, tileIndex: number): Board  // swap with gap if adjacent, else return b unchanged
  export function shuffle(rng?: () => number): Board  // ~120 random legal moves from SOLVED; guaranteed solvable and never === SOLVED
  ```
  - `src/windows/PuzzleWindow.tsx` default export, no props: a 4×4 grid of 15 numbered `<button>` tiles + an empty gap cell, a `Shuffle` button, and a "Solved!" line shown when `isSolved`. Clicking a tile adjacent to the gap calls `slide`.

- [ ] **Step 1: Write the failing logic test**

```ts
// src/windows/puzzle.test.ts
import { SOLVED, isSolved, adjacentToGap, slide, shuffle } from './puzzle'

test('SOLVED is 1..15 then the gap', () => {
  expect(SOLVED).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
  expect(isSolved(SOLVED)).toBe(true)
})

test('adjacentToGap returns the up-to-4 neighbours of the gap', () => {
  // gap at index 15 (bottom-right): neighbours are 14 (left) and 11 (up)
  expect(adjacentToGap(SOLVED).sort((a, b) => a - b)).toEqual([11, 14])
})

test('slide swaps an adjacent tile with the gap and no-ops otherwise', () => {
  const moved = slide(SOLVED, 14) // tile "15" slides right into the gap
  expect(moved[14]).toBe(0)
  expect(moved[15]).toBe(15)
  expect(slide(SOLVED, 0)).toEqual(SOLVED) // index 0 is not adjacent to the gap
})

test('shuffle is a solvable 16-permutation that is not already solved', () => {
  for (let i = 0; i < 20; i++) {
    const b = shuffle()
    expect([...b].sort((x, y) => x - y)).toEqual(SOLVED.slice().sort((x, y) => x - y))
    expect(isSolved(b)).toBe(false)
  }
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- src/windows/puzzle`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `puzzle.ts`**

```ts
// src/windows/puzzle.ts
export type Board = number[]

export const SOLVED: Board = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]

export function isSolved(b: Board): boolean {
  return b.every((v, i) => v === SOLVED[i])
}

export function adjacentToGap(b: Board): number[] {
  const gap = b.indexOf(0)
  const row = Math.floor(gap / 4)
  const col = gap % 4
  const out: number[] = []
  if (row > 0) out.push(gap - 4)
  if (row < 3) out.push(gap + 4)
  if (col > 0) out.push(gap - 1)
  if (col < 3) out.push(gap + 1)
  return out
}

export function slide(b: Board, tileIndex: number): Board {
  if (!adjacentToGap(b).includes(tileIndex)) return b
  const gap = b.indexOf(0)
  const next = b.slice()
  next[gap] = b[tileIndex]
  next[tileIndex] = 0
  return next
}

export function shuffle(rng: () => number = Math.random): Board {
  let b = SOLVED.slice()
  let prevGap = -1
  for (let i = 0; i < 120; i++) {
    const options = adjacentToGap(b).filter((idx) => idx !== prevGap)
    prevGap = b.indexOf(0)
    b = slide(b, options[Math.floor(rng() * options.length)])
  }
  // a 120-move random walk can theoretically land back on SOLVED — nudge once more
  if (isSolved(b)) b = slide(b, adjacentToGap(b)[0])
  return b
}
```

- [ ] **Step 4: Run the logic test to verify it passes**

Run: `npm test -- src/windows/puzzle`
Expected: PASS (all four).

- [ ] **Step 5: Write the failing component test**

```tsx
// src/windows/PuzzleWindow.test.tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PuzzleWindow from './PuzzleWindow'

test('renders 15 numbered tiles', () => {
  render(<PuzzleWindow />)
  for (let n = 1; n <= 15; n++) {
    expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument()
  }
})

test('Shuffle produces a different arrangement', async () => {
  render(<PuzzleWindow />)
  const grid = screen.getByRole('group', { name: /puzzle/i })
  const before = within(grid)
    .getAllByRole('button')
    .map((b) => b.textContent)
    .join(',')
  await userEvent.click(screen.getByRole('button', { name: /shuffle/i }))
  const after = within(grid)
    .getAllByRole('button')
    .map((b) => b.textContent)
    .join(',')
  expect(after).not.toBe(before)
})

test('clicking a tile next to the gap moves it', async () => {
  render(<PuzzleWindow />)
  const grid = screen.getByRole('group', { name: /puzzle/i })
  const cellsBefore = within(grid)
    .getAllByRole('button')
    .map((b) => b.textContent)
  // find a tile that is currently adjacent to the empty cell and click it
  const emptyIdx = cellsBefore.findIndex((t) => t === '')
  const target = [emptyIdx - 1, emptyIdx + 1, emptyIdx - 4, emptyIdx + 4].find(
    (i) => i >= 0 && i < 16 && cellsBefore[i] !== '',
  )!
  await userEvent.click(within(grid).getAllByRole('button')[target])
  const cellsAfter = within(grid)
    .getAllByRole('button')
    .map((b) => b.textContent)
  expect(cellsAfter[emptyIdx]).toBe(cellsBefore[target])
  expect(cellsAfter[target]).toBe('')
})
```

- [ ] **Step 6: Run to verify it fails**

Run: `npm test -- PuzzleWindow`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `PuzzleWindow.tsx` + CSS**

```tsx
// src/windows/PuzzleWindow.tsx
import { useState } from 'react'
import { isSolved, shuffle, slide, type Board } from './puzzle'
import styles from './PuzzleWindow.module.css'

export default function PuzzleWindow() {
  const [board, setBoard] = useState<Board>(() => shuffle())
  const solved = isSolved(board)

  return (
    <div className={styles.wrap}>
      <div className={styles.grid} role="group" aria-label="Puzzle">
        {board.map((v, i) =>
          v === 0 ? (
            <span key={i} className={styles.gap} aria-hidden />
          ) : (
            <button
              key={i}
              type="button"
              className={styles.tile}
              onClick={() => setBoard((b) => slide(b, i))}
            >
              {v}
            </button>
          ),
        )}
      </div>
      <div className={styles.foot}>
        <button type="button" className={styles.shuffle} onClick={() => setBoard(shuffle())}>
          Shuffle
        </button>
        {solved && <span className={styles.solved}>Solved!</span>}
      </div>
    </div>
  )
}
```

```css
/* src/windows/PuzzleWindow.module.css */
.wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--space-3);
  font-family: var(--font-chrome);
  font-size: 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  flex: 1;
  aspect-ratio: 1;
  border: 1px solid var(--black);
  background: var(--black);
}
.tile,
.gap {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  font-family: var(--font-chrome);
  font-size: 18px;
}
.tile:hover,
.tile:focus-visible {
  background: var(--black);
  color: var(--white);
  outline: none;
}
.gap {
  background: var(--white);
}
.foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: var(--space-3);
}
.shuffle {
  font-family: var(--font-chrome);
  border: 1px solid var(--black);
  padding: 2px 10px;
}
.shuffle:active {
  background: var(--black);
  color: var(--white);
}
.solved {
  font-family: var(--font-chrome);
}
```

- [ ] **Step 8: Run the component test to verify it passes**

Run: `npm test -- PuzzleWindow`
Expected: PASS. If "Shuffle produces a different arrangement" is ever flaky (astronomically unlikely — `shuffle` walks 120 moves), re-run; do not weaken the assertion.

- [ ] **Step 9: Wire the Apple menu + mount the window**

`src/shell/MenuBar.tsx` — the Apple `Menu`'s `items`:

```tsx
        items={[
          { label: 'About This Portfolio', onSelect: () => props.openWindow('about') },
          { label: 'Puzzle', separatorBefore: true, onSelect: () => props.openWindow('puzzle') },
        ]}
```

`src/shell/Desktop.tsx` — add the import and the `content` entry:

```tsx
import PuzzleWindow from '../windows/PuzzleWindow'
```

```tsx
  const content: Partial<Record<WindowId, ReactNode>> = {
    resume: <ResumeWindow />,
    readme: <ReadMeWindow />,
    terminal: <TerminalWindow bridge={bridge} />,
    projects: <ProjectsWindow target={stackTarget} />,
    about: <AboutDialog />,
    puzzle: <PuzzleWindow />,
  }
```

(`TITLES.puzzle` = `'Puzzle'` and `DEFAULTS.puzzle` already exist from Plan 1.)

- [ ] **Step 10: Verify + commit**

Run: `npm test && npx tsc --noEmit`
Expected: all green.

```bash
git add -A
git commit -m "feat: 15-tile sliding Puzzle desk accessory (Apple menu ▸ Puzzle)"
```

---

### Task 2: Trash — drag a window to delete it

**Files:**
- Modify: `src/shell/useDrag.ts` (add `onEnd`, ref'd; fire only after real movement)
- Test: `src/shell/useDrag.test.tsx` (new)
- Modify: `src/shell/Window.tsx` (accept + forward `onDragEnd`)
- Create: `src/shell/Trash.tsx`
- Create: `src/shell/Trash.module.css`
- Modify: `src/shell/Desktop.tsx` (render `<Trash>`, hit-test on drag end)
- Test: `tests/desk.spec.ts` (new)

**Interfaces:**
- `useDrag(onDelta, onEnd?)` — `onEnd` is read through a ref exactly like `onDelta`; it fires on `pointerup` **only if at least one `pointermove` occurred** since `pointerdown` (a click with no movement does not fire it).
- `Window` gains optional `onDragEnd?(): void`, passed as `useDrag`'s second arg for the **title-bar move** drag only (not the grow-box resize drag).
- `src/shell/Trash.tsx` default export, no props — a `<button data-trash aria-label="Trash">` with a 1-bit trash-can SVG glyph and a "Trash" caption, positioned bottom-right of `.desktop`.
- `Desktop` renders `<Trash />` and passes `onDragEnd={() => maybeTrash(id)}` to each `Window`. `maybeTrash(id)` reads `#win-<id> [data-testid="titlebar"]` and `[data-trash]` bounding rects; on rectangle overlap it calls `sound.beep()` then `close(id)`.

- [ ] **Step 1: Write the failing `useDrag` test**

```tsx
// src/shell/useDrag.test.tsx
import { renderHook } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { useDrag } from './useDrag'

function press(el: EventTarget, x: number, y: number) {
  fireEvent.pointerDown(el, { button: 0, clientX: x, clientY: y })
}

test('onEnd fires after a real drag', () => {
  const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(() => {}, onEnd))
  const node = document.createElement('div')
  result.current.onPointerDown({
    button: 0,
    clientX: 0,
    clientY: 0,
  } as unknown as React.PointerEvent)
  fireEvent.pointerMove(window, { clientX: 10, clientY: 10 })
  fireEvent.pointerUp(window)
  expect(onEnd).toHaveBeenCalledOnce()
})

test('onEnd does NOT fire for a click with no movement', () => {
  const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(() => {}, onEnd))
  result.current.onPointerDown({
    button: 0,
    clientX: 0,
    clientY: 0,
  } as unknown as React.PointerEvent)
  fireEvent.pointerUp(window)
  expect(onEnd).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- src/shell/useDrag`
Expected: FAIL — `useDrag` takes one argument.

- [ ] **Step 3: Extend `useDrag.ts`**

```ts
import { useCallback, useRef } from 'react'

/**
 * Pointer-drag helper. `onDelta` is the incremental movement since the last
 * event. `onEnd` (optional) fires once on pointerup, but only if the pointer
 * actually moved — a bare click does not count as a drag.
 *
 * Both callbacks are read through refs so the window listeners always call the
 * latest closure (without this, the handler keeps using drag-start state).
 */
export function useDrag(onDelta: (dx: number, dy: number) => void, onEnd?: () => void) {
  const latest = useRef(onDelta)
  latest.current = onDelta
  const latestEnd = useRef(onEnd)
  latestEnd.current = onEnd

  const origin = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!origin.current) return
    moved.current = true
    latest.current(e.clientX - origin.current.x, e.clientY - origin.current.y)
    origin.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onPointerUp = useCallback(() => {
    origin.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    if (moved.current) latestEnd.current?.()
    moved.current = false
  }, [onPointerMove])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      origin.current = { x: e.clientX, y: e.clientY }
      moved.current = false
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [onPointerMove, onPointerUp],
  )

  return { onPointerDown }
}
```

- [ ] **Step 4: Run the `useDrag` test to verify it passes**

Run: `npm test -- src/shell/useDrag Window`
Expected: PASS — `useDrag` cases green and the existing `Window.test.tsx` still green.

- [ ] **Step 5: Thread `onDragEnd` through `Window.tsx`**

Add to `WindowProps`:

```tsx
  onDragEnd?(): void
```

Change the move-drag line (leave the grow-box drag as one arg):

```tsx
  const drag = useDrag((dx, dy) => p.onMove(state.x + dx, state.y + dy), p.onDragEnd)
```

- [ ] **Step 6: Implement `Trash.tsx` + CSS**

```tsx
// src/shell/Trash.tsx
import styles from './Trash.module.css'

export default function Trash() {
  return (
    <button type="button" className={styles.trash} data-trash aria-label="Trash">
      <svg className={styles.glyph} viewBox="0 0 24 28" aria-hidden>
        <g fill="none" stroke="#000" strokeWidth="2">
          <path d="M3 6 H21" />
          <path d="M9 6 V3 H15 V6" />
          <path d="M5 6 L6 26 H18 L19 6" />
          <path d="M10 10 V22 M14 10 V22" />
        </g>
      </svg>
      <span className={styles.caption}>Trash</span>
    </button>
  )
}
```

```css
/* src/shell/Trash.module.css */
.trash {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  width: 64px;
  font-family: var(--font-chrome);
  font-size: 11px;
}
.glyph {
  width: 24px;
  height: 28px;
}
.trash:focus-visible .caption {
  background: var(--black);
  color: var(--white);
  outline: none;
}
```

- [ ] **Step 7: Wire `Desktop.tsx`**

Add the import:

```tsx
import Trash from './Trash'
```

Add `maybeTrash` (near `menuActions`, after `sound` is available):

```tsx
  const maybeTrash = (id: WindowId) => {
    const trashEl = document.querySelector<HTMLElement>('[data-trash]')
    const bar = document.querySelector<HTMLElement>(`#win-${id} [data-testid="titlebar"]`)
    if (!trashEl || !bar) return
    const t = trashEl.getBoundingClientRect()
    const b = bar.getBoundingClientRect()
    const overlap = b.left < t.right && b.right > t.left && b.top < t.bottom && b.bottom > t.top
    if (!overlap) return
    sound.beep()
    close(id)
  }
```

Render `<Trash />` just after `<DesktopIcons .../>`:

```tsx
      <MenuBar {...menuActions} />
      <DesktopIcons onOpen={open} />
      <Trash />
```

Pass `onDragEnd` to each `Window` in the `openWindows.map`:

```tsx
          onResize={(w, h) => dispatch({ type: 'resize', id, w, h })}
          onToggleShade={() => dispatch({ type: 'toggleShade', id })}
          onDragEnd={() => maybeTrash(id)}
```

- [ ] **Step 8: Write the e2e**

```ts
// tests/desk.spec.ts
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function boot(page: Page) {
  await page.goto('/')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
}

test('Apple ▸ Puzzle opens the Puzzle window', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: 'Puzzle' }).click()
  const puzzle = page.getByRole('dialog', { name: /puzzle/i })
  await expect(puzzle).toBeVisible()
  await expect(puzzle.getByRole('button', { name: 'Shuffle' })).toBeVisible()
})

test('no serious axe violations with the Puzzle open', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: 'Puzzle' }).click()
  await expect(page.getByRole('dialog', { name: /puzzle/i })).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(serious).toEqual([])
})

test('dragging a window onto the Trash closes it', async ({ page }) => {
  await boot(page)
  const readme = page.getByRole('dialog', { name: /read me/i })
  await expect(readme).toBeVisible()
  const bar = readme.getByTestId('titlebar')
  const trash = page.locator('[data-trash]')
  const from = await bar.boundingBox()
  const to = await trash.boundingBox()
  await page.mouse.move(from!.x + 30, from!.y + from!.height / 2)
  await page.mouse.down()
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, { steps: 24 })
  await page.mouse.up()
  await expect(readme).toHaveCount(0)
})

test('a short drag that misses the Trash keeps the window open', async ({ page }) => {
  await boot(page)
  const readme = page.getByRole('dialog', { name: /read me/i })
  const bar = readme.getByTestId('titlebar')
  const from = await bar.boundingBox()
  await page.mouse.move(from!.x + 30, from!.y + from!.height / 2)
  await page.mouse.down()
  await page.mouse.move(from!.x + 90, from!.y + from!.height / 2 + 20, { steps: 12 })
  await page.mouse.up()
  await expect(readme).toBeVisible()
})
```

- [ ] **Step 9: Run e2e to verify it passes**

Run: `npm run test:e2e -- desk`
Expected: PASS (all four). If "dragging … onto the Trash" misses because the Read Me window starts near the bottom-right and the drag distance is small, drag from its title bar to the Trash centre in more `steps` — the assertion is that the *title bar* rect overlaps the Trash rect at release.

- [ ] **Step 10: Full regression**

Run: `npm test && npm run test:e2e && npm run build && npm run prerender:assert`
Expected: all green. Watch `tests/window.spec.ts` (the `useDrag` change) and `tests/menubar.spec.ts` (MenuBar change).

- [ ] **Step 11: Manual smoke**

`npm run dev`, skip boot. **Apple ▸ Puzzle** — tiles slide when clicked next to the gap, Shuffle re-scrambles, arrange 1–15 → "Solved!". Drag the **Read Me** title bar down onto **Trash** (bottom-right) → beep, window gone; reload → it's back. Give a window a small nudge that doesn't reach the Trash → it stays.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: Trash icon — drag a window's title bar onto it to close it"
```

---

## Self-Review

**1. Spec coverage**

| Spec point | Task |
| --- | --- |
| A working desk accessory in the Apple menu — the authentic 15-tile Puzzle; hand-roll if cleaner; one game | 1 (`puzzle.ts` + `PuzzleWindow`, hand-rolled, single game) |
| Trash bottom-right of the desktop; drag a window to it to "delete" it; comes back on reload | 2 (`Trash` at `right/bottom: 14px`; `maybeTrash` → `close`; no persistence ⇒ restored on reload) |
| The Sound toggle also governs the Trash crumple | 2 (`sound.beep()` — a no-op when muted, per the Plan 1 `ChimeEngine`) |
| Puzzle solvable | 1 (`shuffle` = random legal moves from `SOLVED`; never returns `SOLVED`) |

**Deferred (recorded):**
- **Trash crumple animation** — the spec pairs "crumple sound/animation"; this plan ships the beep + close only. The visual crumple (scale/skew the window to nothing before unmount) is a small `ZoomRectLayer`-style follow-up; "low priority" per the spec.
- **Full vs empty Trash icon** — the can does not change appearance after a window is trashed. Cosmetic; skipped.
- **Double-click Trash** does nothing (no "Trash is empty" window). Not in scope.
- **Puzzle "About the Puzzle" / move counter** — omitted; the spec asks for "one game, not several", not chrome around it.

**2. Placeholder scan**
- No `TODO` / `TBD`. `puzzle.ts`, both components, all CSS, and every test are given in full.
- The Trash SVG is a real path, not a stub.

**3. Type consistency**
- `Board = number[]` defined once in `puzzle.ts`; `PuzzleWindow` imports `Board` / `shuffle` / `slide` / `isSolved` from it.
- `useDrag(onDelta, onEnd?)` — the new optional second parameter; the only new caller is `Window.tsx`'s move drag. The grow-box drag keeps the one-arg form. `Window.test.tsx` is unaffected (it never passed `onDragEnd`).
- `Window` gains optional `onDragEnd?(): void`; `Desktop` is the only call site that passes it.
- `maybeTrash(id: WindowId)` uses `#win-<id>` — the `id` attribute added to `Window`'s `<section>` in Plan 3-B — and `[data-testid="titlebar"]`, already on the title bar since Plan 1.
- `WindowId` already includes `puzzle`; `DEFAULTS.puzzle` / `TITLES.puzzle` exist since Plan 1 — no `windows.ts` change.

---

## Done criteria for Plan 3-C

- `npm test` and `npm run test:e2e` green, including `src/windows/puzzle.test.ts`, `src/windows/PuzzleWindow.test.tsx`, `src/shell/useDrag.test.tsx`, `tests/desk.spec.ts`.
- `npm run build && npm run prerender:assert` green — `scripts/assert-prerendered.mjs` unchanged.
- `npx tsc --noEmit` clean.
- `tests/a11y.spec.ts` still green; axe clean with the Puzzle open (new e2e).
- JS on, ≥768px: **Apple ▸ Puzzle** opens a shuffled, solvable 15-tile puzzle; clicking a tile beside the gap slides it; Shuffle re-scrambles; solving shows "Solved!". A **Trash** icon sits at the bottom-right; dragging a window so its **title bar** overlaps the Trash beeps and closes that window; a bare click or a short miss does not; a reload brings every window back.
- No new npm dependencies.
