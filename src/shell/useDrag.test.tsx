import { renderHook, fireEvent } from '@testing-library/react'
import { useDrag } from './useDrag'

test('onEnd fires after a real drag', () => {
  const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(() => {}, onEnd))
  result.current.onPointerDown({ button: 0, clientX: 0, clientY: 0 } as unknown as React.PointerEvent)
  fireEvent.pointerMove(window, { clientX: 10, clientY: 10 })
  fireEvent.pointerUp(window)
  expect(onEnd).toHaveBeenCalledOnce()
})

test('onEnd does NOT fire for a click with no movement', () => {
  const onEnd = vi.fn()
  const { result } = renderHook(() => useDrag(() => {}, onEnd))
  result.current.onPointerDown({ button: 0, clientX: 0, clientY: 0 } as unknown as React.PointerEvent)
  fireEvent.pointerUp(window)
  expect(onEnd).not.toHaveBeenCalled()
})
