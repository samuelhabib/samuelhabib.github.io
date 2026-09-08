import { marked } from 'marked'
import { parseFrontmatter } from './frontmatter'
import type { Project, ProjectCard, ProjectLink, ProjectsData } from './projectTypes'
import providerDirectory from '../../content/projects/provider-directory.md?raw'
import referralOutboundCenter from '../../content/projects/referral-outbound-center.md?raw'
import crisisDetection from '../../content/projects/crisis-detection.md?raw'

// Explicit ?raw imports rather than import.meta.glob: proven to work in this
// codebase (resume.ts / about.ts), zero SSG risk, and the list is short.
// Adding a project = add an import and an array entry.
const RAW = [providerDirectory, referralOutboundCenter, crisisDetection]

function splitSections(body: string): {
  lead: string
  items: { heading: string; body: string }[]
} {
  const parts = body.split(/^## +/m)
  const lead = (parts.shift() ?? '').trim()
  const items = parts.map((p) => {
    const nl = p.indexOf('\n')
    const heading = (nl === -1 ? p : p.slice(0, nl)).trim()
    const rest = (nl === -1 ? '' : p.slice(nl + 1)).trim()
    return { heading, body: rest }
  })
  return { lead, items }
}

function parseProject(raw: string): Project {
  const { data, content } = parseFrontmatter(raw)
  const { lead, items } = splitSections(content)
  const tech = (data.tech ?? []) as string[]
  const links = (data.links ?? []) as ProjectLink[]

  const cards: ProjectCard[] = []
  if (lead) cards.push({ kind: 'prose', heading: 'Overview', html: marked.parse(lead) as string })
  for (const s of items) {
    cards.push({ kind: 'prose', heading: s.heading, html: marked.parse(s.body) as string })
  }
  if (tech.length || links.length) {
    cards.push({ kind: 'techlinks', heading: 'Tech & Links', tech, links })
  }

  return {
    slug: String(data.slug ?? ''),
    title: String(data.title ?? ''),
    group: data.group === 'side' ? 'side' : 'work',
    order: Number(data.order ?? 0),
    placeholder: data.placeholder === true,
    summary: String(data.summary ?? '').trim(),
    tech,
    links,
    cards,
    rawMarkdown: content.trim(),
  }
}

const all = RAW.map(parseProject)
const byOrder = (a: Project, b: Project) => a.order - b.order

export const projects: ProjectsData = {
  work: all.filter((p) => p.group === 'work').sort(byOrder),
  side: all.filter((p) => p.group === 'side').sort(byOrder),
}

export function findProject(data: ProjectsData, query: string): Project | undefined {
  const q = query.toLowerCase().trim()
  const flat = [...data.work, ...data.side]
  return (
    flat.find((p) => p.slug.toLowerCase() === q) ??
    flat.find((p) => p.slug.toLowerCase().includes(q))
  )
}
