import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScrapbookWindow from './ScrapbookWindow'

test('shows the first clipping and pages forward with the arrow key', async () => {
  render(<ScrapbookWindow />)
  expect(screen.getByText(/Referral Outbound Center — pipeline/)).toBeInTheDocument()
  expect(screen.getByText('1 of 3')).toBeInTheDocument()

  screen.getByRole('group', { name: 'Scrapbook' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.getByText(/self-healing reconciliation/)).toBeInTheDocument()
  expect(screen.getByText('2 of 3')).toBeInTheDocument()
})

test('the Prev button wraps around to the last clipping', async () => {
  render(<ScrapbookWindow />)
  await userEvent.click(screen.getByRole('button', { name: 'Previous clipping' }))
  expect(screen.getByText('3 of 3')).toBeInTheDocument()
  expect(screen.getByText(/the outcome grid/)).toBeInTheDocument()
})
