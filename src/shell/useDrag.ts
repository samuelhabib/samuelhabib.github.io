import { useCallback, useRef } from 'react'

/**
 * Pointer-drag helper. `onDelta` is the incremental movement since the last
 * event. `onEnd` (optional) fires once on pointerup, but only if the pointer
 * actually moved — a bare click does not count as a drag.
 *
 * `opts.threshold` (px, default 0) suppresses `onDelta` / `onEnd` until the
 * pointer has moved more than that far from where it went down, so a sloppy
 * click on a draggable thing still registers as a click. While a drag is live
 * `document.documentElement.dataset.dragging` is set (`cursors.css` uses it to
 * force the grabbing cursor everywhere).
 *
 * Both callbacks are read through refs so the window listeners always call the
 * latest closure (without this, the handler keeps using drag-start state and
 * the target snaps back on every move after the first).
 */
export function useDrag(
  onDelta: (dx: number, dy: number) => void,
  onEnd?: () => void,
  opts?: { threshold?: number },
) {
  const latest = useRef(onDelta)
  latest.current = onDelta
  const latestEnd = useRef(onEnd)
  latestEnd.current = onEnd
  const threshold = opts?.threshold ?? 0

  const origin = useRef<{ x: number; y: number } | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!origin.current || !start.current) return
      if (!moved.current) {
        const far =
          Math.abs(e.clientX - start.current.x) > threshold ||
          Math.abs(e.clientY - start.current.y) > threshold
        if (!far) return
        moved.current = true
      }
      latest.current(e.clientX - origin.current.x, e.clientY - origin.current.y)
      origin.current = { x: e.clientX, y: e.clientY }
    },
    [threshold],
  )

  const onPointerUp = useCallback(() => {
    origin.current = null
    start.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    delete document.documentElement.dataset.dragging
    if (moved.current) latestEnd.current?.()
    moved.current = false
  }, [onPointerMove])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      origin.current = { x: e.clientX, y: e.clientY }
      start.current = { x: e.clientX, y: e.clientY }
      moved.current = false
      document.documentElement.dataset.dragging = ''
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [onPointerMove, onPointerUp],
  )

  return { onPointerDown }
}
