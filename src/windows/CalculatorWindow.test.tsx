import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalculatorWindow from './CalculatorWindow'

test('adds two numbers via the on-screen keys', async () => {
  render(<CalculatorWindow />)
  const out = screen.getByRole('status')
  for (const label of ['6', '+', '7', '=']) {
    await userEvent.click(screen.getByRole('button', { name: label }))
  }
  expect(out).toHaveTextContent('13')
})

test('the physical keyboard drives it too', async () => {
  render(<CalculatorWindow />)
  screen.getByRole('group', { name: 'Calculator' }).focus()
  await userEvent.keyboard('8*8=')
  expect(screen.getByRole('status')).toHaveTextContent('64')
})

test('C clears the readout back to zero', async () => {
  render(<CalculatorWindow />)
  await userEvent.keyboard('9')
  await userEvent.click(screen.getByRole('button', { name: 'C' }))
  expect(screen.getByRole('status')).toHaveTextContent('0')
})
