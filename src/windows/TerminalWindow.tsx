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
    // guarded: jsdom has no scrollIntoView
    endRef.current?.scrollIntoView?.({ block: 'end' })
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
    <div className={styles.term} data-terminal onClick={() => inputRef.current?.focus()}>
      <div className={styles.output} role="log" aria-live="polite">
        <pre className={styles.banner}>
          {"samuel@portfolio — my résumé, as a shell.\ntype a command, or tap one below. 'help' lists them all."}
        </pre>
        {term.entries.map((e) => (
          <div key={e.id}>{e.node}</div>
        ))}
        <div ref={endRef} />
      </div>

      <div className={styles.row}>
        <span className={styles.prompt}>{PROMPT}</span>
        <span className={styles.field}>
          {term.ghost && (
            <span className={styles.ghost} aria-hidden style={{ left: `${term.input.length}ch` }}>
              {term.ghost.slice(term.input.length)}
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

      <div className={styles.chips} role="group" aria-label="Quick commands">
        {CHIPS.map((c) => (
          <button key={c} className={styles.chip} onClick={() => term.submit(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
