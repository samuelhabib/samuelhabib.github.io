import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/windows/SkillsWindow.module.css'), 'utf8')

const rule = (src: string, sel: string) =>
  src.slice(src.indexOf(sel), src.indexOf('}', src.indexOf(sel)))

describe('SkillsWindow layout', () => {
  it('sets the group list and the detail pane side by side', () => {
    expect(rule(css, '.panes {')).toMatch(/display:\s*(flex|grid)/)
  })

  it('draws a hard divider between the two panes', () => {
    expect(rule(css, '.groups {')).toMatch(/border-right:\s*1px solid var\(--c-fg\)/)
  })

  it('inverts the selected group to pure black-on-white — the System 7 Chooser bar', () => {
    const r = rule(css, '.selected {')
    expect(r).toMatch(/background:\s*var\(--c-fg\)/)
    expect(r).toMatch(/color:\s*var\(--c-bg\)/)
  })

  it('keeps a visible focus ring on the group options', () => {
    expect(rule(css, '.option:focus-visible {')).toMatch(/outline:/)
  })

  it('never dims anything with opacity', () => {
    expect(css).not.toMatch(/opacity\s*:/)
  })

  it('carries no colour literals — only the 1-bit semantic tokens', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(css).not.toMatch(/\b(rgba?|hsla?)\(/)
  })

  it('scrolls an overlong list/detail instead of clipping it', () => {
    expect(rule(css, '.groups {')).toMatch(/overflow-y:\s*auto/)
    expect(rule(css, '.detail {')).toMatch(/overflow-y:\s*auto/)
  })
})
