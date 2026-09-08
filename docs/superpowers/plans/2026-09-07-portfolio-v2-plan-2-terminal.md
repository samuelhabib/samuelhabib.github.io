# Portfolio v2 — Plan 2: Terminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working classic-Mac **Terminal** window on the desktop — a small, curated, keyboard-and-tap command shell that acts as a second, command-driven view of the résumé and about content already on the page, and can open the other windows.

**Architecture:** A custom React shell (not xterm.js). A pure **command registry** maps names/aliases to functions that return `ReactNode` (so output can carry clickable links, formatted blocks, `<pre>` dumps). A `runCommand(line, ctx)` dispatcher resolves a typed line to a command. A `useTerminal(bridge)` hook owns the output buffer, input string, command history, and tab-completion. A `TerminalWindow` component renders the log (`role="log"`, `aria-live="polite"`), the prompt + labelled `<input>`, a persistent tappable command-chip row, and the key handling (Enter / ↑↓ / Tab / Ctrl-L / Cmd-K / Esc). `Desktop` mounts it, passes a `bridge` of `{ open, close, beep }`, and — because `CONTENT` gains a `terminal` entry — the existing Terminal desktop icon finally opens a real window. Every command's output is derived from `resume` / `about`, which are already pre-rendered into `#main`; the Terminal introduces **no new page content**.

**Tech Stack:** React 18, TypeScript 5, Vitest + @testing-library/react (unit), Playwright + @axe-core/playwright (e2e). No new dependencies. No animation library. Reuses the Plan 1 `Window` chrome, `windowsReducer`, `useSound`, and the `resume` / `about` content modules.

**Spec:** `docs/superpowers/specs/2026-09-07-portfolio-v2-classic-mac-design.md` (the "Terminal" section under Structure / windows)

## Global Constraints

Every task's requirements implicitly include these. Values copied verbatim from the spec, or carried forward from Plan 1.

- **Strictly 1-bit.** Only `#000` and `#fff` as colour values, referenced through the existing tokens (`--black`, `--white`). No greys except via the Plan 1 dither utilities. Interaction feedback (focus, active, selected chip) is a full invert.
- **The Terminal stays in-palette** — black on white, styled like the MPW Shell, **not** a green-phosphor CRT. Monospace via `var(--font-mono)`. No scanlines, no glow. CRT flavour lives only in the boot sequence (Plan 1).
- **The Terminal ships zero new content.** Every command's output is a re-presentation of `resume` (`src/content/resume.ts`) or `about` (`src/content/about.ts`), both already rendered as real HTML inside `#main`. `scripts/assert-prerendered.mjs` needles stay **unchanged**; no new fallback markup is added. If a command would need prose that isn't reachable in the static document, that prose belongs in a content file, not in a command string.
- **Output is instant.** No typewriter effect. Only the boot sequence is time-sequenced.
- **`aria-live="polite"`** on the output log so screen readers announce results. The input has an accessible name ("Terminal input") — an unlabelled text input is a *critical* axe violation and `tests/a11y.spec.ts` fails the build on it.
- **Tab-completion excludes `hidden` commands.** The spec calls out leaking hidden commands through completion as sajeth.dev's specific mistake; do not repeat it.
- **No fake features.** Every listed command works. Commands for content that does not exist yet (`projects`, `hypercard`) are **not** added in this plan — they arrive in Plan 3 with `content/projects/*.md`.
- **`prefers-reduced-motion: reduce`** — the Terminal has no motion to suppress, but do not add any.
- **Desktop shell only.** The Terminal window is part of the `≥768px` hydrated desktop. Below 768px the shell is not rendered at all (`tests/mobile.spec.ts` enforces this). A tap-driven Terminal inside the no-JS `#main` document is **explicitly deferred** (see Self-Review); the in-window chip row covers "typing optional, never required" for the desktop shell.
- **Copy style:** plain, first person, dry, specific. No buzzword soup. Command help text is terse.

---

### Task 1: Command registry and the `runCommand` dispatcher

**Files:**
- Create: `src/terminal/types.ts`
- Create: `src/terminal/commands.tsx`
- Create: `src/terminal/run.tsx`
- Test: `src/terminal/run.test.tsx`

**Interfaces:**
- Consumes: `resume` from `src/content/resume.ts`; `about` from `src/content/about.ts`; `WindowId` from `src/shell/windows.ts`.
- Produces:
  ```ts
  // src/terminal/types.ts
  import type { ReactNode } from 'react'
  import type { WindowId } from '../shell/windows'

  export interface DesktopBridge {
    open(id: WindowId): void
    close(id: WindowId): void
    beep(): void
  }
  export interface CommandCtx extends DesktopBridge {
    run(line: string): void        // run another command string (used by clickable output)
    clear(): void                  // wipe the output buffer
    cwd: string                    // '/Users/samuel'
  }
  export interface Command {
    name: string
    aliases?: string[]
    hidden?: boolean
    description: string
    usage?: string
    run(args: string[], ctx: CommandCtx): ReactNode
  }
  ```
  ```ts
  // src/terminal/commands.tsx
  export const commands: Command[]
  export function resolve(name: string): Command | undefined   // matches name or alias, case-insensitive
  export function completions(prefix: string): string[]        // non-hidden command NAMES starting with prefix, sorted
  ```
  ```tsx
  // src/terminal/run.tsx
  export function runCommand(line: string, ctx: CommandCtx): ReactNode | null
  // trims; empty -> null; unknown -> a "command not found" node; otherwise the command's node (may be null)
  ```

- [x] **Step 1: Write the failing test**

```tsx
// src/terminal/run.test.tsx
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { runCommand } from './run'
import { completions } from './commands'
import type { CommandCtx } from './types'

function makeCtx(over: Partial<CommandCtx> = {}): CommandCtx {
  return {
    open: () => {}, close: () => {}, beep: () => {},
    run: () => {}, clear: () => {}, cwd: '/Users/samuel',
    ...over,
  }
}
const txt = (node: ReactNode | null) => {
  const { container } = render(<>{node}</>)
  return container.textContent ?? ''
}

test('whoami prints the one-line identity from resume data', () => {
  expect(txt(runCommand('whoami', makeCtx()))).toMatch(/Samuel Habib/)
})

test('help lists visible commands and hides hidden ones', () => {
  const out = txt(runCommand('help', makeCtx()))
  expect(out).toMatch(/experience/)
  expect(out).not.toMatch(/\becho\b/)
  expect(out).not.toMatch(/\bsudo\b/)
})

test('"?" is an alias of help', () => {
  expect(txt(runCommand('?', makeCtx()))).toMatch(/experience/)
})

test('unknown command returns a not-found node', () => {
  expect(txt(runCommand('frobnicate', makeCtx()))).toMatch(/command not found/i)
})

test('empty line returns null', () => {
  expect(runCommand('   ', makeCtx())).toBeNull()
})

test('open dispatches through the bridge', () => {
  const open = vi.fn()
  runCommand('open resume', makeCtx({ open }))
  expect(open).toHaveBeenCalledWith('resume')
})

test('open with an unknown target is an error, not a dispatch', () => {
  const open = vi.fn()
  const out = txt(runCommand('open projects', makeCtx({ open })))
  expect(open).not.toHaveBeenCalled()
  expect(out).toMatch(/no such window/i)
})

test('cat resume.md prints the raw résumé markdown body', () => {
  expect(txt(runCommand('cat resume.md', makeCtx()))).toMatch(/Referral Outbound Center/)
})

test('cat of an unknown file is an error', () => {
  expect(txt(runCommand('cat passwords.txt', makeCtx()))).toMatch(/No such file/i)
})

test('experience renders one line per job as a fake commit log', () => {
  const out = txt(runCommand('experience', makeCtx()))
  expect(out).toMatch(/ExaCare/)
  expect(out).toMatch(/Apple/)
})

test('hidden commands still run when typed explicitly', () => {
  expect(txt(runCommand('echo hi there', makeCtx()))).toBe('hi there')
})

test('sysbeep calls the bridge beep', () => {
  const beep = vi.fn()
  runCommand('sysbeep', makeCtx({ beep }))
  expect(beep).toHaveBeenCalledOnce()
})

test('completions are prefix matches that exclude hidden commands', () => {
  expect(completions('e')).toContain('experience')
  expect(completions('e')).not.toContain('echo')
  expect(completions('su')).toEqual([])
  expect(completions('')).toContain('help')
})
```

- [x] **Step 2: Run it to verify it fails**

Run: `npm test -- src/terminal/run`
Expected: FAIL — `Cannot find module './run'`.

- [x] **Step 3: Implement `types.ts`**

```ts
// src/terminal/types.ts
import type { ReactNode } from 'react'
import type { WindowId } from '../shell/windows'

export interface DesktopBridge {
  open(id: WindowId): void
  close(id: WindowId): void
  beep(): void
}

export interface CommandCtx extends DesktopBridge {
  run(line: string): void
  clear(): void
  cwd: string
}

export interface Command {
  name: string
  aliases?: string[]
  hidden?: boolean
  description: string
  usage?: string
  run(args: string[], ctx: CommandCtx): ReactNode
}
```

- [x] **Step 4: Implement `commands.tsx`**

```tsx
// src/terminal/commands.tsx
import type { ReactNode } from 'react'
import { resume } from '../content/resume'
import { about } from '../content/about'
import type { WindowId } from '../shell/windows'
import type { Command } from './types'

const OPENABLE: WindowId[] = ['resume', 'readme', 'terminal']

// Deterministic 7-hex pseudo-hash so `experience` reads like `git log --oneline`
// without pulling in a real hash.
function fakeSha(seed: string): string {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(7, '0').slice(0, 7)
}

function Doc({ children }: { children: string }): ReactNode {
  return <pre className="term-pre">{children}</pre>
}

export const commands: Command[] = [
  {
    name: 'help',
    aliases: ['?'],
    description: 'list the commands',
    run: () => {
      const visible = commands.filter((c) => !c.hidden)
      return (
        <div>
          {visible.map((c) => (
            <div key={c.name}>
              <strong>{c.name}</strong>
              {c.aliases?.length ? ` (${c.aliases.join(', ')})` : ''} — {c.description}
              {c.usage ? <div className="term-dim">    {c.usage}</div> : null}
            </div>
          ))}
          <div className="term-dim">↑/↓ history · Tab completes · Ctrl-L clears</div>
        </div>
      )
    },
  },
  {
    name: 'about',
    description: 'a few sentences about me',
    run: () => <Doc>{about.rawMarkdown}</Doc>,
  },
  {
    name: 'whoami',
    description: 'the one-line version',
    run: () => (
      <div>
        {resume.name} — {resume.title}, {resume.location}
      </div>
    ),
  },
  {
    name: 'resume',
    description: 'print resume.md',
    run: () => <Doc>{resume.rawMarkdown}</Doc>,
  },
  {
    name: 'cat',
    description: 'print a document',
    usage: 'cat <resume.md | about.md>',
    run: (args) => {
      const file = args[0]
      if (file === 'resume.md') return <Doc>{resume.rawMarkdown}</Doc>
      if (file === 'about.md') return <Doc>{about.rawMarkdown}</Doc>
      return <span className="term-err">cat: {file ?? ''}: No such file or directory</span>
    },
  },
  {
    name: 'experience',
    description: 'work history as a commit log',
    run: () => (
      <Doc>
        {resume.experience
          .map(
            (j) =>
              `${fakeSha(j.company + j.start)}  ${j.company} — ${j.role}  (${j.start} – ${j.end})`,
          )
          .join('\n')}
      </Doc>
    ),
  },
  {
    name: 'skills',
    description: 'skills as JSON',
    run: () => <Doc>{JSON.stringify(resume.skills, null, 2)}</Doc>,
  },
  {
    name: 'ls',
    description: 'list the documents',
    run: (_args, ctx) => (
      <div className="term-ls">
        <button className="term-file" onClick={() => ctx.run('cat resume.md')}>
          resume.md
        </button>
        <button className="term-file" onClick={() => ctx.run('cat about.md')}>
          about.md
        </button>
        <a href="/Resume.pdf">Resume.pdf</a>
      </div>
    ),
  },
  {
    name: 'contact',
    description: 'how to reach me',
    run: () => (
      <div>
        {resume.links.map((l) => (
          <div key={l.href}>
            <a href={l.href}>{l.label}</a>
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'open',
    description: 'open a window',
    usage: 'open <resume | readme | terminal>',
    run: (args, ctx) => {
      const target = args[0] as WindowId
      if (!OPENABLE.includes(target)) {
        return <span className="term-err">open: no such window: {args[0] ?? ''}</span>
      }
      ctx.open(target)
      return null
    },
  },
  {
    name: 'date',
    description: 'current date and time',
    run: () => <div>{new Date().toString()}</div>,
  },
  {
    name: 'clear',
    description: 'clear the screen',
    // Intercepted by useTerminal before dispatch; this run() is a safety net.
    run: (_args, ctx) => {
      ctx.clear()
      return null
    },
  },

  // ---- hidden ----
  {
    name: 'echo',
    hidden: true,
    description: 'echo the arguments',
    run: (args) => <span>{args.join(' ')}</span>,
  },
  {
    name: 'pwd',
    hidden: true,
    description: 'print working directory',
    run: (_args, ctx) => <span>{ctx.cwd}</span>,
  },
  {
    name: 'uname',
    hidden: true,
    description: 'system name',
    run: () => <span>Macintosh; System 7.0.1</span>,
  },
  {
    name: 'sudo',
    hidden: true,
    description: 'superuser do',
    run: () => (
      <span className="term-err">
        sudo: this is a résumé, not a root shell. Nice try though.
      </span>
    ),
  },
  {
    name: 'sysbeep',
    hidden: true,
    description: 'ring the system bell',
    run: (_args, ctx) => {
      ctx.beep()
      return null
    },
  },
]

const byName = new Map<string, Command>()
for (const c of commands) {
  byName.set(c.name.toLowerCase(), c)
  for (const a of c.aliases ?? []) byName.set(a.toLowerCase(), c)
}

export function resolve(name: string): Command | undefined {
  return byName.get(name.toLowerCase())
}

export function completions(prefix: string): string[] {
  const p = prefix.toLowerCase()
  return commands
    .filter((c) => !c.hidden && c.name.toLowerCase().startsWith(p))
    .map((c) => c.name)
    .sort()
}
```

- [x] **Step 5: Implement `run.tsx`**

```tsx
// src/terminal/run.tsx
import type { ReactNode } from 'react'
import { resolve } from './commands'
import type { CommandCtx } from './types'

export function runCommand(line: string, ctx: CommandCtx): ReactNode | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\s+/)
  const name = parts[0]
  const args = parts.slice(1)
  const cmd = resolve(name)
  if (!cmd) {
    return <span className="term-err">sh: {name}: command not found</span>
  }
  return cmd.run(args, ctx)
}
```

- [x] **Step 6: Run the test to verify it passes**

Run: `npm test -- src/terminal/run`
Expected: PASS (all cases).

- [x] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [x] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: terminal command registry and runCommand dispatcher"
```

---

### Task 2: `useTerminal` hook — buffer, input, history, completion

**Files:**
- Create: `src/terminal/useTerminal.ts`
- Test: `src/terminal/useTerminal.test.ts`

**Interfaces:**
- Consumes: `runCommand` from `src/terminal/run.tsx`; `completions` from `src/terminal/commands.tsx`; `DesktopBridge`, `CommandCtx` from `src/terminal/types.ts`.
- Produces:
  ```ts
  export interface TerminalEntry { id: number; node: ReactNode }
  export interface TerminalApi {
    entries: TerminalEntry[]
    input: string
    setInput(v: string): void
    submit(line?: string): void       // runs `line` or the current input; echoes a prompt line; records history
    clear(): void                     // empties entries
    recall(dir: -1 | 1): void         // -1 = older, +1 = newer; walks command history into `input`
    ghost: string                     // single-candidate completion preview for the current input, else ''
    complete(): void                  // Tab: fill single candidate, or print the candidate list
  }
  export function useTerminal(bridge: DesktopBridge): TerminalApi
  ```
- Notes:
  - `bridge` is read through a **ref** inside the hook so the `ctx` closures always call the latest `open`/`close`/`beep`, even though `ctx` itself is created once. This is the same stale-closure guard applied to `useDrag` in Plan 1 (`src/shell/useDrag.ts`).
  - `clear` is intercepted in `submit` (before `runCommand`) and wipes the buffer entirely — including the just-typed line — the way a real `clear` does. It is still recorded in history.
  - `ghost` is empty when the input contains a space (you are past the command word) or when the only candidate already equals the input.

- [x] **Step 1: Write the failing test**

```ts
// src/terminal/useTerminal.test.ts
import { renderHook, act } from '@testing-library/react'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTerminal } from './useTerminal'

const bridge = { open: () => {}, close: () => {}, beep: () => {} }
const lastText = (nodes: { node: ReactNode }[]) => {
  const { container } = render(<>{nodes[nodes.length - 1].node}</>)
  return container.textContent ?? ''
}

test('submit echoes a prompt line and appends the command output', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.submit('whoami'))
  // one echo entry + one output entry
  expect(result.current.entries.length).toBe(2)
  expect(lastText(result.current.entries)).toMatch(/Samuel Habib/)
  expect(result.current.input).toBe('')
})

test('clear wipes the buffer', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.submit('whoami'))
  act(() => result.current.submit('clear'))
  expect(result.current.entries).toEqual([])
})

test('recall walks command history into the input', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.submit('help'))
  act(() => result.current.submit('date'))
  act(() => result.current.recall(-1))
  expect(result.current.input).toBe('date')
  act(() => result.current.recall(-1))
  expect(result.current.input).toBe('help')
  act(() => result.current.recall(1))
  expect(result.current.input).toBe('date')
})

test('ghost previews a single completion candidate', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.setInput('expe'))
  expect(result.current.ghost).toBe('experience')
  act(() => result.current.setInput('e'))
  expect(result.current.ghost).toBe('') // more than one candidate
})

test('complete fills a single candidate', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.setInput('expe'))
  act(() => result.current.complete())
  expect(result.current.input).toBe('experience ')
})

test('bridge calls go through the live ref, not a stale closure', () => {
  const open = vi.fn()
  const { result, rerender } = renderHook(({ b }) => useTerminal(b), {
    initialProps: { b: { open: () => {}, close: () => {}, beep: () => {} } },
  })
  rerender({ b: { open, close: () => {}, beep: () => {} } })
  act(() => result.current.submit('open resume'))
  expect(open).toHaveBeenCalledWith('resume')
})
```

- [x] **Step 2: Run it to verify it fails**

Run: `npm test -- src/terminal/useTerminal`
Expected: FAIL — `Cannot find module './useTerminal'`.

- [x] **Step 3: Implement `useTerminal.ts`**

```ts
// src/terminal/useTerminal.ts
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { runCommand } from './run'
import { completions } from './commands'
import type { CommandCtx, DesktopBridge } from './types'

export interface TerminalEntry {
  id: number
  node: ReactNode
}

export interface TerminalApi {
  entries: TerminalEntry[]
  input: string
  setInput(v: string): void
  submit(line?: string): void
  clear(): void
  recall(dir: -1 | 1): void
  ghost: string
  complete(): void
}

const PROMPT = 'samuel@portfolio ~ %'

export function useTerminal(bridge: DesktopBridge): TerminalApi {
  const [entries, setEntries] = useState<TerminalEntry[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const histCursor = useRef<number | null>(null)
  const nextId = useRef(0)

  const bridgeRef = useRef(bridge)
  bridgeRef.current = bridge

  const push = useCallback((node: ReactNode) => {
    setEntries((prev) => [...prev, { id: nextId.current++, node }])
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  // A submit ref lets ctx.run() re-enter submit without a dependency cycle.
  const submitRef = useRef<(line?: string) => void>(() => {})

  const ctx = useMemo<CommandCtx>(
    () => ({
      open: (id) => bridgeRef.current.open(id),
      close: (id) => bridgeRef.current.close(id),
      beep: () => bridgeRef.current.beep(),
      run: (line) => submitRef.current(line),
      clear: () => setEntries([]),
      cwd: '/Users/samuel',
    }),
    [],
  )

  const submit = useCallback(
    (line?: string) => {
      const raw = line ?? input
      const cmd = raw.trim()
      setInput('')
      histCursor.current = null
      push(
        <div>
          <span className="term-prompt">{PROMPT}</span> {raw}
        </div>,
      )
      if (!cmd) return
      setHistory((h) => [...h, cmd])
      if (cmd === 'clear') {
        setEntries([])
        return
      }
      const node = runCommand(cmd, ctx)
      if (node != null) push(node)
    },
    [input, ctx, push],
  )
  submitRef.current = submit

  const recall = useCallback(
    (dir: -1 | 1) => {
      setHistory((h) => {
        if (h.length === 0) return h
        const cur = histCursor.current ?? h.length
        let next = cur + dir
        next = Math.max(0, Math.min(h.length, next))
        histCursor.current = next
        setInput(next >= h.length ? '' : h[next])
        return h
      })
    },
    [],
  )

  const ghost = useMemo(() => {
    if (!input || input.includes(' ')) return ''
    const c = completions(input)
    return c.length === 1 && c[0] !== input ? c[0] : ''
  }, [input])

  const complete = useCallback(() => {
    if (input.includes(' ')) return
    const c = completions(input)
    if (c.length === 1) setInput(c[0] + ' ')
    else if (c.length > 1) push(<div className="term-dim">{c.join('  ')}</div>)
  }, [input, push])

  return { entries, input, setInput, submit, clear, recall, ghost, complete }
}
```

- [x] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/terminal/useTerminal`
Expected: PASS (all cases).

- [x] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [x] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: useTerminal hook (buffer, history, tab-completion)"
```

---

### Task 3: `TerminalWindow` component, plus two shell fixes it needs

**Files:**
- Create: `src/windows/TerminalWindow.tsx`
- Create: `src/windows/TerminalWindow.module.css`
- Modify: `src/shell/Window.tsx` (don't steal focus from a child that already took it)
- Modify: `src/shell/useWindowKeys.ts` (Escape inside the Terminal must not close the window)
- Test: `src/windows/TerminalWindow.test.tsx`
- Test: `src/shell/useWindowKeys.test.ts` (new)
- Test: `src/shell/Window.test.tsx` (extend)

**Interfaces:**
- Consumes: `useTerminal`, `TerminalApi` from `src/terminal/useTerminal.ts`; `DesktopBridge` from `src/terminal/types.ts`.
- Produces:
  - `src/windows/TerminalWindow.tsx` default-exports `TerminalWindow`, props `{ bridge: DesktopBridge }`. Renders:
    - a root `<div className={styles.term} data-terminal onClick={focusInput}>`
    - an output log `<div className={styles.output} role="log" aria-live="polite">` mapping `entries` to `<div key={e.id}>{e.node}</div>`
    - an input row: `<span className={styles.prompt}>samuel@portfolio ~ %</span>`, a relatively-positioned wrapper holding the ghost `<span className={styles.ghost}>` behind `<input className={styles.input} aria-label="Terminal input" spellCheck={false} autoComplete="off">`
    - a chip row `<div className={styles.chips} aria-label="Quick commands">` of `<button>`s: `help`, `whoami`, `experience`, `skills`, `contact`, `ls`, `open resume` — each `onClick={() => term.submit(<label>)}`
    - key handling on the input (see Step 4)
    - focuses the input once on mount
  - `src/shell/Window.tsx`: the mount focus effect becomes
    ```tsx
    useEffect(() => {
      if (p.autoFocus && !ref.current?.contains(document.activeElement)) ref.current?.focus()
    }, [])
    ```
    so a window whose content focused itself (the Terminal input) keeps that focus.
  - `src/shell/useWindowKeys.ts`: the Escape handler ignores events whose target is inside `[data-terminal]`.

- [x] **Step 1: Write the failing tests**

```tsx
// src/windows/TerminalWindow.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TerminalWindow from './TerminalWindow'

const bridge = { open: vi.fn(), close: vi.fn(), beep: vi.fn() }

test('has a labelled input and a polite log region', () => {
  render(<TerminalWindow bridge={bridge} />)
  expect(screen.getByRole('textbox', { name: /terminal input/i })).toBeInTheDocument()
  expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite')
})

test('focuses the input on mount', () => {
  render(<TerminalWindow bridge={bridge} />)
  expect(screen.getByRole('textbox', { name: /terminal input/i })).toHaveFocus()
})

test('typing a command and pressing Enter shows its output', async () => {
  render(<TerminalWindow bridge={bridge} />)
  const input = screen.getByRole('textbox', { name: /terminal input/i })
  await userEvent.type(input, 'help{Enter}')
  expect(screen.getByRole('log')).toHaveTextContent(/experience/)
})

test('a quick-command chip runs that command', async () => {
  render(<TerminalWindow bridge={bridge} />)
  await userEvent.click(screen.getByRole('button', { name: 'whoami' }))
  expect(screen.getByRole('log')).toHaveTextContent(/Samuel Habib/)
})

test('Tab completes a single candidate', async () => {
  render(<TerminalWindow bridge={bridge} />)
  const input = screen.getByRole('textbox', { name: /terminal input/i }) as HTMLInputElement
  await userEvent.type(input, 'expe')
  await userEvent.keyboard('{Tab}')
  expect(input.value).toBe('experience ')
})

test('ArrowUp recalls the previous command', async () => {
  render(<TerminalWindow bridge={bridge} />)
  const input = screen.getByRole('textbox', { name: /terminal input/i }) as HTMLInputElement
  await userEvent.type(input, 'date{Enter}')
  await userEvent.keyboard('{ArrowUp}')
  expect(input.value).toBe('date')
})

test('Escape clears the input line and does not bubble', async () => {
  const onParentKeyDown = vi.fn()
  render(
    <div onKeyDown={onParentKeyDown}>
      <TerminalWindow bridge={bridge} />
    </div>,
  )
  const input = screen.getByRole('textbox', { name: /terminal input/i }) as HTMLInputElement
  await userEvent.type(input, 'hal')
  await userEvent.keyboard('{Escape}')
  expect(input.value).toBe('')
  expect(onParentKeyDown).not.toHaveBeenCalled()
})
```

```ts
// src/shell/useWindowKeys.test.ts
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { useWindowKeys } from './useWindowKeys'

test('Escape closes the front window', () => {
  const onClose = vi.fn()
  render(<button data-testid="x" />)
  renderHook(() => useWindowKeys('resume', onClose))
  fireEvent.keyDown(screen.getByTestId('x'), { key: 'Escape' })
  expect(onClose).toHaveBeenCalledWith('resume')
})

test('Escape originating inside a terminal is ignored', () => {
  const onClose = vi.fn()
  render(
    <div data-terminal>
      <input data-testid="ti" />
    </div>,
  )
  renderHook(() => useWindowKeys('terminal', onClose))
  fireEvent.keyDown(screen.getByTestId('ti'), { key: 'Escape' })
  expect(onClose).not.toHaveBeenCalled()
})
```

Add to `src/shell/Window.test.tsx`:

```tsx
test('does not steal focus from content that focused itself', () => {
  function SelfFocuser() {
    return <input aria-label="inner" autoFocus />
  }
  render(
    <Window
      state={{ ...base }}
      title="Terminal"
      autoFocus
      onFocus={() => {}}
      onClose={() => {}}
      onMove={() => {}}
      onResize={() => {}}
      onToggleShade={() => {}}
    >
      <SelfFocuser />
    </Window>,
  )
  expect(screen.getByLabelText('inner')).toHaveFocus()
})
```

- [x] **Step 2: Run to verify they fail**

Run: `npm test -- TerminalWindow useWindowKeys Window`
Expected: FAIL — `TerminalWindow` module missing; the new `useWindowKeys` and `Window` cases fail.

- [x] **Step 3: Apply the two shell fixes**

`src/shell/Window.tsx` — replace the mount focus effect:

```tsx
  useEffect(() => {
    // Focus the window on a user-initiated open, but never yank focus away from
    // content that already claimed it (e.g. the Terminal's input).
    if (p.autoFocus && !ref.current?.contains(document.activeElement)) ref.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
```

`src/shell/useWindowKeys.ts` — ignore Escape from inside a terminal:

```ts
import { useEffect } from 'react'
import type { WindowId } from './windows'

/** Global keys for window management. Escape closes the front window, except
 *  when it originates inside the Terminal, which owns Escape for its input. */
export function useWindowKeys(front: WindowId | null, onClose: (id: WindowId) => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !front) return
      const target = e.target as HTMLElement | null
      if (target?.closest?.('[data-terminal]')) return
      onClose(front)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [front, onClose])
}
```

- [x] **Step 4: Implement `TerminalWindow.tsx`**

```tsx
// src/windows/TerminalWindow.tsx
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useTerminal } from '../terminal/useTerminal'
import type { DesktopBridge } from '../terminal/types'
import styles from './TerminalWindow.module.css'

const PROMPT = 'samuel@portfolio ~ %'
const CHIPS = ['help', 'whoami', 'experience', 'skills', 'contact', 'ls', 'open resume']

export default function TerminalWindow({ bridge }: { bridge: DesktopBridge }) {
  const term = useTerminal(bridge)
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [term.entries])

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        term.submit()
        break
      case 'ArrowUp':
        e.preventDefault()
        term.recall(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        term.recall(1)
        break
      case 'Tab':
        e.preventDefault()
        term.complete()
        break
      case 'Escape':
        e.stopPropagation()
        term.setInput('')
        break
      default:
        if ((e.ctrlKey && e.key === 'l') || (e.metaKey && e.key === 'k')) {
          e.preventDefault()
          term.clear()
        }
    }
  }

  return (
    <div
      className={styles.term}
      data-terminal
      onClick={() => inputRef.current?.focus()}
    >
      <div className={styles.output} role="log" aria-live="polite">
        {term.entries.map((e) => (
          <div key={e.id}>{e.node}</div>
        ))}
        <div ref={endRef} />
      </div>

      <div className={styles.row}>
        <span className={styles.prompt}>{PROMPT}</span>
        <span className={styles.field}>
          {term.ghost && (
            <span className={styles.ghost} aria-hidden>
              {term.ghost}
            </span>
          )}
          <input
            ref={inputRef}
            className={styles.input}
            aria-label="Terminal input"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            value={term.input}
            onChange={(e) => term.setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </span>
      </div>

      <div className={styles.chips} aria-label="Quick commands">
        {CHIPS.map((c) => (
          <button key={c} className={styles.chip} onClick={() => term.submit(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [x] **Step 5: Implement `TerminalWindow.module.css`**

```css
/* src/windows/TerminalWindow.module.css */
.term {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--white);
  color: var(--black);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
}
.output {
  flex: 1;
  overflow: auto;
  padding: var(--space-2);
  white-space: pre-wrap;
  word-break: break-word;
}
.output :global(.term-pre) {
  margin: 0;
  font: inherit;
  white-space: pre-wrap;
}
.output :global(.term-err) {
  background: var(--black);
  color: var(--white);
  padding: 0 2px;
}
.output :global(.term-dim) {
  opacity: 0.75;
}
.output :global(.term-prompt) {
  font-weight: bold;
}
.output :global(.term-ls) {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.output :global(.term-file) {
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
.output :global(a) {
  text-decoration: underline;
}
.row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: var(--space-2);
  border-top: 1px solid var(--black);
}
.prompt {
  font-weight: bold;
  white-space: nowrap;
}
.field {
  position: relative;
  flex: 1;
}
.ghost {
  position: absolute;
  left: 0;
  top: 0;
  color: var(--black);
  opacity: 0.4;
  pointer-events: none;
}
.input {
  width: 100%;
  font: inherit;
  color: inherit;
  background: transparent;
  border: 0;
  outline: none;
  padding: 0;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: var(--space-1) var(--space-2) var(--space-2);
  border-top: 1px solid var(--black);
}
.chip {
  font-family: var(--font-mono);
  font-size: 11px;
  border: 1px solid var(--black);
  padding: 1px 6px;
}
.chip:active,
.chip:focus-visible {
  background: var(--black);
  color: var(--white);
}
```

- [x] **Step 6: Run the tests to verify they pass**

Run: `npm test -- TerminalWindow useWindowKeys Window`
Expected: PASS. If the `focuses the input on mount` test is flaky under jsdom, ensure the test file does not render two `TerminalWindow`s in one file-level DOM (each `render` gets its own container; use `screen` within each `test`).

- [x] **Step 7: Full unit run + typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all green.

- [x] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: TerminalWindow component; stop focus theft and Esc-close inside the terminal"
```

---

### Task 4: Mount the Terminal on the desktop and wire the bridge

**Files:**
- Modify: `src/shell/Desktop.tsx`
- Test: `tests/terminal.spec.ts` (new)

**Interfaces:**
- Consumes: `TerminalWindow` from `src/windows/TerminalWindow.tsx`; `useSound` from `src/shell/useSound.tsx`; `DesktopBridge` from `src/terminal/types.ts`; the existing `windowsReducer` / `frontWindow` / `Window`.
- Produces: `Desktop` renders a real `terminal` window. `CONTENT` moves inside the component (it now needs the `bridge` closure). The existing Terminal desktop icon opens it via the normal zoom-rect path. `bridge.open` dispatches `{ type: 'open' }` (the reducer already raises `z`, so this both opens and focuses — no separate zoom-rect for terminal-initiated opens, which is fine).

- [x] **Step 1: Write the failing e2e test**

```ts
// tests/terminal.spec.ts
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

async function openTerminal(page: Page) {
  await boot(page)
  await page.getByRole('button', { name: 'Terminal' }).dblclick()
  await expect(page.getByRole('dialog', { name: /terminal/i })).toBeVisible()
}

test('the Terminal icon opens a real Terminal window', async ({ page }) => {
  await openTerminal(page)
  await expect(
    page.getByRole('dialog', { name: /terminal/i }).getByRole('textbox', { name: /terminal input/i }),
  ).toBeVisible()
})

test('help lists commands; open resume brings the résumé forward', async ({ page }) => {
  await openTerminal(page)
  const input = page.getByRole('textbox', { name: /terminal input/i })
  await input.fill('help')
  await input.press('Enter')
  await expect(page.getByRole('log')).toContainText('experience')

  await input.fill('open resume')
  await input.press('Enter')
  const resume = page.getByRole('dialog', { name: /résumé/i })
  await expect(resume).toBeVisible()
  await expect(resume.locator(':scope:focus-within, :scope:focus')).toHaveCount(1)
})

test('Escape while typing in the Terminal does not close it', async ({ page }) => {
  await openTerminal(page)
  const input = page.getByRole('textbox', { name: /terminal input/i })
  await input.fill('hal')
  await input.press('Escape')
  await expect(input).toHaveValue('')
  await expect(page.getByRole('dialog', { name: /terminal/i })).toBeVisible()
})

test('no serious axe violations with the Terminal open', async ({ page }) => {
  await openTerminal(page)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(serious).toEqual([])
})

test('mobile still renders no desktop shell (Terminal included)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('dialog', { name: /terminal/i })).toHaveCount(0)
  await expect(page.locator('#main')).toBeVisible()
})
```

- [x] **Step 2: Run to verify it fails**

Run: `npm run test:e2e -- terminal`
Expected: FAIL — no `dialog` named "Terminal" appears (icon opens nothing today).

- [x] **Step 3: Wire `Desktop.tsx`**

Add imports:

```tsx
import { useReducer, useState, useCallback, useMemo, type ReactNode } from 'react'
import TerminalWindow from '../windows/TerminalWindow'
import { useSound } from './useSound'
import type { DesktopBridge } from '../terminal/types'
```

Remove the module-level `CONTENT` constant. Inside `Desktop()`, after `close` is defined:

```tsx
  const sound = useSound()

  const bridge = useMemo<DesktopBridge>(
    () => ({
      // dispatch is stable (useReducer); the reducer's 'open' also raises z, so
      // this opens-or-focuses in one action.
      open: (id) => dispatch({ type: 'open', id }),
      close: (id) => close(id),
      beep: () => sound.beep(),
    }),
    [close, sound],
  )

  const content: Partial<Record<WindowId, ReactNode>> = {
    resume: <ResumeWindow />,
    readme: <ReadMeWindow />,
    terminal: <TerminalWindow bridge={bridge} />,
  }
```

Change the `openWindows` line to read from `content`:

```tsx
  const openWindows = (Object.keys(content) as WindowId[]).filter((id) => state.windows[id].open)
```

And the render map body stays the same except it reads `content[id]`:

```tsx
        >
          {content[id]}
        </Window>
```

(No other change. `TITLES.terminal` is already `'Terminal'`. The Terminal icon already exists in `DesktopIcons`. `terminal` default geometry is already in `windows.ts` DEFAULTS.)

- [x] **Step 4: Run the e2e to verify it passes**

Run: `npm run test:e2e -- terminal`
Expected: PASS (all five). If the `:focus-within` assertion is flaky, replace it with a z-order check: `expect(await resume.evaluate((el) => Number(getComputedStyle(el).zIndex))).toBeGreaterThan(await page.getByRole('dialog', { name: /terminal/i }).evaluate((el) => Number(getComputedStyle(el).zIndex)))`.

- [x] **Step 5: Full regression — unit + e2e + build + prerender assert**

Run: `npm test && npm run test:e2e && npm run build && npm run prerender:assert`
Expected: all green. Pay attention to `tests/a11y.spec.ts`, `tests/mobile.spec.ts`, and `tests/window.spec.ts` — they are the specs most likely to regress from a shell change and are outside the obvious blast radius. `scripts/assert-prerendered.mjs` needles must be unchanged and still pass.

- [x] **Step 6: Manual smoke**

Run: `npm run dev`, open `http://localhost:5173`, skip boot, double-click **Terminal**. Check: input is focused; `help` then Enter prints the list; `↑` recalls `help`; typing `sk` shows a `skills` ghost and Tab fills it; `open resume` raises the résumé window; the chip row runs commands on tap; `Esc` clears the line and leaves the window open; `Ctrl-L` clears the screen.

- [x] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: mount the Terminal window on the desktop with an open/close/beep bridge"
```

---

## Self-Review

**1. Spec coverage** (the spec's "Terminal" section)

| Spec point | Task |
| --- | --- |
| Custom React shell, not xterm.js | 1–3 |
| Command registry `{ name, aliases?, hidden?, description, usage?, run(args, ctx): ReactNode }` | 1 (`Command` in `types.ts`) |
| Commands return React nodes (clickable links, tables, lists) | 1 (`ls` buttons, `contact` links, `<pre>` dumps) |
| `ctx` = `{ run, open, close, clear, print, cwd }` (minus `theme`) | 1–2. `print` is covered by `ctx.run` + the hook's internal `push`; `theme` deliberately dropped (theme switching is out of scope in the spec). Documented deviation. |
| `ctx.open('resume')` focuses/opens the GUI window — the integration point | 2 (`ctx.open`), 4 (`bridge` → `dispatch open`) |
| Commands: `help`/`?`, `about`, `whoami`, `resume`/`cat resume.md`, `experience` (as `git log --oneline`), `skills` (JSON), `open <app>`, `contact`, `date`, `clear`, `ls`; hidden `echo`, `pwd`→`/Users/samuel`, `uname`, `sudo` (joke deny), `sysbeep` | 1 |
| `experience` styled as fake commits | 1 (`fakeSha` + `company — role (start – end)`) |
| Input: history (↑/↓), tab-completion with single-candidate ghost text, `hidden` excluded, Ctrl-L / Cmd-K clear, click-anywhere-refocuses | 2 (`recall`, `ghost`, `complete`), 3 (key handling, root `onClick`) |
| Output: instant, no typewriter | 2–3 (synchronous `push`) |
| `aria-live="polite"` on the output log | 3 (`role="log" aria-live="polite"`) |
| Mobile: every command also a tappable button; persistent chip row; typing optional | 3 (chip row) — **for the desktop shell only**; see gap below |

**Gaps identified and accepted (mirrors how Plan 1 deferred outline-drag / interactive menus):**

- **No-JS / mobile tap-driven Terminal.** The spec wants a tap-driven Terminal on mobile with the command list always visible. Below 768px the shell is not rendered (`tests/mobile.spec.ts`), and putting a Terminal into the `#main` document would introduce page content that isn't derivable from `resume` / `about` and would need new `assert-prerendered.mjs` needles. **Deferred.** The in-window chip row satisfies "typing optional, never required" for the desktop shell now; a mobile Terminal surface is a Plan 3 concern alongside the mobile menu.
- **`projects` / `hypercard` commands.** Depend on `content/projects/*.md`, which does not exist until Plan 3. Adding a stub now would be a "fake feature that doesn't work" — the spec bans those. **Deferred to Plan 3**, added with the content.
- **Interactive menu-bar "Terminal" item** (File ▸ or Apple ▸). The menu bar is still display-only (Plan 1 deferred interactive menus to Plan 3). The desktop icon is the open path for now. **Unchanged — still Plan 3.**
- **`ctx.print`** as a distinct API. Folded into `ctx.run` + the hook's internal buffer push; no command in this plan needs to emit a node without running a command. If Plan 3 needs it, add it then.

**2. Placeholder scan**

- No "TODO" / "TBD" / "implement later". Every code step has complete content.
- `PROMPT` string (`samuel@portfolio ~ %`) is a real value, not a placeholder.
- `fakeSha` is a real (deliberately non-cryptographic) implementation, not a stub.
- The one "safety net" comment on `clear`'s `run()` describes real fallback behaviour (it calls `ctx.clear()`); the primary path is the `submit` interception.

**3. Type consistency**

- `DesktopBridge` (`{ open, close, beep }`) is defined once in `src/terminal/types.ts` and consumed unchanged by `useTerminal` (Task 2), `TerminalWindow` (Task 3), and `Desktop` (Task 4).
- `CommandCtx extends DesktopBridge` with `{ run, clear, cwd }` — the exact shape `commands.tsx` `run(args, ctx)` reads (`ctx.open`, `ctx.run`, `ctx.clear`, `ctx.beep`, `ctx.cwd`).
- `Command.run` returns `ReactNode` (non-null); `runCommand` returns `ReactNode | null` (null for empty input and for `open` / `sysbeep` success). `useTerminal.submit` guards with `if (node != null) push(node)`. Consistent.
- `TerminalEntry { id: number; node: ReactNode }` defined in Task 2, consumed by `TerminalWindow`'s `entries.map` in Task 3.
- `completions(prefix): string[]` — same signature in Task 1 definition, Task 1 tests, and Task 2 (`ghost`, `complete`).
- `WindowId` union is untouched; `terminal` was already a member since Plan 1.

---

## Done criteria for Plan 2

- `npm test` and `npm run test:e2e` green, including the new `tests/terminal.spec.ts`.
- `npm run build && npm run prerender:assert` green — `scripts/assert-prerendered.mjs` **unchanged**, `dist/index.html` still carries the full résumé + Read Me prose (the Terminal added no page content).
- `npx tsc --noEmit` clean.
- JS on, ≥768px: the Terminal desktop icon opens a real window; the input is focused on open; `help`, `about`, `whoami`, `resume`, `cat resume.md`, `cat about.md`, `experience`, `skills`, `ls`, `contact`, `date`, `clear` all work; hidden `echo` / `pwd` / `uname` / `sudo` / `sysbeep` work when typed; `↑/↓` history, Tab completion (hidden excluded, ghost text), Ctrl-L / Cmd-K clear all work; `open resume` / `open readme` / `open terminal` raise those windows; the chip row runs commands on tap; `Esc` clears the input line without closing the window.
- No new npm dependencies.
- `<768px`: unchanged — stacked document, no shell, no Terminal.
