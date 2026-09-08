# Portfolio v2 — Plan 3-D: Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## The Plan-3 split

| | Scope | Status |
|---|---|---|
| **3-A** | Projects deck | ✅ done |
| **3-B** | Interactive menu bar (dropdowns, About, Restart, Shut Down / CRT power-off) | ✅ done |
| **3-C** | Desk accessories (15-tile Puzzle, drag-to-Trash) | ✅ done |
| **3-D** | **Polish — this plan.** Drawn 1-bit desktop-icon glyphs; a Konami-code easter egg; outline-drag with a View-menu toggle | this doc |

Deferred out of all four (from earlier reviews): dithered card transitions, general `?open=<window>` deep links, `hypercard` Terminal alias, the Trash crumple animation, the full/empty Trash icon.

---

**Goal:** Three finishing touches. (1) Replace the blank squares under Résumé / Projects / Terminal / Read Me with **hand-drawn 1-bit icons**. (2) A **Konami-code** easter egg — ↑↑↓↓←→←→BA anywhere on the desktop briefly inverts the whole screen and rings the bell. (3) **Outline dragging** — the authentic System 7 default where a dragged window shows only its 1px outline until release — with a **View ▸ Outline dragging** checkbox to switch back to live drag; the choice persists.

**Architecture:** `IconGlyph` is a `kind → <svg>` switch used by `DesktopIcons`. `useKonami(onTrigger)` is a keydown-sequence matcher; `Desktop` wires it to a 1.2s `filter: invert(1)` class on `.desktop` plus `sound.beep()`. For outline drag, the `Menu` primitive gains `menuitemcheckbox` support; `MenuBar` gains a `View` menu with one checkbox bound to `outlineDrag` / `toggleOutlineDrag` (owned by `Desktop`, persisted to `localStorage`, default **on**); `Window` accepts `outlineDrag` and, when on, accumulates the drag delta into a local offset, renders a 1px outline `<div>` at the offset position, and commits `onMove` once on release. `Window.onDragEnd` changes to `(x, y) => void` so `Desktop`'s Trash hit test uses the committed coordinates directly instead of reading a mid-flight DOM rect.

**Tech Stack:** React 18, TypeScript 5, Vitest + @testing-library/react (unit), Playwright (e2e). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-07-portfolio-v2-classic-mac-design.md` — "Desktop" (32×32-ish 1-bit icons, hand-drawn as SVG); "Motion vocabulary" (Outline drag — "outline is the authentic default"); "Easter eggs (small, curated)".

## Global Constraints

- **Strictly 1-bit.** `#000` / `#fff` via tokens; greys only via the Plan 1 dither utilities. **No `opacity`.** The icon SVGs are `stroke="#000"` on transparent. The Konami flash is `filter: invert(1)` — it maps a pure-black/white surface to pure white/black, so it stays in palette; it is the "full invert" the spec names as interaction feedback.
- **Outline drag is the default** (spec: "outline is the authentic default"), with an explicit opt-out. `localStorage['outlineDrag']` absent or `'1'` ⇒ outline; `'0'` ⇒ live.
- **The resize (grow-box) drag stays live** — the spec's outline treatment is for *moving* a window, not resizing.
- **Accessibility.** `tests/a11y.spec.ts` stays green. The `View` menu's item is `role="menuitemcheckbox"` with `aria-checked`. Icon SVGs are `aria-hidden` (the `<button>` already has a text label). The Konami flash adds no focus trap and no motion beyond a class toggle.
- **`prefers-reduced-motion`** — the Konami flash is a 1.2s state, not an animation, and is user-initiated by a deliberate 10-key sequence; leave it. Outline drag has no transition. Nothing new to gate.
- **No new page content.** All three touches are chrome; `scripts/assert-prerendered.mjs` and `#main` are untouched. Desktop-shell-only (`≥768px`).

---

### Task 1: Drawn desktop-icon glyphs

**Files:**
- Create: `src/shell/IconGlyph.tsx`
- Modify: `src/shell/DesktopIcons.tsx`
- Modify: `src/shell/Desktop.module.css` (`.glyph` — drop the border, size the SVG)
- Test: `src/shell/DesktopIcons.test.tsx` (new)

**Interfaces:**
- Produces: `IconGlyph({ kind }: { kind: 'resume' | 'projects' | 'terminal' | 'readme' })` — a single `<svg viewBox="0 0 32 32" aria-hidden>` with 1-bit line art per kind (document, folder, monitor with a prompt, note). `DesktopIcons` renders `<span className={styles.glyph}><IconGlyph kind={ic.id} /></span>` for each of its four buttons.

- [ ] **Step 1: Write the failing test**

```tsx
// src/shell/DesktopIcons.test.tsx
import { render, screen, within } from '@testing-library/react'
import DesktopIcons from './DesktopIcons'

test('each desktop icon renders a drawn glyph', () => {
  render(<DesktopIcons onOpen={() => {}} />)
  for (const name of ['Résumé', 'Projects', 'Terminal', 'Read Me']) {
    const btn = screen.getByRole('button', { name })
    expect(within(btn).getByRole('img', { hidden: true }).tagName.toLowerCase()).toBe('svg')
  }
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- DesktopIcons`
Expected: FAIL — no `<svg>` inside the icon buttons yet.

- [ ] **Step 3: Implement `IconGlyph.tsx`**

```tsx
// src/shell/IconGlyph.tsx
export type GlyphKind = 'resume' | 'projects' | 'terminal' | 'readme'

const stroke = { fill: 'none', stroke: '#000', strokeWidth: 2, strokeLinejoin: 'round' as const }

export default function IconGlyph({ kind }: { kind: GlyphKind }) {
  switch (kind) {
    case 'resume':
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <path {...stroke} d="M7 3 H21 L25 7 V29 H7 Z" />
          <path {...stroke} d="M21 3 V7 H25" />
          <path {...stroke} d="M11 13 H21 M11 18 H21 M11 23 H17" />
        </svg>
      )
    case 'projects':
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <path {...stroke} d="M4 9 H13 L16 12 H28 V26 H4 Z" />
          <path {...stroke} d="M4 9 V7 H11 L13 9" />
        </svg>
      )
    case 'terminal':
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <rect {...stroke} x="4" y="6" width="24" height="18" />
          <path {...stroke} d="M8 12 L12 15 L8 18 M14 19 H20" />
          <path {...stroke} d="M12 27 H20" />
        </svg>
      )
    case 'readme':
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <path {...stroke} d="M8 3 H20 L25 8 V29 H8 Z" />
          <path {...stroke} d="M20 3 V8 H25" />
          <path {...stroke} d="M12 6 H16" />
          <path {...stroke} d="M12 15 H21 M12 20 H21 M12 25 H18" />
        </svg>
      )
  }
}
```

- [ ] **Step 4: Wire `DesktopIcons.tsx`**

```tsx
import styles from './Desktop.module.css'
import type { WindowId } from './windows'
import IconGlyph, { type GlyphKind } from './IconGlyph'

const ICONS: { id: Extract<WindowId, GlyphKind>; label: string }[] = [
  { id: 'resume', label: 'Résumé' },
  { id: 'projects', label: 'Projects' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'readme', label: 'Read Me' },
]

export default function DesktopIcons({
  onOpen,
}: {
  onOpen: (id: WindowId, from: { x: number; y: number }) => void
}) {
  return (
    <div className={styles.icons}>
      {ICONS.map((ic) => (
        <button
          key={ic.id}
          data-window={ic.id}
          className={styles.icon}
          onDoubleClick={(e) => onOpen(ic.id, { x: e.clientX, y: e.clientY })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              const r = (e.target as HTMLElement).getBoundingClientRect()
              onOpen(ic.id, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
            }
          }}
        >
          <span className={styles.glyph}>
            <IconGlyph kind={ic.id} />
          </span>
          <span className={styles.iconLabel}>{ic.label}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Update `.glyph` in `Desktop.module.css`**

```css
.glyph {
  width: 32px;
  height: 32px;
}
.glyph svg {
  width: 100%;
  height: 100%;
  display: block;
}
```

(Drop the `border` and `background` — the SVG is the icon now.)

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- DesktopIcons`
Expected: PASS.

- [ ] **Step 7: Typecheck + commit**

Run: `npx tsc --noEmit`

```bash
git add -A
git commit -m "feat: hand-drawn 1-bit glyphs for the desktop icons"
```

---

### Task 2: Konami-code easter egg

**Files:**
- Create: `src/shell/useKonami.ts`
- Test: `src/shell/useKonami.test.ts`
- Modify: `src/shell/Desktop.tsx` (wire it — invert flash + beep)
- Modify: `src/shell/Desktop.module.css` (`.flash`)

**Interfaces:**
- Produces: `useKonami(onTrigger: () => void): void` — a `window` keydown listener that fires `onTrigger` when the exact sequence `↑ ↑ ↓ ↓ ← → ← → b a` is entered (case-insensitive for the letters); a wrong key resets progress (a wrong key that is itself `↑` starts a fresh run at position 1). `onTrigger` is read through a ref.

- [ ] **Step 1: Write the failing test**

```ts
// src/shell/useKonami.test.ts
import { renderHook } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { useKonami } from './useKonami'

const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const type = (keys: string[]) => keys.forEach((key) => fireEvent.keyDown(window, { key }))

test('fires once on the full sequence', () => {
  const cb = vi.fn()
  renderHook(() => useKonami(cb))
  type(SEQ)
  expect(cb).toHaveBeenCalledOnce()
})

test('a wrong key mid-sequence resets progress', () => {
  const cb = vi.fn()
  renderHook(() => useKonami(cb))
  type(['ArrowUp', 'ArrowUp', 'ArrowDown', 'x'])
  type(SEQ.slice(3)) // finish from where a naive matcher might still be
  expect(cb).not.toHaveBeenCalled()
})

test('re-arms after firing', () => {
  const cb = vi.fn()
  renderHook(() => useKonami(cb))
  type(SEQ)
  type(SEQ)
  expect(cb).toHaveBeenCalledTimes(2)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- useKonami`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `useKonami.ts`**

```ts
// src/shell/useKonami.ts
import { useEffect, useRef } from 'react'

const SEQ = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export function useKonami(onTrigger: () => void) {
  const pos = useRef(0)
  const cb = useRef(onTrigger)
  cb.current = onTrigger

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === SEQ[pos.current]) {
        pos.current += 1
        if (pos.current === SEQ.length) {
          pos.current = 0
          cb.current()
        }
      } else {
        pos.current = key === SEQ[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- useKonami`
Expected: PASS (all three).

- [ ] **Step 5: Wire into `Desktop.tsx`**

Add the import and a `flash` state, and call the hook (near the other `Desktop` hooks):

```tsx
import { useKonami } from './useKonami'
```

```tsx
  const [flash, setFlash] = useState(false)
  useKonami(() => {
    sound.beep()
    setFlash(true)
    setTimeout(() => setFlash(false), 1200)
  })
```

Change the root element's className:

```tsx
    <div className={`${styles.desktop} desktop ${flash ? styles.flash : ''}`}>
```

- [ ] **Step 6: `Desktop.module.css`**

```css
.flash {
  filter: invert(1);
}
```

- [ ] **Step 7: Verify + commit**

Run: `npm test && npx tsc --noEmit`

```bash
git add -A
git commit -m "feat: Konami-code easter egg — screen invert + system beep"
```

---

### Task 3: Outline dragging + View-menu toggle

**Files:**
- Modify: `src/shell/Menu.tsx` (`menuitemcheckbox` support)
- Modify: `src/shell/Menu.test.tsx` (a checkbox case)
- Modify: `src/shell/MenuBar.tsx` (a `View` menu; two new actions)
- Modify: `src/shell/MenuBar.test.tsx` (a View-menu case)
- Modify: `src/shell/Window.tsx` (`outlineDrag` prop; offset state; outline element; `onDragEnd(x, y)`)
- Modify: `src/shell/Window.module.css` (`.outline`)
- Modify: `src/shell/Desktop.tsx` (`outlineDrag` state + persistence; pass to `Window`; `maybeTrash(id, x, y)`)
- Test: `tests/outline-drag.spec.ts` (new)

**Interfaces:**
- `MenuItemSpec` gains `checked?: boolean`. When defined, `Menu` renders that item as `role="menuitemcheckbox"` with `aria-checked={checked}` and a leading `✓ ` / two spaces; `onSelect` still just fires (the caller flips the source state).
- `MenuBarActions` gains `outlineDrag: boolean` and `toggleOutlineDrag(): void`. `MenuBar` renders a `View` menu (between `Edit` and `Special`) with one item: `{ label: 'Outline dragging', checked: props.outlineDrag, onSelect: props.toggleOutlineDrag }`. `NAMES` becomes `['apple', 'file', 'edit', 'view', 'special']`.
- `Window` gains `outlineDrag?: boolean` and changes `onDragEnd?()` → `onDragEnd?(x: number, y: number)`. When `outlineDrag`, the title-bar drag accumulates `(dx, dy)` into a local `offset` state and renders `<div className={styles.outline}>` at `state.x + offset.x, state.y + offset.y`; on release it calls `onMove(finalX, finalY)` then `onDragEnd?.(finalX, finalY)` and clears the offset. When not `outlineDrag`, behaviour is unchanged (live `onMove`) and `onDragEnd?.(state.x, state.y)` is still called with the current position.
- `Desktop` owns `outlineDrag` (`localStorage['outlineDrag'] !== '0'`, default `true`), passes it to every `Window`, and its `maybeTrash(id, x, y)` builds the title-bar rect from `(x, y)` + `--menubar-h` + `state.windows[id].w` instead of reading the DOM.

- [ ] **Step 1: Write the failing tests**

Add to `src/shell/Menu.test.tsx`:

```tsx
test('a checked item is a menuitemcheckbox and toggles via onSelect', async () => {
  const pick = vi.fn()
  render(<One items={[{ label: 'Outline dragging', checked: true, onSelect: pick }]} />)
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  const item = screen.getByRole('menuitemcheckbox', { name: /outline dragging/i })
  expect(item).toHaveAttribute('aria-checked', 'true')
  await userEvent.click(item)
  expect(pick).toHaveBeenCalledOnce()
})
```

Add to `src/shell/MenuBar.test.tsx` (extend `mount`'s defaults with `outlineDrag: true, toggleOutlineDrag: vi.fn()`):

```tsx
test('View ▸ Outline dragging reflects the prop and toggles', async () => {
  const a = mount({ outlineDrag: true })
  await userEvent.click(screen.getByRole('button', { name: 'View' }))
  const item = screen.getByRole('menuitemcheckbox', { name: /outline dragging/i })
  expect(item).toHaveAttribute('aria-checked', 'true')
  await userEvent.click(item)
  expect(a.toggleOutlineDrag).toHaveBeenCalledOnce()
})
```

`tests/outline-drag.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function boot(page: Page) {
  await page.goto('/')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
}

test('outline dragging: the window commits to the drop position on release', async ({ page }) => {
  await boot(page)
  const dialog = page.getByRole('dialog', { name: /read me/i })
  const bar = dialog.getByTestId('titlebar')
  const before = await dialog.boundingBox()
  const grip = await bar.boundingBox()
  await page.mouse.move(grip!.x + 40, grip!.y + grip!.height / 2)
  await page.mouse.down()
  await page.mouse.move(grip!.x + 200, grip!.y + 140, { steps: 20 })
  // mid-drag the window itself has not moved yet
  const mid = await dialog.boundingBox()
  expect(Math.abs(mid!.x - before!.x)).toBeLessThan(6)
  await page.mouse.up()
  const after = await dialog.boundingBox()
  expect(after!.x - before!.x).toBeGreaterThan(120)
  expect(after!.y - before!.y).toBeGreaterThan(100)
})

test('View ▸ Outline dragging switches to live drag', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'View' }).click()
  await page.getByRole('menuitemcheckbox', { name: /outline dragging/i }).click()
  const dialog = page.getByRole('dialog', { name: /read me/i })
  const bar = dialog.getByTestId('titlebar')
  const before = await dialog.boundingBox()
  const grip = await bar.boundingBox()
  await page.mouse.move(grip!.x + 40, grip!.y + grip!.height / 2)
  await page.mouse.down()
  await page.mouse.move(grip!.x + 160, grip!.y + 90, { steps: 20 })
  const mid = await dialog.boundingBox()
  expect(mid!.x - before!.x).toBeGreaterThan(80) // moved live this time
  await page.mouse.up()
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test -- Menu MenuBar` then `npm run test:e2e -- outline-drag`
Expected: FAIL — no `menuitemcheckbox`, no `View` menu, no outline behaviour.

- [ ] **Step 3: `Menu.tsx` — checkbox support**

In `MenuItemSpec` add `checked?: boolean`. In the item `<button>`:

```tsx
              <button
                type="button"
                role={it.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
                aria-checked={it.checked === undefined ? undefined : it.checked}
                tabIndex={-1}
                className={styles.item}
                aria-disabled={it.disabled || !it.onSelect || undefined}
                onClick={() => activate(it)}
              >
                {it.checked === undefined ? null : (
                  <span aria-hidden>{it.checked ? '✓ ' : '  '}</span>
                )}
                {it.label}
              </button>
```

- [ ] **Step 4: `MenuBar.tsx` — the View menu**

```tsx
const NAMES = ['apple', 'file', 'edit', 'view', 'special'] as const
```

Add to `MenuBarActions`:

```ts
  outlineDrag: boolean
  toggleOutlineDrag(): void
```

Build the items and render the menu between Edit and Special:

```tsx
  const view: MenuItemSpec[] = [
    { label: 'Outline dragging', checked: props.outlineDrag, onSelect: props.toggleOutlineDrag },
  ]
```

```tsx
      <Menu label="Edit" title="Edit" items={edit} {...menuProps('edit')} />
      <Menu label="View" title="View" items={view} {...menuProps('view')} />
      <Menu label="Special" title="Special" items={special} {...menuProps('special')} />
```

- [ ] **Step 5: `Window.tsx` — outline drag**

```tsx
import { useEffect, useRef, useState, type ReactNode } from 'react'
```

```tsx
  onDragEnd?(x: number, y: number): void
  outlineDrag?: boolean
```

```tsx
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null)
  const outline = p.outlineDrag ?? false

  const drag = useDrag(
    (dx, dy) => {
      if (outline) setOffset((o) => ({ x: (o?.x ?? 0) + dx, y: (o?.y ?? 0) + dy }))
      else p.onMove(state.x + dx, state.y + dy)
    },
    () => {
      const fx = state.x + (offset?.x ?? 0)
      const fy = state.y + (offset?.y ?? 0)
      if (outline && offset) p.onMove(fx, fy)
      setOffset(null)
      p.onDragEnd?.(fx, fy)
    },
  )
```

Wrap the return in a fragment and add the outline element after `</section>`:

```tsx
  return (
    <>
      <section /* …unchanged… */>
        {/* …unchanged… */}
      </section>
      {outline && offset && (
        <div
          className={styles.outline}
          aria-hidden
          style={{
            left: state.x + offset.x,
            top: state.y + offset.y,
            width: state.w,
            height: state.shaded ? 20 : state.h,
            zIndex: 9998,
          }}
        />
      )}
    </>
  )
```

- [ ] **Step 6: `Window.module.css`**

```css
.outline {
  position: absolute;
  border: 1px solid var(--black);
  pointer-events: none;
  background: transparent;
}
```

- [ ] **Step 7: `Desktop.tsx` — own the setting, feed the windows, fix the Trash math**

```tsx
  const [outlineDrag, setOutlineDrag] = useState(() => {
    try {
      return localStorage.getItem('outlineDrag') !== '0'
    } catch {
      return true
    }
  })
  const toggleOutlineDrag = useCallback(() => {
    setOutlineDrag((v) => {
      const next = !v
      try {
        localStorage.setItem('outlineDrag', next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])
```

Add `outlineDrag` and `toggleOutlineDrag` to the `menuActions` object.

Replace `maybeTrash`:

```tsx
  const maybeTrash = (id: WindowId, x: number, y: number) => {
    const trashEl = document.querySelector<HTMLElement>('[data-trash]')
    if (!trashEl) return
    const t = trashEl.getBoundingClientRect()
    const menubarH =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--menubar-h'), 10) || 22
    const w = state.windows[id].w
    const barTop = y + menubarH
    const bar = { left: x, right: x + w, top: barTop, bottom: barTop + 22 }
    const overlap =
      bar.left < t.right && bar.right > t.left && bar.top < t.bottom && bar.bottom > t.top
    if (!overlap) return
    sound.beep()
    close(id)
  }
```

In the `openWindows.map`, pass both:

```tsx
          onDragEnd={(x, y) => maybeTrash(id, x, y)}
          outlineDrag={outlineDrag}
```

- [ ] **Step 8: Run the unit tests to verify they pass**

Run: `npm test -- Menu MenuBar Window`
Expected: PASS. The existing `tests/window.spec.ts` drag/resize e2e still passes because the window commits on release (assertions read the box *after* `mouse.up`).

- [ ] **Step 9: Run the e2e**

Run: `npm run test:e2e -- outline-drag window desk`
Expected: PASS. `desk.spec.ts` "dragging a window onto the Trash closes it" still passes — `maybeTrash` now uses the committed `(x, y)` from `onDragEnd`, which is correct for both outline and live drag.

- [ ] **Step 10: Full regression**

Run: `npm test && npm run test:e2e && npm run build && npm run prerender:assert`
Expected: all green. Watch `tests/window.spec.ts`, `tests/desk.spec.ts`, `tests/menubar.spec.ts`, `tests/a11y.spec.ts`.

- [ ] **Step 11: Manual smoke**

`npm run dev`, skip boot. Icons show drawn glyphs. Drag a window by its title bar → only a 1px outline follows; release → the window jumps there. **View ▸ Outline dragging** (checked) → uncheck → drag now moves the window live; reload → still live (persisted); re-check → outline again. Drag a window's outline onto the **Trash** → beep + close. Type ↑↑↓↓←→←→BA → the whole screen inverts for ~1s and the bell rings.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: outline dragging (System 7 default) with a View ▸ Outline dragging toggle"
```

---

## Self-Review

**1. Spec coverage**

| Spec point | Task |
| --- | --- |
| Desktop icons: 32×32-ish 1-bit icons, hand-drawn as SVG (Résumé, Projects, Terminal, Read Me) | 1 (`IconGlyph`, four `<svg viewBox="0 0 32 32">`) |
| Outline drag: dragging a window shows only its 1px outline until release; outline is the authentic default; toggle also offers live drag | 3 (`Window` offset + outline `<div>`; `View ▸ Outline dragging` checkbox; default on; persisted) |
| Easter eggs — small, curated | 2 (Konami → invert + beep) |
| Sound toggle governs the system beep | 2 (`sound.beep()` — no-op when muted, per Plan 1) |

**Deferred (recorded):**
- **The Trash "crumple" animation** and the **full/empty Trash icon** — still deferred from 3-C.
- **Live-drag as the default** — the spec makes outline the default; this plan honours that. No further default-switching planned.
- **Icon selection state** (single-click selects, invert) — the icons already invert their label on `:focus-visible`; a distinct click-to-select state is not added.
- **`View` menu beyond the one toggle** (icon size, list view) — no such view state exists; unchanged from 3-B's deferral.

**2. Placeholder scan**
- No `TODO` / `TBD`. Four real SVGs, a real `useKonami`, the full `Window` diff, and every test are given.
- The Konami `filter: invert(1)` is a real effect, not a stand-in.

**3. Type consistency**
- `GlyphKind = 'resume' | 'projects' | 'terminal' | 'readme'` defined in `IconGlyph.tsx`; `DesktopIcons` narrows its `ICONS` ids to `Extract<WindowId, GlyphKind>` so `kind={ic.id}` typechecks.
- `MenuItemSpec.checked?: boolean` — one new optional field; `Menu` branches on `checked === undefined`. Existing callers (File/Edit/Special/Apple items) omit it and are unaffected.
- `MenuBarActions` gains `outlineDrag: boolean` + `toggleOutlineDrag(): void`; the sole constructor (`Desktop`) and the test mock (`MenuBar.test.tsx`) both add them.
- `Window.onDragEnd` signature changes `()` → `(x: number, y: number)`. The only caller is `Desktop`'s `onDragEnd={(x, y) => maybeTrash(id, x, y)}`; `maybeTrash`'s signature changes to match. `Window.test.tsx` never passes `onDragEnd`, so it is unaffected.
- `useKonami(onTrigger: () => void)` — same signature in the hook, its test, and the `Desktop` call site.

---

## Done criteria for Plan 3-D

- `npm test` and `npm run test:e2e` green, including `src/shell/DesktopIcons.test.tsx`, `src/shell/useKonami.test.ts`, the new `Menu` / `MenuBar` checkbox cases, and `tests/outline-drag.spec.ts`.
- `npm run build && npm run prerender:assert` green — `scripts/assert-prerendered.mjs` unchanged.
- `npx tsc --noEmit` clean; `tests/a11y.spec.ts` still green.
- JS on, ≥768px: the four desktop icons show drawn 1-bit glyphs; dragging a window shows a 1px outline that follows the cursor and the window commits on release; **View ▸ Outline dragging** unchecks to live drag and the choice survives a reload; dragging a window (outline or live) onto the **Trash** beeps and closes it; the Konami code inverts the screen for ~1.2s and rings the bell.
- No new npm dependencies.
