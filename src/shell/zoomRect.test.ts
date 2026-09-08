import { zoomFrames } from './zoomRect'

test('produces two keyframes: a zero-size rect at the source point, then the target rect', () => {
  const frames = zoomFrames(
    { x: 900, y: 40, width: 0, height: 0 },
    { x: 80, y: 44, width: 560, height: 620 },
  )
  expect(frames).toHaveLength(2)
  expect(frames[0]).toMatchObject({ left: '900px', top: '40px', width: '0px', height: '0px' })
  expect(frames[1]).toMatchObject({ left: '80px', top: '44px', width: '560px', height: '620px' })
})
