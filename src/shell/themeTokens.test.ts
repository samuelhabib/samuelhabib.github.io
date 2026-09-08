import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/** Tests run with cwd = repo root (`vitest run`). */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8')

const tokens = read('src/styles/tokens.css')

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
