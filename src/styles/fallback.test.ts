import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const fallback = readFileSync(resolve(process.cwd(), 'src/styles/fallback.css'), 'utf8')
const global = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8')

describe('mobile / no-JS fallback document', () => {
  it('gives the doc-nav links a real tap target', () => {
    const rule = fallback.match(/\.doc-nav a\s*\{([^}]*)\}/)
    expect(rule, '.doc-nav a rule missing').not.toBeNull()
    expect(rule![1]).toMatch(/display:\s*inline-block/)
    expect(rule![1]).toMatch(/padding:/)
  })

  it('keeps the mobile padding override where it can win the cascade', () => {
    // The base `.doc-fallback { padding }` lives in global.css *after* the
    // fallback.css @import, so the responsive override has to live there too or
    // it is dead on arrival.
    const base = global.indexOf('.doc-fallback {')
    const mobile = global.search(/@media \(max-width: 767px\)[\s\S]*?\.doc-fallback\s*\{[^}]*padding/)
    expect(base).toBeGreaterThan(-1)
    expect(mobile).toBeGreaterThan(base)
    expect(fallback).not.toMatch(/@media \(max-width: 767px\)/)
  })
})
