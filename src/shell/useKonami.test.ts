import { renderHook, fireEvent } from '@testing-library/react'
import { useKonami } from './useKonami'

const SEQ = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]
const type = (keys: string[]) => keys.forEach((key) => fireEvent.keyDown(window, { key }))

test('fires once on the full sequence', () => {
  const cb = vi.fn()
  renderHook(() => useKonami(cb))
  type(SEQ)
  expect(cb).toHaveBeenCalledOnce()
})

test('a wrong key mid-sequence resets progress', () => {
  const cb = vi.fn()
  renderHook(() => useKonami(cb))
  type(['ArrowUp', 'ArrowUp', 'ArrowDown', 'x'])
  type(SEQ.slice(3))
  expect(cb).not.toHaveBeenCalled()
})

test('re-arms after firing', () => {
  const cb = vi.fn()
  renderHook(() => useKonami(cb))
  type(SEQ)
  type(SEQ)
  expect(cb).toHaveBeenCalledTimes(2)
})
