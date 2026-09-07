import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

test('pre-renders the résumé as the no-JS fallback, then mounts the desktop', async () => {
  render(<App />)

  // The fallback <main> is always in the DOM with the full résumé.
  const main = document.querySelector('main#main')
  expect(main).toBeInTheDocument()
  expect(main).toHaveTextContent('Samuel Habib')
  expect(main).toHaveTextContent('Referral Outbound Center')

  // After hydration the classic-Mac desktop appears and the fallback is hidden.
  await waitFor(() =>
    expect(screen.getByRole('dialog', { name: /résumé/i })).toBeInTheDocument(),
  )
  expect(main).toHaveAttribute('hidden')
})
