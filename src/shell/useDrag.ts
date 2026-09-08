import { useCallback, useRef } from 'react'

/**
 * Pointer-drag helper. `onDelta` is the incremental movement since the last
 * event. `onEnd` (optional) fires once on pointerup, but only if the pointer
 * actually moved — a bare click does not count as a drag.
 *
 * Both callbacks are read through refs so the window listeners always call the
 * latest closure (without this, the handler keeps using drag-start state and
 * the target snaps back on every move after the first).
 */
export function useDrag(onDelta: (dx: number, dy: number) => void, onEnd?: () => void) {
  const latest = useRef(onDelta)
  latest.current = onDelta
  const latestEnd = useRef(onEnd)
  latestEnd.current = onEnd

  const origin = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!origin.current) return
    moved.current = true
    latest.current(e.clientX - origin.current.x, e.clientY - origin.current.y)
    origin.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onPointerUp = useCallback(() => {
    origin.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    if (moved.current) latestEnd.current?.()
    moved.current = false
  }, [onPointerMove])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      origin.current = { x: e.clientX, y: e.clientY }
      moved.current = false
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [onPointerMove, onPointerUp],
  )

  return { onPointerDown }
}
