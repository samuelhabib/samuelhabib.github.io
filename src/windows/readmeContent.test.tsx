import { render, screen } from '@testing-library/react'
import { ReadMeArticle } from './readmeContent'

test('renders the Read Me with question headings and the AI story', () => {
  render(<ReadMeArticle />)
  expect(screen.getByRole('heading', { level: 1, name: /read me/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /why healthcare data\?/i })).toBeInTheDocument()
  expect(screen.getByText(/Claude Code and the Superpowers workflow/i)).toBeInTheDocument()
})
