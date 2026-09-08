import { describe, it, expect } from 'vitest'
import { windowsReducer, initialDesktop, type WindowId } from './windows'
import { nextWindow } from './windowSwitch'

const open = (s: typeof initialDesktop, id: WindowId) => windowsReducer(s, { type: 'open', id })

describe('nextWindow', () => {
  it('returns null with 0 or 1 open windows', () => {
    expect(nextWindow(initialDesktop, 1)).toBeNull()
    expect(nextWindow(open(initialDesktop, 'resume'), 1)).toBeNull()
  })

  it('cycles by z order and wraps around the front window', () => {
    const s = open(open(open(initialDesktop, 'resume'), 'readme'), 'terminal')
    // terminal is front (highest z); forward wraps to the back-most (resume)
    expect(nextWindow(s, 1)).toBe('resume')
    // backward steps to the one just behind the front
    expect(nextWindow(s, -1)).toBe('readme')
  })
})
