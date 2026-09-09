import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Boot from './Boot'

test('shows the welcome line and the startup-extension tray', () => {
  render(<Boot onSkip={() => {}} />)
  expect(screen.getByText('Welcome to Macintosh')).toBeInTheDocument()
  const tray = screen.getByTestId('boot-extensions')
  expect(tray.querySelectorAll('svg').length).toBeGreaterThanOrEqual(4)
})

test('each extension icon is staggered so they march in one by one', () => {
  render(<Boot onSkip={() => {}} />)
  const icons = screen.getByTestId('boot-extensions').querySelectorAll<SVGElement>('svg')
  const delays = [...icons].map((el) => el.style.animationDelay)
  expect(new Set(delays).size).toBe(icons.length)
  expect(delays[0]).toBe('0s')
})

test('a key press skips the boot', async () => {
  const onSkip = vi.fn()
  render(<Boot onSkip={onSkip} />)
  await userEvent.keyboard('{Enter}')
  expect(onSkip).toHaveBeenCalled()
})
