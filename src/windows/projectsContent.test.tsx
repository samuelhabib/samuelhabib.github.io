import { render, screen } from '@testing-library/react'
import { ProjectsArticle } from './projectsContent'
import { projects } from '../content/projects'

test('renders every project as an h2 with h3 card headings', () => {
  render(<ProjectsArticle data={projects} />)
  const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
  expect(h2s).toContain('Provider Directory')
  expect(h2s).toContain('Mental Health Crisis Detection')
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toContain('Problem')
})

test('renders no h1 (the document already has one)', () => {
  render(<ProjectsArticle data={projects} />)
  expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
})

test('renders prose card HTML and the tech list', () => {
  render(<ProjectsArticle data={projects} />)
  expect(screen.getByText(/40,000\+ rows across six rosters/i)).toBeInTheDocument()
  expect(screen.getAllByText(/PostgreSQL/i)[0]).toBeInTheDocument()
})
