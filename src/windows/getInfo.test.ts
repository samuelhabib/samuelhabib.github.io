import { describe, it, expect } from 'vitest'
import { INFO } from './getInfo'

describe('INFO', () => {
  it('covers every window that has an icon or a File-menu entry, with a real comment', () => {
    for (const id of ['resume', 'readme', 'projects', 'terminal'] as const) {
      expect(INFO[id]).toBeTruthy()
      expect(INFO[id].comment.length).toBeGreaterThan(10)
    }
  })
  it('reports the build date as the modified date', () => {
    expect(INFO.resume.modified).toBe(__BUILD_DATE__)
  })
})
