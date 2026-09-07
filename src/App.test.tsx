import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the name as an h1', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1, name: 'Samuel Habib' })).toBeInTheDocument()
})
