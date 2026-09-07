import { useCallback, useRef } from 'react'

/**
 * Pointer-drag helper. `onDelta` is called with the incremental movement since
 * the last event, so callers add it to whatever they are positioning.
 *
 * `onDelta` is read through a ref so the window listeners always call the
 * latest closure — without this, the handler keeps using the position captured
 * at drag-start and the target snaps back on every move after the first.
 */
export function useDrag(onDelta: (dx: number, dy: number) => void) {
  const latest = useRef(onDelta)
  latest.current = onDelta

  const origin = useRef<{ x: number; y: number } | null>(null)

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!origin.current) return
    latest.current(e.clientX - origin.current.x, e.clientY - origin.current.y)
    origin.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onPointerUp = useCallback(() => {
    origin.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }, [onPointerMove])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      origin.current = { x: e.clientX, y: e.clientY }
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [onPointerMove, onPointerUp],
  )

  return { onPointerDown }
}
