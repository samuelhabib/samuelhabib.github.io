import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import styles from './DesktopMenu.module.css'

export interface DesktopMenuItem {
  label: string
  onSelect(): void
}

/**
 * The Finder's Ctrl-click contextual menu, opened on the bare desktop. Pointer-
 * first, but arrow-navigable; closes on Escape, on an outside click, or once an
 * item is chosen.
 */
export default function DesktopMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number
  y: number
  items: DesktopMenuItem[]
  onClose(): void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x, y })

  // Keep the whole menu on screen.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({
      x: Math.min(x, window.innerWidth - r.width - 4),
      y: Math.min(y, window.innerHeight - r.height - 4),
    })
    el.querySelector<HTMLButtonElement>('button')?.focus()
  }, [x, y])

  useEffect(() => {
    const away = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    window.addEventListener('pointerdown', away)
    window.addEventListener('resize', onClose)
    window.addEventListener('blur', onClose)
    return () => {
      window.removeEventListener('pointerdown', away)
      window.removeEventListener('resize', onClose)
      window.removeEventListener('blur', onClose)
    }
  }, [onClose])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const btns = [...(ref.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    const i = btns.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      btns[(i + 1) % btns.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      btns[(i - 1 + btns.length) % btns.length]?.focus()
    }
  }

  return (
    <div
      ref={ref}
      className={styles.menu}
      style={{ left: pos.x, top: pos.y }}
      role="menu"
      aria-label="Desktop"
      onKeyDown={onKeyDown}
    >
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          role="menuitem"
          className={styles.item}
          onClick={() => {
            it.onSelect()
            onClose()
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}
