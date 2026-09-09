import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResumeArticle } from './resumeContent'
import { resume } from '../content/resume'

test('project names in bullets open the matching deck stack when wired', async () => {
  const onOpenStack = vi.fn()
  render(<ResumeArticle data={resume} onOpenStack={onOpenStack} />)
  await userEvent.click(screen.getByRole('button', { name: 'Referral Outbound Center' }))
  expect(onOpenStack).toHaveBeenCalledWith('referral-outbound-center')
  expect(screen.getByRole('button', { name: 'Provider Directory' })).toBeInTheDocument()
})

test('without a handler, project names are anchors to the pre-rendered section', () => {
  render(<ResumeArticle data={resume} />)
  expect(screen.getByRole('link', { name: 'Provider Directory' })).toHaveAttribute(
    'href',
    '#project-provider-directory',
  )
})

test('renders a semantic résumé article with correct heading order', () => {
  render(<ResumeArticle data={resume} />)
  expect(screen.getByRole('heading', { level: 1, name: /samuel habib/i }).tagName).toBe('H1')
  const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
  expect(h2s).toContain('ExaCare')
  expect(h2s).toContain('Education')
  expect(screen.getByText(/2B\+ records/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /resume \(pdf\)/i })).toHaveAttribute('href', '/Resume.pdf')
})
