import { render, screen } from '@testing-library/react'
import { ResumeArticle } from './resumeContent'
import { resume } from '../content/resume'

test('renders a semantic résumé article with correct heading order', () => {
  render(<ResumeArticle data={resume} />)
  expect(screen.getByRole('heading', { level: 1, name: /samuel habib/i }).tagName).toBe('H1')
  const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
  expect(h2s).toContain('ExaCare')
  expect(h2s).toContain('Education')
  expect(screen.getByText(/2B\+ records/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /resume \(pdf\)/i })).toHaveAttribute('href', '/Resume.pdf')
})
