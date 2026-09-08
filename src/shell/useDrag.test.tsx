import { renderHook } from '@testing-library/react'
import { useDrag } from './useDrag'

/** jsdom's fireEvent.pointerMove drops clientX/clientY (no real PointerEvent),
 *  so build a MouseEvent, which does carry them. */
function pointerMove(x: number, y: number) {
  window.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y, bubbles: true }))
}
function pointerUp() {
  window.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
}
function down(result: { current: { onPointerDown: (e: React.PointerEvent) => void } }, x = 0, y = 0) {
  result.current.onPointerDown({ button: 0, clientX: x, clientY: y } as unknown as React.PointerEvent)
}

test('onEnd fires after a real drag', () => {
  const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(() => {}, onEnd))
  down(result)
  pointerMove(10, 10)
  pointerUp()
  expect(onEnd).toHaveBeenCalledOnce()
})

test('onEnd does NOT fire for a click with no movement', () => {
  const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(() => {}, onEnd))
  down(result)
  pointerUp()
  expect(onEnd).not.toHaveBeenCalled()
})

test('with a threshold, movement under it is not a drag', () => {
  const onDelta = vi.fn()
  const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(onDelta, onEnd, { threshold: 4 }))
  down(result)
  pointerMove(3, 0)
  pointerUp()
  expect(onDelta).not.toHaveBeenCalled()
  expect(onEnd).not.toHaveBeenCalled()
})

test('with a threshold, crossing it starts the drag and toggles data-dragging', () => {
  const onDelta = vi.fn()
  const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(onDelta, onEnd, { threshold: 4 }))
  down(result)
  expect(document.documentElement.dataset.dragging).toBe('')
  pointerMove(6, 0)
  pointerMove(8, 0)
  pointerUp()
  expect(onDelta.mock.calls[0]).toEqual([6, 0])
  expect(onDelta).toHaveBeenCalledTimes(2)
  expect(onEnd).toHaveBeenCalledOnce()
  expect(document.documentElement.dataset.dragging).toBeUndefined()
})
