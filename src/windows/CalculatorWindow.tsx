import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { INITIAL, press, fromKeyboard } from './calculator'
import styles from './CalculatorWindow.module.css'

// row-major; '0' spans two columns, so it carries a span marker
const KEYS: { k: string; wide?: boolean; op?: boolean }[] = [
  { k: 'C' }, { k: '±' }, { k: '%' }, { k: '÷', op: true },
  { k: '7' }, { k: '8' }, { k: '9' }, { k: '×', op: true },
  { k: '4' }, { k: '5' }, { k: '6' }, { k: '−', op: true },
  { k: '1' }, { k: '2' }, { k: '3' }, { k: '+', op: true },
  { k: '0', wide: true }, { k: '.' }, { k: '=', op: true },
]

// the minus glyph on the key is '−' (U+2212) for evenness; the engine wants '-'
const toEngine = (k: string) => (k === '−' ? '-' : k)

export default function CalculatorWindow() {
  const [state, setState] = useState(INITIAL)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const mapped = fromKeyboard(e.key)
    if (mapped == null) return
    e.preventDefault()
    setState((s) => press(s, mapped))
  }

  return (
    <div
      ref={ref}
      className={styles.calc}
      role="group"
      aria-label="Calculator"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <output className={styles.readout} aria-live="polite">
        {state.display}
      </output>
      <div className={styles.keys}>
        {KEYS.map(({ k, wide, op }) => (
          <button
            key={k}
            type="button"
            className={`${styles.key} ${wide ? styles.wide : ''} ${op ? styles.op : ''}`}
            onClick={() => setState((s) => press(s, toEngine(k)))}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}
