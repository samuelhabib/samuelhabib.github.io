import { useEffect, useRef, type ReactNode } from 'react'
import type { WindowState } from './windows'
import { useDrag } from './useDrag'
import styles from './Window.module.css'

interface WindowProps {
  state: WindowState
  title: string
  autoFocus?: boolean
  onFocus(): void
  onClose(): void
  onMove(x: number, y: number): void
  onResize(w: number, h: number): void
  onToggleShade(): void
  children: ReactNode
}

export default function Window(p: WindowProps) {
  const { state } = p
  const drag = useDrag((dx, dy) => p.onMove(state.x + dx, state.y + dy))
  const grow = useDrag((dx, dy) => p.onResize(state.w + dx, state.h + dy))
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    // Focus the window on a user-initiated open, but never yank focus away from
    // content that already claimed it (e.g. the Terminal's input).
    if (p.autoFocus && !ref.current?.contains(document.activeElement)) ref.current?.focus()
    // only when this window is first shown as a user-initiated open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      ref={ref}
      role="dialog"
      aria-label={p.title}
      tabIndex={-1}
      className={styles.window}
      style={{
        left: state.x,
        top: state.y,
        width: state.w,
        height: state.shaded ? undefined : state.h,
        zIndex: state.z,
      }}
      onPointerDown={p.onFocus}
    >
      <div
        className={styles.titlebar}
        data-testid="titlebar"
        onPointerDown={drag.onPointerDown}
        onDoubleClick={p.onToggleShade}
      >
        <button className={styles.close} aria-label={`Close ${p.title}`} onClick={p.onClose} />
        <span className={styles.title}>{p.title}</span>
      </div>
      {/* tabIndex lets keyboard users scroll the window body */}
      <div className={styles.body} hidden={state.shaded} tabIndex={0}>
        {p.children}
      </div>
      {!state.shaded && (
        <button
          className={styles.grow}
          aria-label={`Resize ${p.title}`}
          onPointerDown={grow.onPointerDown}
        />
      )}
    </section>
  )
}
