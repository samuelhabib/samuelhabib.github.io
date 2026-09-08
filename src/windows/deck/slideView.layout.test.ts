import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/windows/deck/SlideView.module.css'), 'utf8')

describe('SlideView layout', () => {
  it('centres the slide column horizontally', () => {
    const slide = css.slice(css.indexOf('.slide {'), css.indexOf('}', css.indexOf('.slide {')))
    expect(slide).toMatch(/margin(-inline)?:\s*[^;]*auto/)
  })
  it('lets centred layouts use the full width', () => {
    const center = css.slice(css.indexOf('.center {'), css.indexOf('}', css.indexOf('.center {')))
    expect(center).toContain('max-width: none')
  })
})
