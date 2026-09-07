import { renderHook, act } from '@testing-library/react'
import { useBoot } from './useBoot'

beforeEach(() => sessionStorage.clear())

test('skips boot when the session flag is set', () => {
  sessionStorage.setItem('booted', '1')
  const { result } = renderHook(() => useBoot())
  expect(result.current.booting).toBe(false)
})

test('boots then finishes and sets the flag', async () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useBoot())
  expect(result.current.booting).toBe(true)
  await act(async () => {
    vi.advanceTimersByTime(1600)
  })
  expect(result.current.booting).toBe(false)
  expect(sessionStorage.getItem('booted')).toBe('1')
  vi.useRealTimers()
})

test('skip() ends the boot immediately', () => {
  const { result } = renderHook(() => useBoot())
  act(() => result.current.skip())
  expect(result.current.booting).toBe(false)
})
