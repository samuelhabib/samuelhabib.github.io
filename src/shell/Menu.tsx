import { Fragment, useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import styles from './Menu.module.css'

export interface MenuItemSpec {
  label: string
  onSelect?: () => void
  disabled?: boolean
  separatorBefore?: boolean
  /** when defined, the item is a menuitemcheckbox reflecting this value */
  checked?: boolean
  /** display-only command equivalent, e.g. "⌘I" — shown flush-right */
  shortcut?: string
}

interface MenuProps {
  label: ReactNode
  title: string
  items: MenuItemSpec[]
  open: boolean
  onOpen(): void
  onClose(): void
  onCycle(dir: -1 | 1): void
  /** open the dropdown flush to the trigger's right edge (for far-right menus) */
  alignRight?: boolean
}

export default function Menu({
  label,
  title,
  items,
  open,
  onOpen,
  onClose,
  onCycle,
  alignRight,
}: MenuProps) {
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
    menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[real]?.focus()
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
          className={`${styles.drop} ${alignRight ? styles.dropRight : ''}`}
          onKeyDown={onMenuKey}
        >
          {items.map((it, i) => (
            <Fragment key={i}>
              {it.separatorBefore && <div role="separator" className={styles.sep} />}
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
                  <span aria-hidden>{it.checked ? '✓ ' : '  '}</span>
                )}
                {it.label}
                {it.shortcut && (
                  <span className={styles.shortcut} aria-hidden>
                    {it.shortcut}
                  </span>
                )}
              </button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
