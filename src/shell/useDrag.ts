import { useCallback, useRef } from 'react'

/**
 * Pointer-drag helper. `onDelta` is called with the incremental movement since
 * the last event, so callers add it to whatever they are positioning.
 */
export function useDrag(onDelta: (dx: number, dy: number) => void) {
  const origin = useRef<{ x: number; y: number } | null>(null)

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!origin.current) return
      onDelta(e.clientX - origin.current.x, e.clientY - origin.current.y)
      origin.current = { x: e.clientX, y: e.clientY }
    },
    [onDelta],
  )

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
