import { describe, it, expect } from 'vitest'
import { msToNextMinute } from './MenuBar'

describe('msToNextMinute', () => {
  it('counts the delay to the top of the next minute (plus a hair)', () => {
    expect(msToNextMinute(new Date(2026, 0, 1, 12, 30, 0, 0))).toBe(60_050)
    expect(msToNextMinute(new Date(2026, 0, 1, 12, 30, 45, 0))).toBe(15_050)
    expect(msToNextMinute(new Date(2026, 0, 1, 12, 30, 59, 900))).toBe(150)
  })
})
