import rawResume from '../../content/resume.md?raw'
import { parseResume, resume } from './resume'

test('parses front matter into typed ResumeData', () => {
  const data = parseResume(rawResume)
  expect(data.name).toBe('Samuel Habib')
  expect(data.experience[0].company).toBe('ExaCare')
  expect(data.experience[0].end).toBe('Present') // ExaCare is current
  expect(data.experience[1].end).toBe('Feb 2026') // Apple ended when ExaCare began — only one "Present"
  expect(data.skills.find((s) => s.group === 'Languages')?.items).toContain('Kotlin')
  const searchGroup = data.skills.find((s) => s.items.includes('Solr'))
  expect(searchGroup?.group).toBe('Search and AI')
  expect(data.rawMarkdown).toContain('## Samuel Habib')
})

test('does not describe RoBERTa as "fine-tuned"', () => {
  expect(resume.rawMarkdown.toLowerCase()).not.toContain('fine-tuned roberta')
})

test('includes the 2B+ records/hr figure', () => {
  expect(resume.rawMarkdown).toContain('2B+ records')
})
