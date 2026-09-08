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
  const history = useRef<string[]>([])
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
      history.current = [...history.current, cmd]
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

  const recall = useCallback((dir: -1 | 1) => {
    const h = history.current
    if (h.length === 0) return
    const cur = histCursor.current ?? h.length
    const next = Math.max(0, Math.min(h.length, cur + dir))
    histCursor.current = next
    setInput(next >= h.length ? '' : h[next])
  }, [])

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
