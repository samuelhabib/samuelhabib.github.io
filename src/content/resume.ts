import rawResume from '../../content/resume.md?raw'
import { parseFrontmatter } from './frontmatter'
import type { ResumeData } from './types'

export function parseResume(fileContents: string): ResumeData {
  const { data, content } = parseFrontmatter(fileContents)
  return {
    name: String(data.name ?? ''),
    title: String(data.title ?? ''),
    location: String(data.location ?? ''),
    links: (data.links ?? []) as ResumeData['links'],
    summary: String(data.summary ?? '').trim(),
    availability: String(data.availability ?? '').trim(),
    experience: (data.experience ?? []) as ResumeData['experience'],
    skills: (data.skills ?? []) as ResumeData['skills'],
    education: (data.education ?? []) as ResumeData['education'],
    rawMarkdown: content.trim(),
  }
}

export const resume: ResumeData = parseResume(rawResume)
