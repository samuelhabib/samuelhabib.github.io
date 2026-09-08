import { render, screen } from '@testing-library/react'
import AboutDialog from './AboutDialog'

test('shows the version line, a build date, and the memory legend', () => {
  render(<AboutDialog />)
  expect(screen.getByText(/system 7, remastered/i)).toBeInTheDocument()
  expect(screen.getByText(/^Built /)).toBeInTheDocument()
  expect(screen.getByText('Total Memory')).toBeInTheDocument()
  for (const label of ['System', 'Side projects', 'Coffee', 'Sleep']) {
    expect(screen.getByText(label)).toBeInTheDocument()
  }
})
