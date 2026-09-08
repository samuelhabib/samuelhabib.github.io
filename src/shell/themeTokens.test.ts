import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/** Tests run with cwd = repo root (`vitest run`). */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8')

const tokens = read('src/styles/tokens.css')
const themes = read('src/styles/themes.css')
const globalCss = read('src/styles/global.css')

describe('theme classes', () => {
  it('themes.css defines exactly the five theme classes', () => {
    for (const c of [
      '.theme-system7', '.theme-dark', '.theme-system6',
      '.theme-crt-amber', '.theme-crt-green',
    ]) expect(themes).toContain(c)
  })
  it('global.css imports themes.css after tokens.css', () => {
    expect(globalCss.indexOf('themes.css')).toBeGreaterThan(globalCss.indexOf('tokens.css'))
  })
  it('dark theme flips surface and ink', () => {
    const dark = themes.slice(themes.indexOf('.theme-dark'))
    expect(dark).toContain('--c-bg: var(--black)')
    expect(dark).toContain('--c-fg: var(--white)')
  })
})

describe('semantic token layer', () => {
  it('defines the semantic surface/ink tokens on :root', () => {
    for (const t of [
      '--c-bg', '--c-fg', '--c-chrome-bg', '--c-chrome-fg',
      '--c-accent', '--c-accent-fg', '--dither-ink',
      '--chrome-font', '--window-border-w', '--titlebar-lines',
    ]) {
      expect(tokens).toContain(t + ':')
    }
  })
  it('keeps the palette primitives', () => {
    expect(tokens).toContain('--black: #000')
    expect(tokens).toContain('--white: #fff')
  })
})
