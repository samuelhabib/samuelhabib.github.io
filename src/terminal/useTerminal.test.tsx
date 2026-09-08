import { renderHook, act, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTerminal } from './useTerminal'

const bridge = { open: () => {}, close: () => {}, beep: () => {}, openStack: () => {} }
const lastText = (nodes: { node: ReactNode }[]) => {
  const { container } = render(<>{nodes[nodes.length - 1].node}</>)
  return container.textContent ?? ''
}

test('submit echoes a prompt line and appends the command output', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.submit('whoami'))
  expect(result.current.entries.length).toBe(2)
  expect(lastText(result.current.entries)).toMatch(/Samuel Habib/)
  expect(result.current.input).toBe('')
})

test('clear wipes the buffer', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.submit('whoami'))
  act(() => result.current.submit('clear'))
  expect(result.current.entries).toEqual([])
})

test('recall walks command history into the input', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.submit('help'))
  act(() => result.current.submit('date'))
  act(() => result.current.recall(-1))
  expect(result.current.input).toBe('date')
  act(() => result.current.recall(-1))
  expect(result.current.input).toBe('help')
  act(() => result.current.recall(1))
  expect(result.current.input).toBe('date')
})

test('ghost previews a single completion candidate', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.setInput('expe'))
  expect(result.current.ghost).toBe('experience')
  act(() => result.current.setInput('c')) // cat / contact / clear — more than one
  expect(result.current.ghost).toBe('')
})

test('complete fills a single candidate', () => {
  const { result } = renderHook(() => useTerminal(bridge))
  act(() => result.current.setInput('expe'))
  act(() => result.current.complete())
  expect(result.current.input).toBe('experience ')
})

test('bridge calls go through the live ref, not a stale closure', () => {
  const open = vi.fn()
  const { result, rerender } = renderHook(({ b }) => useTerminal(b), {
    initialProps: { b: { open: () => {}, close: () => {}, beep: () => {}, openStack: () => {} } },
  })
  rerender({ b: { open, close: () => {}, beep: () => {}, openStack: () => {} } })
  act(() => result.current.submit('open resume'))
  expect(open).toHaveBeenCalledWith('resume')
})
