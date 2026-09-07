import { load } from 'js-yaml'

export interface Frontmatter {
  data: Record<string, unknown>
  content: string
}

/**
 * Split a `---`-delimited YAML front matter block off the top of a markdown
 * string. Deliberately tiny and browser-safe — unlike gray-matter it never
 * reaches for Node's `fs`, so it survives being bundled for the client.
 */
export function parseFrontmatter(raw: string): Frontmatter {
  const normalized = raw.replace(/^﻿/, '')
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(normalized)
  if (!match) return { data: {}, content: normalized.trim() }
  const data = (load(match[1]) ?? {}) as Record<string, unknown>
  return { data, content: normalized.slice(match[0].length).trim() }
}
