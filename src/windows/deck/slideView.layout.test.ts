import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/windows/deck/SlideView.module.css'), 'utf8')
const diagramCss = readFileSync(
  resolve(process.cwd(), 'src/windows/deck/diagrams/diagram.module.css'),
  'utf8',
)

const rule = (src: string, sel: string) =>
  src.slice(src.indexOf(sel), src.indexOf('}', src.indexOf(sel)))

describe('SlideView layout', () => {
  it('centres the slide column horizontally', () => {
    expect(rule(css, '.slide {')).toMatch(/margin(-inline)?:\s*[^;]*auto/)
  })
  it('lets centred layouts use the full width', () => {
    expect(rule(css, '.center {')).toContain('max-width: none')
  })
  it('scrolls a short slide instead of amputating it', () => {
    expect(rule(css, '.slide {')).toContain('overflow-y: auto')
  })
  it('caps diagram height so the slide title stays on screen', () => {
    expect(rule(diagramCss, '.svg {')).toMatch(/max-height:/)
  })
})
