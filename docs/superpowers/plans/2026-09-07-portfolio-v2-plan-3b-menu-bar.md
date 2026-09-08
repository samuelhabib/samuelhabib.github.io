# Portfolio v2 — Plan 3-B: Interactive Menu Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## The Plan-3 split

The spec's "Plan 3" is four independent subsystems, shipped as separate plans:

| | Scope | Status |
|---|---|---|
| **3-A** | Projects deck (content pipeline, deck window, deep link, Terminal command) | ✅ done |
| **3-B** | **Interactive menu bar — this plan** (keyboard-accessible dropdowns wired to actions; About This Portfolio dialog; Restart; Shut Down + CRT power-off) | this doc |
| **3-C** | Desk accessories — 15-tile Puzzle window, Trash icon + drag-to-trash crumple | next |
| **3-D** | Polish — Read Me easter eggs, outline-drag toggle for windows | after |

Deferred out of all four (from A's review): dithered card transitions, general `?open=<window>` deep links, `hypercard` Terminal alias.

---

**Goal:** Turn the display-only menu bar into working Apple / File / Edit / Special menus — keyboard- and mouse-navigable dropdowns wired to real actions (open a window, close the front window, Save as PDF, Select All, Restart, Shut Down) — plus the "About This Portfolio" dialog the Apple menu opens and the one-time CRT power-off + "safe to turn off" screen that Shut Down triggers.

**Architecture:** A `Menu` primitive (the ARIA menu-button pattern: a trigger `<button aria-haspopup="menu" aria-expanded>` + a `<div role="menu">` of `<button role="menuitem">`, with arrow-key / Enter / Esc / Home / End handling and roving focus). `MenuBar` owns "which menu is open" (one at a time), closes on outside pointerdown, cycles between menus with ←/→, and builds each menu's item list from action callbacks passed by `Desktop`. `Desktop` supplies those callbacks from its existing reducer / `frontWindow` / `close`, mounts a new `about` window (`AboutDialog`), and holds the `shutdown` boolean that renders the full-screen `ShutDown` layer. No `role="menubar"` — the menu-button pattern keeps the Sound toggle and clock as ordinary siblings without tripping `aria-required-children`.

**Tech Stack:** React 18, TypeScript 5, Web Animations API for the CRT collapse (hand-rolled, `steps()`, reduced-motion → instant), Vitest + @testing-library/react (unit), Playwright + @axe-core/playwright (e2e). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-07-portfolio-v2-classic-mac-design.md` — "Menu bar" under Desktop; "Motion vocabulary" (menu drop, CRT power-off); "Easter eggs" #2 (About This Portfolio).

## Global Constraints

- **Strictly 1-bit.** `#000` / `#fff` via tokens only. No greys except the Plan 1 dither utilities. **No `opacity`** for disabled/de-emphasis — disabled menu items render in a struck-or-outlined style, never faded. Hover / active on a menu item is a full invert.
- **Menus snap open** — no fade, no slide (spec: "menus snap open"). A thin invert "flash" on selection is allowed but optional.
- **The CRT power-off runs once, deliberately** (spec). `prefers-reduced-motion: reduce` → skip straight to the "safe to turn off" screen, no animation.
- **Accessibility must not regress.** `tests/a11y.spec.ts` ("no serious axe violations on load") stays green — menus are closed on load. A new e2e asserts axe stays clean with a menu **open**. Every menu item is a real `<button>`; disabled items carry `aria-disabled="true"` and are skipped by arrow navigation. Every trigger has an accessible name (the Apple trigger via `aria-label`).
- **No new page content.** The About dialog's text (version line, build date, joke memory bar) is chrome, not résumé content — `scripts/assert-prerendered.mjs` is untouched. The `about` window is desktop-shell-only; it is not added to `#main`.
- **Desktop shell only.** All of 3-B lives in the `≥768px` hydrated shell. `#main` / mobile / no-JS are unaffected.

---

### Task 1: The `Menu` primitive

**Files:**
- Create: `src/shell/Menu.tsx`
- Create: `src/shell/Menu.module.css`
- Test: `src/shell/Menu.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  export interface MenuItemSpec {
    label: string
    onSelect?: () => void        // absent => rendered disabled
    disabled?: boolean           // explicitly disabled (e.g. Edit ▸ Undo)
    separatorBefore?: boolean    // draw a role="separator" above this item
  }
  interface MenuProps {
    label: React.ReactNode       // "File", or the Apple glyph element
    title: string                // accessible name for the trigger + the menu
    items: MenuItemSpec[]
    open: boolean
    onOpen(): void
    onClose(): void
    onCycle(dir: -1 | 1): void    // ←/→ to the sibling menu
  }
  export default function Menu(props: MenuProps): JSX.Element
  ```
  Behaviour: trigger click toggles. When `open`, the first enabled item is focused. On the menu: ↑/↓ move (skipping disabled, wrapping), Home/End jump, Enter/Space/click activate (`onSelect()` then `onClose()` then focus the trigger), Esc closes and refocuses the trigger, Tab closes, ←/→ call `onCycle`. On the trigger: ↓/Enter/Space open, ←/→ call `onCycle`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/shell/Menu.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import Menu, { type MenuItemSpec } from './Menu'

function One({ items }: { items: MenuItemSpec[] }) {
  const [open, setOpen] = useState(false)
  return (
    <Menu
      label="File"
      title="File"
      items={items}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onCycle={() => {}}
    />
  )
}

test('click opens the menu and focuses the first enabled item', async () => {
  const pick = vi.fn()
  render(<One items={[{ label: 'Open', onSelect: pick }, { label: 'Close', onSelect: () => {} }]} />)
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  expect(screen.getByRole('menu', { name: 'File' })).toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus()
})

test('ArrowDown moves focus and Enter activates then closes', async () => {
  const pick = vi.fn()
  render(<One items={[{ label: 'Open', onSelect: () => {} }, { label: 'Close', onSelect: pick }]} />)
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.keyboard('{ArrowDown}{Enter}')
  expect(pick).toHaveBeenCalledOnce()
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'File' })).toHaveFocus()
})

test('disabled items are skipped by arrows and cannot be activated', async () => {
  const pick = vi.fn()
  render(
    <One
      items={[
        { label: 'Undo', disabled: true },
        { label: 'Select All', onSelect: pick },
      ]}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  expect(screen.getByRole('menuitem', { name: 'Select All' })).toHaveFocus()
  await userEvent.click(screen.getByRole('menuitem', { name: 'Undo' }))
  expect(pick).not.toHaveBeenCalled()
  expect(screen.getByRole('menuitem', { name: 'Undo' })).toHaveAttribute('aria-disabled', 'true')
})

test('Escape closes and returns focus to the trigger', async () => {
  render(<One items={[{ label: 'Open', onSelect: () => {} }]} />)
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'File' })).toHaveFocus()
})

test('ArrowRight on an open menu calls onCycle(1)', async () => {
  const cycle = vi.fn()
  function Harness() {
    const [open, setOpen] = useState(true)
    return (
      <Menu
        label="File"
        title="File"
        items={[{ label: 'Open', onSelect: () => {} }]}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onCycle={cycle}
      />
    )
  }
  render(<Harness />)
  await userEvent.keyboard('{ArrowRight}')
  expect(cycle).toHaveBeenCalledWith(1)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- src/shell/Menu`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `Menu.tsx`**

```tsx
// src/shell/Menu.tsx
import { Fragment, useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import styles from './Menu.module.css'

export interface MenuItemSpec {
  label: string
  onSelect?: () => void
  disabled?: boolean
  separatorBefore?: boolean
}

interface MenuProps {
  label: ReactNode
  title: string
  items: MenuItemSpec[]
  open: boolean
  onOpen(): void
  onClose(): void
  onCycle(dir: -1 | 1): void
}

export default function Menu({ label, title, items, open, onOpen, onClose, onCycle }: MenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const enabled = items
    .map((it, i) => (it.disabled || !it.onSelect ? -1 : i))
    .filter((i) => i >= 0)
  const activePos = useRef(0)

  const focusAt = (pos: number) => {
    activePos.current = pos
    const real = enabled[pos]
    menuRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
      [real]?.focus()
  }

  useEffect(() => {
    if (open && enabled.length) focusAt(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const move = (delta: number) => {
    if (!enabled.length) return
    focusAt((activePos.current + delta + enabled.length) % enabled.length)
  }

  const activate = (it: MenuItemSpec) => {
    if (it.disabled || !it.onSelect) return
    it.onSelect()
    onClose()
    triggerRef.current?.focus()
  }

  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open ? onClose() : onOpen()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      onCycle(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onCycle(-1)
    }
  }

  const onMenuKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        move(1)
        break
      case 'ArrowUp':
        e.preventDefault()
        move(-1)
        break
      case 'Home':
        e.preventDefault()
        focusAt(0)
        break
      case 'End':
        e.preventDefault()
        focusAt(enabled.length - 1)
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        triggerRef.current?.focus()
        break
      case 'Tab':
        onClose()
        break
      case 'ArrowRight':
        e.preventDefault()
        onCycle(1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        onCycle(-1)
        break
    }
  }

  return (
    <div className={styles.menu}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={title}
        onClick={() => (open ? onClose() : onOpen())}
        onKeyDown={onTriggerKey}
      >
        {label}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={title}
          className={styles.drop}
          onKeyDown={onMenuKey}
        >
          {items.map((it, i) => (
            <Fragment key={i}>
              {it.separatorBefore && <div role="separator" className={styles.sep} />}
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={styles.item}
                aria-disabled={it.disabled || !it.onSelect || undefined}
                onClick={() => activate(it)}
              >
                {it.label}
              </button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Implement `Menu.module.css`**

```css
/* src/shell/Menu.module.css */
.menu {
  position: relative;
}
.trigger {
  font-family: var(--font-chrome);
  font-size: 12px;
  padding: 0 6px;
  height: var(--menubar-h);
  display: flex;
  align-items: center;
}
.trigger[aria-expanded='true'],
.trigger:hover {
  background: var(--black);
  color: var(--white);
}
.drop {
  position: absolute;
  left: 0;
  top: 100%;
  min-width: 180px;
  background: var(--white);
  border: 1px solid var(--black);
  box-shadow: 3px 3px 0 var(--black);
  padding: 2px 0;
  z-index: 1;
}
.item {
  display: block;
  width: 100%;
  text-align: left;
  font-family: var(--font-chrome);
  font-size: 12px;
  padding: 2px 20px 2px 14px;
}
.item:hover:not([aria-disabled='true']),
.item:focus-visible {
  background: var(--black);
  color: var(--white);
  outline: none;
}
.item[aria-disabled='true'] {
  text-decoration: line-through;
  cursor: default;
}
.sep {
  border-top: 1px solid var(--black);
  margin: 3px 0;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/shell/Menu`
Expected: PASS (all five).

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit`

```bash
git add -A
git commit -m "feat: Menu primitive — ARIA menu-button dropdown with keyboard nav"
```

---

### Task 2: Rewrite `MenuBar` around `Menu`

**Files:**
- Modify: `src/shell/MenuBar.tsx` (full rewrite)
- Modify: `src/shell/MenuBar.module.css`
- Test: `src/shell/MenuBar.test.tsx` (new)

**Interfaces:**
- Consumes: `Menu`, `MenuItemSpec` from Task 1; `useSound`; `WindowId` from `./windows`.
- Produces:
  ```ts
  export interface MenuBarActions {
    openWindow(id: WindowId): void
    closeFront(): void
    hasFront: boolean
    print(): void
    selectAllInFront(): void
    restart(): void
    shutDown(): void
  }
  export default function MenuBar(props: MenuBarActions): JSX.Element
  ```
  `MenuBar` owns `open: 'apple' | 'file' | 'edit' | 'special' | null` (one at a time), closes on `pointerdown` outside `.bar`, and passes `onCycle` so ←/→ wraps across the four menus. Menu contents:
  - **Apple** (glyph trigger, `aria-label="Apple menu"`): `About This Portfolio` → `openWindow('about')`.
  - **File**: `Résumé` / `Read Me` / `Projects` / `Terminal` → `openWindow(id)`; `Close` (separator; `disabled` when `!hasFront`) → `closeFront()`; `Save as PDF…` (separator) and `Print…` → `print()`.
  - **Edit**: `Undo` (disabled); `Cut` / `Copy` / `Paste` (separator before Cut, disabled); `Select All` (separator) → `selectAllInFront()`.
  - **Special**: `Restart` → `restart()`; `Shut Down` → `shutDown()`.
  - The existing Sound toggle button and live clock stay, as ordinary siblings after the menus.

- [ ] **Step 1: Write the failing test**

```tsx
// src/shell/MenuBar.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenuBar, { type MenuBarActions } from './MenuBar'
import { SoundProvider } from './useSound'

function mount(over: Partial<MenuBarActions> = {}) {
  const actions: MenuBarActions = {
    openWindow: vi.fn(),
    closeFront: vi.fn(),
    hasFront: true,
    print: vi.fn(),
    selectAllInFront: vi.fn(),
    restart: vi.fn(),
    shutDown: vi.fn(),
    ...over,
  }
  render(
    <SoundProvider>
      <MenuBar {...actions} />
    </SoundProvider>,
  )
  return actions
}

test('File ▸ Terminal opens that window and closes the menu', async () => {
  const a = mount()
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Terminal' }))
  expect(a.openWindow).toHaveBeenCalledWith('terminal')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

test('File ▸ Close is disabled when there is no front window', async () => {
  mount({ hasFront: false })
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  expect(screen.getByRole('menuitem', { name: 'Close' })).toHaveAttribute('aria-disabled', 'true')
})

test('Edit ▸ Undo is disabled; Select All works', async () => {
  const a = mount()
  await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
  expect(screen.getByRole('menuitem', { name: 'Undo' })).toHaveAttribute('aria-disabled', 'true')
  await userEvent.click(screen.getByRole('menuitem', { name: 'Select All' }))
  expect(a.selectAllInFront).toHaveBeenCalledOnce()
})

test('Special ▸ Shut Down calls shutDown', async () => {
  const a = mount()
  await userEvent.click(screen.getByRole('button', { name: 'Special' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Shut Down' }))
  expect(a.shutDown).toHaveBeenCalledOnce()
})

test('only one menu is open at a time', async () => {
  mount()
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
  expect(screen.getByRole('menu', { name: 'Edit' })).toBeInTheDocument()
  expect(screen.queryByRole('menu', { name: 'File' })).not.toBeInTheDocument()
})

test('a pointerdown outside the bar closes the open menu', async () => {
  mount()
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.click(document.body)
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

test('the Sound toggle still flips', async () => {
  mount()
  const btn = screen.getByRole('button', { name: /sound: on/i })
  await userEvent.click(btn)
  expect(screen.getByRole('button', { name: /sound: off/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- src/shell/MenuBar`
Expected: FAIL — `MenuBar` takes no props yet / no menu roles.

- [ ] **Step 3: Rewrite `MenuBar.tsx`**

```tsx
// src/shell/MenuBar.tsx
import { useEffect, useRef, useState } from 'react'
import { useSound } from './useSound'
import Menu, { type MenuItemSpec } from './Menu'
import type { WindowId } from './windows'
import styles from './MenuBar.module.css'

export interface MenuBarActions {
  openWindow(id: WindowId): void
  closeFront(): void
  hasFront: boolean
  print(): void
  selectAllInFront(): void
  restart(): void
  shutDown(): void
}

const NAMES = ['apple', 'file', 'edit', 'special'] as const
type MenuName = (typeof NAMES)[number]

export default function MenuBar(props: MenuBarActions) {
  const [open, setOpen] = useState<MenuName | null>(null)
  const [clock, setClock] = useState('')
  const sound = useSound()
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])

  const cycle = (from: MenuName) => (dir: -1 | 1) =>
    setOpen(NAMES[(NAMES.indexOf(from) + dir + NAMES.length) % NAMES.length])

  const menuProps = (name: MenuName) => ({
    open: open === name,
    onOpen: () => setOpen(name),
    onClose: () => setOpen(null),
    onCycle: cycle(name),
  })

  const file: MenuItemSpec[] = [
    { label: 'Résumé', onSelect: () => props.openWindow('resume') },
    { label: 'Read Me', onSelect: () => props.openWindow('readme') },
    { label: 'Projects', onSelect: () => props.openWindow('projects') },
    { label: 'Terminal', onSelect: () => props.openWindow('terminal') },
    {
      label: 'Close',
      separatorBefore: true,
      disabled: !props.hasFront,
      onSelect: props.hasFront ? props.closeFront : undefined,
    },
    { label: 'Save as PDF…', separatorBefore: true, onSelect: props.print },
    { label: 'Print…', onSelect: props.print },
  ]
  const edit: MenuItemSpec[] = [
    { label: 'Undo', disabled: true },
    { label: 'Cut', separatorBefore: true, disabled: true },
    { label: 'Copy', disabled: true },
    { label: 'Paste', disabled: true },
    { label: 'Select All', separatorBefore: true, onSelect: props.selectAllInFront },
  ]
  const special: MenuItemSpec[] = [
    { label: 'Restart', onSelect: props.restart },
    { label: 'Shut Down', onSelect: props.shutDown },
  ]

  return (
    <div className={styles.bar} ref={barRef}>
      <Menu
        label={<span className={styles.apple} aria-hidden />}
        title="Apple menu"
        items={[{ label: 'About This Portfolio', onSelect: () => props.openWindow('about') }]}
        {...menuProps('apple')}
      />
      <Menu label="File" title="File" items={file} {...menuProps('file')} />
      <Menu label="Edit" title="Edit" items={edit} {...menuProps('edit')} />
      <Menu label="Special" title="Special" items={special} {...menuProps('special')} />
      <button className={styles.toggle} onClick={sound.toggle} aria-pressed={!sound.muted}>
        {sound.muted ? 'Sound: Off' : 'Sound: On'}
      </button>
      <span className={styles.clock}>{clock}</span>
    </div>
  )
}
```

- [ ] **Step 4: Update `MenuBar.module.css`**

Replace the `.item` rule (the old display-only span) — keep everything else:

```css
.bar {
  position: fixed;
  inset: 0 0 auto 0;
  height: var(--menubar-h);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  background: var(--white);
  border-bottom: 1px solid var(--black);
  font-family: var(--font-chrome);
  font-size: 12px;
  z-index: 1000;
}
.apple {
  width: 14px;
  height: 14px;
  background: var(--black);
  -webkit-mask: radial-gradient(circle at 50% 55%, #000 42%, transparent 43%);
  mask: radial-gradient(circle at 50% 55%, #000 42%, transparent 43%);
}
.toggle {
  font-family: var(--font-chrome);
  font-size: 12px;
  padding: 0 6px;
  margin-left: 12px;
}
.toggle:active {
  background: var(--black);
  color: var(--white);
}
.clock {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/shell/MenuBar`
Expected: PASS (all seven).

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit` — expect errors only in `Desktop.tsx` (it renders `<MenuBar />` with no props yet); that is fixed in Task 4. Commit anyway so the primitive + bar land together:

```bash
git add -A
git commit -m "feat: interactive MenuBar (Apple/File/Edit/Special) wired to action props"
```

---

### Task 3: `AboutDialog` and `ShutDown`

**Files:**
- Create: `src/windows/AboutDialog.tsx`
- Create: `src/windows/AboutDialog.module.css`
- Create: `src/shell/ShutDown.tsx`
- Create: `src/shell/ShutDown.module.css`
- Modify: `vite.config.ts` (a `__BUILD_DATE__` define)
- Modify: `src/vite-env.d.ts` (declare it)
- Test: `src/windows/AboutDialog.test.tsx`
- Test: `src/shell/ShutDown.test.tsx`

**Interfaces:**
- Produces:
  - `AboutDialog` default export — no props. Renders the "About This Portfolio" content: a title, a "System 7, remastered — v2" line, a "Built <date>" line (from `__BUILD_DATE__`), Samuel's name, and a "Total Memory" bar of four dithered segments (`System` / `Side projects` / `Coffee` / `Sleep`) with a legend, using the Plan 1 `.dither-75 / .dither-50 / .dither-25` utilities.
  - `ShutDown` default export — props `{ onStartup(): void }`. A fixed full-screen layer: a white "screen" rect that collapses (`scaleY` → line → `scaleX` → dot) via WAAPI `steps()`, then a black screen with "It is now safe to turn off your Macintosh." and a full-bleed `<button>` that calls `onStartup` on any click. `prefers-reduced-motion: reduce` → render the black screen immediately, no animation.
  - `vite.config.ts` gains `define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)) }`; `src/vite-env.d.ts` gains `declare const __BUILD_DATE__: string`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/windows/AboutDialog.test.tsx
import { render, screen } from '@testing-library/react'
import AboutDialog from './AboutDialog'

test('shows the version line, a build date, and the memory legend', () => {
  render(<AboutDialog />)
  expect(screen.getByText(/system 7, remastered/i)).toBeInTheDocument()
  expect(screen.getByText(/^Built /)).toBeInTheDocument()
  expect(screen.getByText('Total Memory')).toBeInTheDocument()
  for (const label of ['System', 'Side projects', 'Coffee', 'Sleep']) {
    expect(screen.getByText(label)).toBeInTheDocument()
  }
})
```

```tsx
// src/shell/ShutDown.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShutDown from './ShutDown'

const setReduce = (v: boolean) => {
  window.matchMedia = ((q: string) => ({
    matches: /reduced-motion/.test(q) ? v : /min-width/.test(q),
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

test('under reduced motion it shows the safe-to-power-off screen immediately', async () => {
  setReduce(true)
  const onStartup = vi.fn()
  render(<ShutDown onStartup={onStartup} />)
  expect(screen.getByText(/safe to turn off/i)).toBeInTheDocument()
  await userEvent.click(screen.getByText(/safe to turn off/i))
  expect(onStartup).toHaveBeenCalledOnce()
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test -- AboutDialog ShutDown`
Expected: FAIL — modules not found.

- [ ] **Step 3: Add the build-date define**

`vite.config.ts` — add inside `defineConfig({ ... })`:

```ts
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
```

`src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

declare const __BUILD_DATE__: string
```

- [ ] **Step 4: Implement `AboutDialog.tsx` + CSS**

```tsx
// src/windows/AboutDialog.tsx
import styles from './AboutDialog.module.css'

const SEGMENTS = [
  { label: 'System', dither: 'dither-75' },
  { label: 'Side projects', dither: 'dither-50' },
  { label: 'Coffee', dither: 'dither-25' },
  { label: 'Sleep', dither: '' },
]

export default function AboutDialog() {
  return (
    <div className={styles.about}>
      <p className={styles.title}>Portfolio</p>
      <p className={styles.line}>System 7, remastered — v2</p>
      <p className={styles.line}>Built {__BUILD_DATE__}</p>
      <p className={styles.line}>Samuel Habib</p>

      <p className={styles.memLabel}>Total Memory</p>
      <div className={styles.bar} aria-hidden>
        {SEGMENTS.map((s) => (
          <div key={s.label} className={`${styles.seg} ${s.dither}`.trim()} />
        ))}
      </div>
      <ul className={styles.legend}>
        {SEGMENTS.map((s) => (
          <li key={s.label}>{s.label}</li>
        ))}
      </ul>
    </div>
  )
}
```

```css
/* src/windows/AboutDialog.module.css */
.about {
  padding: var(--space-4);
  font-family: var(--font-chrome);
  font-size: 12px;
  text-align: center;
}
.title {
  font-size: var(--fs-h2);
  margin: 0 0 8px;
}
.line {
  margin: 2px 0;
}
.memLabel {
  margin: 16px 0 4px;
  text-align: left;
}
.bar {
  display: flex;
  height: 16px;
  border: 1px solid var(--black);
}
.seg {
  flex: 1;
  border-right: 1px solid var(--black);
}
.seg:last-child {
  border-right: 0;
}
.legend {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-meta);
}
```

- [ ] **Step 5: Implement `ShutDown.tsx` + CSS**

```tsx
// src/shell/ShutDown.tsx
import { useEffect, useRef, useState } from 'react'
import styles from './ShutDown.module.css'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ShutDown({ onStartup }: { onStartup(): void }) {
  const [collapsed, setCollapsed] = useState(prefersReduced())
  const crtRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (collapsed || !crtRef.current) return
    const anim = crtRef.current.animate(
      [
        { transform: 'scaleY(1) scaleX(1)' },
        { transform: 'scaleY(0.004) scaleX(1)' },
        { transform: 'scaleY(0.004) scaleX(0.004)' },
      ],
      { duration: 320, easing: 'steps(8, end)', fill: 'forwards' },
    )
    anim.onfinish = () => setCollapsed(true)
    return () => anim.cancel()
  }, [collapsed])

  return (
    <div className={styles.root}>
      {!collapsed && <div ref={crtRef} className={styles.crt} />}
      {collapsed && (
        <button type="button" className={styles.safe} onClick={onStartup}>
          <span>It is now safe to turn off your Macintosh.</span>
          <span className={styles.hint}>Click anywhere to start up again.</span>
        </button>
      )}
    </div>
  )
}
```

```css
/* src/shell/ShutDown.module.css */
.root {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: var(--black);
}
.crt {
  position: absolute;
  inset: 0;
  background: var(--white);
  transform-origin: 50% 50%;
}
.safe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--black);
  color: var(--white);
  font-family: var(--font-chrome);
  font-size: 14px;
}
.hint {
  font-size: var(--fs-meta);
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- AboutDialog ShutDown`
Expected: PASS. If jsdom's `element.animate` returns something without an `onfinish` hook and the non-reduced `ShutDown` test ever gets added, keep `ShutDown` tests to the reduced-motion path only (as written) — the animation path is covered by the Task 4 e2e in real Chromium.

- [ ] **Step 7: Full unit run + typecheck + commit**

Run: `npm test && npx tsc --noEmit` (expect the same pre-existing `Desktop.tsx` MenuBar-props error from Task 2; nothing new).

```bash
git add -A
git commit -m "feat: About This Portfolio dialog + CRT power-off / safe-to-power-off screen"
```

---

### Task 4: Wire `Desktop` — actions, the `about` window, the shutdown overlay

**Files:**
- Modify: `src/shell/Desktop.tsx`
- Modify: `src/shell/Window.tsx` (add `id={`win-${state.id}`}` for Select All)
- Test: `tests/menubar.spec.ts` (new)

**Interfaces:**
- Consumes: `MenuBar` / `MenuBarActions` from Task 2; `AboutDialog` from Task 3; `ShutDown` from Task 3; the existing reducer / `frontWindow` / `close`.
- Produces: `Desktop` builds a `MenuBarActions` object and passes it to `<MenuBar />`; mounts `about: <AboutDialog />` in `content`; holds `shutdown` state and renders `<ShutDown onStartup={restart} />` when true. `restart` = clear the `booted` session flag + `location.reload()`. `selectAllInFront` selects the text of the DOM node `#win-<frontId>`.

- [ ] **Step 1: Write the failing e2e test**

```ts
// tests/menubar.spec.ts
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

test('File ▸ Terminal opens the Terminal window', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'File' }).click()
  await page.getByRole('menuitem', { name: 'Terminal' }).click()
  await expect(page.getByRole('dialog', { name: /terminal/i })).toBeVisible()
})

test('Apple ▸ About This Portfolio opens the About dialog', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: 'About This Portfolio' }).click()
  const about = page.getByRole('dialog', { name: /about this portfolio/i })
  await expect(about).toBeVisible()
  await expect(about.getByText('Total Memory')).toBeVisible()
})

test('no serious axe violations with a menu open', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'File' }).click()
  await expect(page.getByRole('menu', { name: 'File' })).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(serious).toEqual([])
})

test('the menus are keyboard navigable', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'File' }).focus()
  await page.keyboard.press('ArrowDown') // open, focus first item (Résumé)
  await expect(page.getByRole('menuitem', { name: 'Résumé' })).toBeFocused()
  await page.keyboard.press('ArrowRight') // cycle to Edit
  await expect(page.getByRole('menu', { name: 'Edit' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
})

test('Special ▸ Shut Down shows the safe-to-power-off screen, then a click restarts', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Special' }).click()
  await page.getByRole('menuitem', { name: 'Shut Down' }).click()
  await expect(page.getByText(/safe to turn off/i)).toBeVisible({ timeout: 4000 })
  await page.getByText(/safe to turn off/i).click()
  // reload → boot replays (session flag was cleared)
  await expect(page.getByText('Welcome to Macintosh')).toBeVisible({ timeout: 4000 })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:e2e -- menubar`
Expected: FAIL — clicking `File` does nothing (MenuBar still gets no props from `Desktop`).

- [ ] **Step 3: Add the Select-All target id to `Window.tsx`**

In `src/shell/Window.tsx`, on the `<section>`:

```tsx
    <section
      ref={ref}
      id={`win-${state.id}`}
      role="dialog"
      aria-label={p.title}
```

- [ ] **Step 4: Wire `Desktop.tsx`**

Add imports:

```tsx
import AboutDialog from '../windows/AboutDialog'
import ShutDown from './ShutDown'
import type { MenuBarActions } from './MenuBar'
```

Inside `Desktop()`, after `front` is computed (`const front = frontWindow(state)`), add:

```tsx
  const [shutdown, setShutdown] = useState(false)

  const restart = useCallback(() => {
    try {
      sessionStorage.removeItem('booted')
    } catch {
      /* ignore */
    }
    window.location.reload()
  }, [])

  const menuActions: MenuBarActions = {
    openWindow: (id) => dispatch({ type: 'open', id }),
    closeFront: () => front && close(front),
    hasFront: front !== null,
    print: () => window.print(),
    selectAllInFront: () => {
      if (!front) return
      const el = document.getElementById(`win-${front}`)
      if (!el) return
      const sel = window.getSelection()
      sel?.removeAllRanges()
      const range = document.createRange()
      range.selectNodeContents(el)
      sel?.addRange(range)
    },
    restart,
    shutDown: () => setShutdown(true),
  }
```

Change `<MenuBar />` to `<MenuBar {...menuActions} />`.

Add `about` to `content`:

```tsx
  const content: Partial<Record<WindowId, ReactNode>> = {
    resume: <ResumeWindow />,
    readme: <ReadMeWindow />,
    terminal: <TerminalWindow bridge={bridge} />,
    projects: <ProjectsWindow target={stackTarget} />,
    about: <AboutDialog />,
  }
```

Render the overlay at the end of the returned tree, after the `openWindows.map(...)`:

```tsx
      {shutdown && <ShutDown onStartup={restart} />}
    </div>
  )
```

- [ ] **Step 5: Run the e2e to verify it passes**

Run: `npm run test:e2e -- menubar`
Expected: PASS (all five). If the "keyboard navigable" test flakes because focus lands on the `<section>` `id` change, note that `id` does not affect focus; re-check the `ArrowRight` cycle actually re-opens Edit (it depends on `MenuBar`'s `cycle`, already tested in Task 2).

- [ ] **Step 6: Full regression**

Run: `npm test && npm run test:e2e && npm run build && npm run prerender:assert`
Expected: all green. Watch `tests/a11y.spec.ts` (menus closed on load — must still pass) and `tests/terminal.spec.ts` / `tests/projects.spec.ts` (Desktop changed).

- [ ] **Step 7: Manual smoke**

`npm run dev`, skip boot. Click **File** → menu snaps open, hover inverts items, click **Read Me** (already open → raises it) then **Terminal** (opens). **Apple ▸ About This Portfolio** → the dithered memory bar. Keyboard: Tab to **File**, ↓ opens, ↓↓ moves, → jumps to **Edit**, Esc closes. **Edit ▸ Select All** with the Résumé window front → its text highlights. **Special ▸ Restart** → boot replays. **Special ▸ Shut Down** → screen collapses to a dot, "safe to turn off" screen, click → boots again.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire the menu bar to Desktop — About window, Select All, Restart, Shut Down"
```

---

## Self-Review

**1. Spec coverage** (the "Menu bar" bullet + motion + easter egg #2)

| Spec point | Task |
| --- | --- |
| Apple menu: About This Portfolio (+ desk accessories) | 2 (item) + 3 (`AboutDialog`) + 4 (mount). **Desk accessories = the Puzzle, which is 3-C** — the Apple menu gains that item there. |
| File: Open, Close, Save as PDF…, Print… | 2 (Résumé/Read Me/Projects/Terminal as the "Open" set; Close; Save as PDF…; Print…) |
| Edit: greyed Undo/Cut/Copy/Paste, working Select All | 2 (disabled items) + 4 (`selectAllInFront`) |
| View (icon size / list) | **Omitted — deferred.** Spec marks it "low priority"; nothing in the build has an icon-size or list mode to toggle yet. Noted here, not stubbed. |
| Special: Restart (replays boot), Shut Down (CRT-off then "safe to…" screen) | 2 (items) + 3 (`ShutDown`) + 4 (`restart` clears the session flag + reloads; `shutDown` shows the overlay) |
| Live clock at the right | 2 (kept) |
| Menu drop: snap open, invert on hover, flash on selection | 1 + `Menu.module.css` (snap, invert). The optional selection "flash" is not implemented — a full invert on hover already reads as period-correct; noted. |
| CRT power-off: collapse to a line then a dot; used once; reduced-motion → instant | 3 (`ShutDown` WAAPI `steps()`, `prefersReduced()` short-circuit) |

**Deferred (recorded, consistent with A):**
- **View menu** — no toggneable view state exists; revisit if icon list/size lands.
- **Selection "flash"** on menu-item activation — cosmetic; hover-invert suffices.
- **Nested "Open ▸" submenu** — the File menu lists the four windows flat instead of a submenu. Submenus are a large keyboard-interaction surface for little gain here.
- Menu opens are **instant** (no zoom-rect), unlike icon double-click. Consistent with the Plan 2 Terminal bridge.

**2. Placeholder scan**
- No `TODO` / `TBD`. Every step has full code (component, CSS, tests).
- `__BUILD_DATE__` is a real Vite `define`, not a placeholder token.
- `AboutDialog`'s "Portfolio" / "System 7, remastered — v2" / "Samuel Habib" are the actual copy, not stand-ins.

**3. Type consistency**
- `MenuItemSpec` defined once in `Menu.tsx`, consumed by `MenuBar.tsx`.
- `MenuBarActions` defined once in `MenuBar.tsx`, constructed once in `Desktop.tsx`, mocked in `MenuBar.test.tsx` with the identical shape.
- `openWindow(id: WindowId)` — `WindowId` already includes `about` (Plan 1 union); `DEFAULTS`/`TITLES` in `windows.ts` / `Desktop.tsx` already have an `about` entry, so no reducer change is needed.
- `ShutDown` props `{ onStartup(): void }` — same in the component, its test, and the `Desktop` call site (`onStartup={restart}`).

---

## Done criteria for Plan 3-B

- `npm test` and `npm run test:e2e` green, including `src/shell/Menu.test.tsx`, `src/shell/MenuBar.test.tsx`, `src/windows/AboutDialog.test.tsx`, `src/shell/ShutDown.test.tsx`, `tests/menubar.spec.ts`.
- `npm run build && npm run prerender:assert` green — `scripts/assert-prerendered.mjs` unchanged.
- `npx tsc --noEmit` clean.
- `tests/a11y.spec.ts` still green, plus axe clean with a menu open (new e2e).
- JS on, ≥768px: File / Edit / Special / Apple menus open on click and with the keyboard (↓ to open, ↑/↓ to move, ←/→ to cross menus, Esc to close, click-outside to close); disabled items (Close with no front window; Edit ▸ Undo/Cut/Copy/Paste) are struck-through and inert; `Save as PDF…` / `Print…` open the print dialog; `Select All` highlights the front window's text; `About This Portfolio` opens the memory-bar dialog; `Restart` replays the boot; `Shut Down` collapses the screen and shows "It is now safe to turn off your Macintosh.", and a click starts back up.
- No new npm dependencies.
