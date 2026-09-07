import { zoomFrames } from './zoomRect'

test('produces two keyframes from source point to target rect', () => {
  const frames = zoomFrames(
    { x: 900, y: 40, width: 0, height: 0 },
    { x: 80, y: 44, width: 560, height: 620 },
  )
  expect(frames).toHaveLength(2)
  expect(String(frames[0].transform)).toContain('translate(900px, 40px)')
  expect(String(frames[1].transform)).toContain('translate(80px, 44px)')
  expect(String(frames[1].transform)).toContain('scale(560, 620)')
})
