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

test('ships the skills as their own semantic section in the no-JS fallback', () => {
  render(<App />)
  const section = document.querySelector('main#main #skills') as HTMLElement
  expect(section).toBeInTheDocument()
  expect(section.querySelector('dl')).toBeInTheDocument()
  expect(section).toHaveTextContent('Languages')
  expect(section).toHaveTextContent('RoBERTa')
  const nav = document.querySelector('main#main .doc-nav') as HTMLElement
  expect(nav.querySelector('a[href="#skills"]')).toBeInTheDocument()
})
