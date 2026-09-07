import { marked } from 'marked'
import raw from '../../content/about.md?raw'
import { parseFrontmatter } from './frontmatter'

const { data, content } = parseFrontmatter(raw)

export const about = {
  title: String(data.title ?? 'Read Me'),
  html: marked.parse(content) as string,
  rawMarkdown: content.trim(),
}
