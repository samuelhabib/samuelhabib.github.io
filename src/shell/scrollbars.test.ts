import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8')

describe('desktop scrollbars', () => {
  it('styles WebKit scrollbar parts, scoped to the shell', () => {
    expect(css).toMatch(/\.desktop ::-webkit-scrollbar\b/)
  })
  it('gives Firefox a black-on-white thin scrollbar', () => {
    expect(css).toMatch(/scrollbar-color:\s*var\(--c-fg\) var\(--c-bg\)/)
  })
})
