import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TerminalWindow from './TerminalWindow'

const bridge = { open: vi.fn(), close: vi.fn(), beep: vi.fn() }

test('has a labelled input and a polite log region', () => {
  render(<TerminalWindow bridge={bridge} />)
  expect(screen.getByRole('textbox', { name: /terminal input/i })).toBeInTheDocument()
  expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite')
})

test('focuses the input on mount', () => {
  render(<TerminalWindow bridge={bridge} />)
  expect(screen.getByRole('textbox', { name: /terminal input/i })).toHaveFocus()
})

test('typing a command and pressing Enter shows its output', async () => {
  render(<TerminalWindow bridge={bridge} />)
  const input = screen.getByRole('textbox', { name: /terminal input/i })
  await userEvent.type(input, 'help{Enter}')
  expect(screen.getByRole('log')).toHaveTextContent(/experience/)
})

test('a quick-command chip runs that command', async () => {
  render(<TerminalWindow bridge={bridge} />)
  await userEvent.click(screen.getByRole('button', { name: 'whoami' }))
  expect(screen.getByRole('log')).toHaveTextContent(/Samuel Habib/)
})

test('Tab completes a single candidate', async () => {
  render(<TerminalWindow bridge={bridge} />)
  const input = screen.getByRole('textbox', { name: /terminal input/i }) as HTMLInputElement
  await userEvent.type(input, 'expe')
  await userEvent.keyboard('{Tab}')
  expect(input.value).toBe('experience ')
})

test('ArrowUp recalls the previous command', async () => {
  render(<TerminalWindow bridge={bridge} />)
  const input = screen.getByRole('textbox', { name: /terminal input/i }) as HTMLInputElement
  await userEvent.type(input, 'date{Enter}')
  await userEvent.keyboard('{ArrowUp}')
  expect(input.value).toBe('date')
})

test('Escape clears the input line and does not bubble', async () => {
  const onParentKeyDown = vi.fn()
  render(
    <div onKeyDown={onParentKeyDown}>
      <TerminalWindow bridge={bridge} />
    </div>,
  )
  const input = screen.getByRole('textbox', { name: /terminal input/i }) as HTMLInputElement
  await userEvent.type(input, 'hal')
  await userEvent.keyboard('{Escape}')
  expect(input.value).toBe('')
  // ordinary keys bubble; the Escape must be stopped before it reaches the parent
  const escaped = onParentKeyDown.mock.calls.some(([e]) => (e as KeyboardEvent).key === 'Escape')
  expect(escaped).toBe(false)
})
