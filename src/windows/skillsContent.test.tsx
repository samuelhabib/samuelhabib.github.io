import { render, screen, within } from '@testing-library/react'
import { SkillsArticle } from './skillsContent'
import { resume } from '../content/resume'

test('renders the skills as a semantic definition list, one term per group', () => {
  render(<SkillsArticle groups={resume.skills} />)
  expect(screen.getByRole('heading', { level: 2, name: /^skills$/i }).tagName).toBe('H2')
  const list = document.querySelector('#skills-fallback dl') as HTMLElement
  expect(list).toBeInTheDocument()
  const terms = within(list).getAllByRole('term').map((t) => t.textContent)
  expect(terms).toEqual(resume.skills.map((g) => g.group))
  for (const g of resume.skills) {
    for (const item of g.items) {
      expect(within(list).getByText(item)).toBeInTheDocument()
    }
  }
})
