import { projects, findProject } from './projects'

test('loads all four project files, split into work and side by front matter', () => {
  expect(projects.work.map((p) => p.slug)).toEqual(['provider-directory', 'referral-outbound-center'])
  expect(projects.side.map((p) => p.slug)).toEqual(['crisis-detection', 'fitness-bot'])
})

test('cards are assembled: Overview lead, ## sections, then a Tech & Links card', () => {
  const pd = projects.work[0]
  const headings = pd.cards.map((c) => c.heading)
  expect(headings).toEqual(['Overview', 'Problem', 'Approach', 'Result', 'Tech & Links'])
  const last = pd.cards[pd.cards.length - 1]
  expect(last.kind).toBe('techlinks')
  if (last.kind === 'techlinks') {
    expect(last.tech).toContain('PostgreSQL')
    expect(last.links).toEqual([])
  }
})

test('prose cards carry rendered HTML', () => {
  const problem = projects.work[0].cards.find((c) => c.heading === 'Problem')
  expect(problem?.kind).toBe('prose')
  if (problem?.kind === 'prose') expect(problem.html).toMatch(/<p>.*40,000\+ rows.*<\/p>/s)
})

test('a project with no lead paragraph has no Overview card', () => {
  const fb = projects.side.find((p) => p.slug === 'fitness-bot')!
  expect(fb.cards.map((c) => c.heading)).toEqual(['Placeholder'])
  expect(fb.placeholder).toBe(true)
})

test('non-placeholder projects are not flagged', () => {
  expect(projects.work.every((p) => p.placeholder === false)).toBe(true)
  expect(findProject(projects, 'crisis-detection')!.placeholder).toBe(false)
})

test('findProject matches an exact slug, then a partial', () => {
  expect(findProject(projects, 'referral-outbound-center')!.slug).toBe('referral-outbound-center')
  expect(findProject(projects, 'crisis')!.slug).toBe('crisis-detection')
  expect(findProject(projects, 'nope')).toBeUndefined()
})
