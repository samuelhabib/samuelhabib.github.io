import { render, screen, fireEvent, renderHook } from '@testing-library/react'
import { useWindowKeys } from './useWindowKeys'

test('Escape closes the front window', () => {
  const onClose = vi.fn()
  render(<button data-testid="x" />)
  renderHook(() => useWindowKeys('resume', onClose))
  fireEvent.keyDown(screen.getByTestId('x'), { key: 'Escape' })
  expect(onClose).toHaveBeenCalledWith('resume')
})

test('Escape originating inside a terminal is ignored', () => {
  const onClose = vi.fn()
  render(
    <div data-terminal>
      <input data-testid="ti" />
    </div>,
  )
  renderHook(() => useWindowKeys('terminal', onClose))
  fireEvent.keyDown(screen.getByTestId('ti'), { key: 'Escape' })
  expect(onClose).not.toHaveBeenCalled()
})
