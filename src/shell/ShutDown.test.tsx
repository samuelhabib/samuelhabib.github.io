import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShutDown from './ShutDown'

const setReduce = (v: boolean) => {
  window.matchMedia = ((q: string) => ({
    matches: /reduced-motion/.test(q) ? v : /min-width/.test(q),
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

test('under reduced motion it shows the safe-to-power-off screen immediately', async () => {
  setReduce(true)
  const onStartup = vi.fn()
  render(<ShutDown onStartup={onStartup} />)
  expect(screen.getByText(/safe to turn off/i)).toBeInTheDocument()
  await userEvent.click(screen.getByText(/safe to turn off/i))
  expect(onStartup).toHaveBeenCalledOnce()
})
