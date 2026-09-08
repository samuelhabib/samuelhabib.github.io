import { initialDesktop, windowsReducer, frontWindow } from './windows'

test('open marks a window open and brings it to front', () => {
  const s = windowsReducer(initialDesktop, { type: 'open', id: 'resume' })
  expect(s.windows.resume.open).toBe(true)
  expect(frontWindow(s)).toBe('resume')
})

test('focus raises z above all others', () => {
  let s = windowsReducer(initialDesktop, { type: 'open', id: 'resume' })
  s = windowsReducer(s, { type: 'open', id: 'terminal' })
  expect(frontWindow(s)).toBe('terminal')
  s = windowsReducer(s, { type: 'focus', id: 'resume' })
  expect(frontWindow(s)).toBe('resume')
})

test('close hides the window but keeps its geometry', () => {
  let s = windowsReducer(initialDesktop, { type: 'open', id: 'resume' })
  s = windowsReducer(s, { type: 'move', id: 'resume', x: 120, y: 80 })
  s = windowsReducer(s, { type: 'close', id: 'resume' })
  expect(s.windows.resume.open).toBe(false)
  expect(s.windows.resume.x).toBe(120)
})

test('toggleShade flips shaded', () => {
  let s = windowsReducer(initialDesktop, { type: 'open', id: 'resume' })
  s = windowsReducer(s, { type: 'toggleShade', id: 'resume' })
  expect(s.windows.resume.shaded).toBe(true)
})

test('open records the source point for the zoom-rect animation', () => {
  const s = windowsReducer(initialDesktop, { type: 'open', id: 'resume', from: { x: 900, y: 40 } })
  expect(s.windows.resume.minZoom).toEqual({ x: 900, y: 40 })
})

test('zoom stores the current rect, fills the desktop, then restores it exactly', () => {
  let s = windowsReducer(initialDesktop, { type: 'open', id: 'resume' })
  const orig = { ...s.windows.resume }
  s = windowsReducer(s, { type: 'zoom', id: 'resume', desktop: { w: 1000, h: 700 } })
  expect(s.windows.resume).toMatchObject({ x: 0, y: 0, w: 1000, h: 700 })
  expect(s.windows.resume.maxed).toMatchObject({ x: orig.x, y: orig.y, w: orig.w, h: orig.h })
  s = windowsReducer(s, { type: 'zoom', id: 'resume', desktop: { w: 1280, h: 800 } })
  expect(s.windows.resume).toMatchObject({ x: orig.x, y: orig.y, w: orig.w, h: orig.h })
  expect(s.windows.resume.maxed).toBeNull()
})
