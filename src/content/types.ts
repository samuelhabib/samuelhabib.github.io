export interface ResumeJob {
  company: string
  role: string
  location: string
  start: string
  end: string
  bullets: string[]
}

export interface ResumeSchool {
  school: string
  degree: string
  detail: string
  start: string
  end: string
}

export interface ResumeLink {
  label: string
  href: string
}

export interface ResumeSkillGroup {
  group: string
  items: string[]
}

export interface ResumeData {
  name: string
  title: string
  location: string
  links: ResumeLink[]
  summary: string
  experience: ResumeJob[]
  skills: ResumeSkillGroup[]
  education: ResumeSchool[]
  /** the exact file body after the front matter, for a future `cat resume.md` */
  rawMarkdown: string
}
