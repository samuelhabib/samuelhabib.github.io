import { describe, it, expect } from 'vitest'
import { ICON_IDS, defaultGrid, clampIcon, isValidLayout } from './iconLayout'

describe('defaultGrid', () => {
  it('places every icon in a right-hand column, none overlapping', () => {
    const g = defaultGrid(1024)
    expect(Object.keys(g).sort()).toEqual([...ICON_IDS].sort())
    const ys = ICON_IDS.map((id) => g[id].y)
    for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(60)
    for (const id of ICON_IDS) expect(g[id].x).toBeGreaterThan(1024 - 120)
  })
  it('never runs off the left edge on a narrow viewport', () => {
    for (const id of ICON_IDS) expect(defaultGrid(200)[id].x).toBeGreaterThanOrEqual(12)
  })
})

describe('clampIcon', () => {
  const vp = { w: 800, h: 600 }
  it('pulls an off-screen point back inside', () => {
    expect(clampIcon({ x: -50, y: -50 }, vp)).toEqual({ x: 0, y: 0 })
    const c = clampIcon({ x: 5000, y: 5000 }, vp)
    expect(c.x).toBeLessThanOrEqual(800 - 76)
    expect(c.y).toBeLessThanOrEqual(600 - 52)
  })
  it('never lets an icon sit above the desktop box', () => {
    expect(clampIcon({ x: 10, y: -999 }, vp).y).toBe(0)
  })
})

describe('isValidLayout', () => {
  it('accepts a complete numeric map', () => {
    expect(isValidLayout(defaultGrid(1024))).toBe(true)
  })
  it('rejects partial, non-object, or non-numeric input', () => {
    expect(isValidLayout(null)).toBe(false)
    expect(isValidLayout({ resume: { x: 1, y: 2 } })).toBe(false)
    expect(isValidLayout({ ...defaultGrid(1024), resume: { x: 'nope', y: 2 } })).toBe(false)
  })
})
