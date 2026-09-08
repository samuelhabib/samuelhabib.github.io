export interface ProjectLink {
  label: string
  href: string
}

export type ProjectCard =
  | { kind: 'prose'; heading: string; html: string }
  | { kind: 'techlinks'; heading: string; tech: string[]; links: ProjectLink[] }

export interface Project {
  slug: string
  title: string
  group: 'work' | 'side'
  order: number
  placeholder: boolean
  summary: string
  tech: string[]
  links: ProjectLink[]
  /** [Overview?, ...## sections, TechLinks?] */
  cards: ProjectCard[]
  rawMarkdown: string
}

export interface ProjectsData {
  work: Project[]
  side: Project[]
}
