import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/** Tests run with cwd = repo root (`vitest run`). */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8')

function moduleCssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = resolve(dir, d.name)
    if (d.isDirectory()) return moduleCssFiles(full)
    return d.name.endsWith('.module.css') ? [full] : []
  })
}

const tokens = read('src/styles/tokens.css')
const themes = read('src/styles/themes.css')
const globalCss = read('src/styles/global.css')
const indexHtml = read('index.html')

describe('no-flash theme init', () => {
  it('runs a synchronous theme-init script before the module script', () => {
    const scriptIdx = indexHtml.indexOf("localStorage.getItem('theme')")
    const moduleIdx = indexHtml.indexOf('src="/src/main.tsx"')
    expect(scriptIdx).toBeGreaterThan(-1)
    expect(scriptIdx).toBeLessThan(moduleIdx)
  })
  it('also restores the desktop pattern before paint', () => {
    expect(indexHtml).toContain("localStorage.getItem('desktopPattern')")
    expect(indexHtml).toContain('data-pattern')
  })
  it('does not auto-apply a theme from prefers-color-scheme', () => {
    expect(indexHtml).not.toContain('prefers-color-scheme')
  })
})

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

describe('components read semantic tokens, not palette primitives', () => {
  it('no module CSS paints a surface, ink, border, or shadow from --black/--white', () => {
    const rx =
      /(background[a-z-]*|color|border[a-z-]*|box-shadow|outline[a-z-]*)\s*:\s*[^;]*var\(--(black|white)\)/g
    const offenders: string[] = []
    for (const file of moduleCssFiles(resolve(process.cwd(), 'src'))) {
      const css = readFileSync(file, 'utf8')
      for (const m of css.matchAll(rx)) offenders.push(`${file.split('/src/')[1]}: ${m[0].trim()}`)
    }
    expect(offenders).toEqual([])
  })

  it('the global dither utilities stipple with --dither-ink', () => {
    const dither = read('src/styles/dither.css')
    expect(dither).not.toMatch(/gradient\([^)]*var\(--(black|white)\)/)
    expect(dither).toContain('var(--dither-ink)')
  })

  it('the base reset never references palette primitives (body + focus ring are themeable)', () => {
    const reset = read('src/styles/reset.css')
    expect(reset).not.toMatch(/var\(--(black|white)\)/)
  })
})
