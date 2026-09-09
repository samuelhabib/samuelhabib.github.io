import { initialDesktop, windowsReducer, frontWindow, clampWindow } from './windows'

test('clampWindow keeps the title bar and a strip of the window on screen', () => {
  const desk = { w: 1000, h: 700 }
  // dragged far off the top-left
  expect(clampWindow(-500, -80, 400, desk)).toEqual({ x: 72 - 400, y: 0 })
  // dragged off the bottom-right
  expect(clampWindow(2000, 2000, 400, desk)).toEqual({ x: 1000 - 72, y: 700 - 22 })
  // a normal position is untouched
  expect(clampWindow(120, 90, 400, desk)).toEqual({ x: 120, y: 90 })
})

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

test('open works for the skills window and brings it to front', () => {
  const s = windowsReducer(initialDesktop, { type: 'open', id: 'skills' })
  expect(s.windows.skills.open).toBe(true)
  expect(frontWindow(s)).toBe('skills')
})

test('open works for the calculator desk accessory', () => {
  const s = windowsReducer(initialDesktop, { type: 'open', id: 'calculator' })
  expect(s.windows.calculator.open).toBe(true)
  expect(frontWindow(s)).toBe('calculator')
})

test('open works for the scrapbook desk accessory', () => {
  const s = windowsReducer(initialDesktop, { type: 'open', id: 'scrapbook' })
  expect(s.windows.scrapbook.open).toBe(true)
  expect(frontWindow(s)).toBe('scrapbook')
})

test('home resets to the first-run arrangement (résumé + read me)', () => {
  let s = windowsReducer(initialDesktop, { type: 'open', id: 'puzzle' })
  s = windowsReducer(s, { type: 'move', id: 'puzzle', x: 500, y: 500 })
  s = windowsReducer(s, { type: 'toggleShade', id: 'resume' })
  s = windowsReducer(s, { type: 'home' })
  expect(s.windows.puzzle.open).toBe(false)
  expect(s.windows.puzzle.x).toBe(initialDesktop.windows.puzzle.x)
  expect(s.windows.resume.open).toBe(true)
  expect(s.windows.readme.open).toBe(true)
  expect(s.windows.resume.shaded).toBe(false)
  expect(frontWindow(s)).toBe('readme')
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
