import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  onDragEnd?(x: number, y: number): void
  outlineDrag?: boolean
  children: ReactNode
}

export default function Window(p: WindowProps) {
  const { state } = p
  const ref = useRef<HTMLElement>(null)
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
  const grow = useDrag((dx, dy) => p.onResize(state.w + dx, state.h + dy))

  useEffect(() => {
    // Focus the window on a user-initiated open, but never yank focus away from
    // content that already claimed it (e.g. the Terminal's input).
    if (p.autoFocus && !ref.current?.contains(document.activeElement)) ref.current?.focus()
    // only when this window is first shown as a user-initiated open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <section
        ref={ref}
        id={`win-${state.id}`}
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
            className={`${styles.grow} grow-box`}
            aria-label={`Resize ${p.title}`}
            onPointerDown={grow.onPointerDown}
          />
        )}
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
}
