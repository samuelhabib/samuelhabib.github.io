import { SOLVED, isSolved, adjacentToGap, slide, shuffle } from './puzzle'

test('SOLVED is 1..15 then the gap', () => {
  expect(SOLVED).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
  expect(isSolved(SOLVED)).toBe(true)
})

test('adjacentToGap returns the up-to-4 neighbours of the gap', () => {
  expect(adjacentToGap(SOLVED).sort((a, b) => a - b)).toEqual([11, 14])
})

test('slide swaps an adjacent tile with the gap and no-ops otherwise', () => {
  const moved = slide(SOLVED, 14)
  expect(moved[14]).toBe(0)
  expect(moved[15]).toBe(15)
  expect(slide(SOLVED, 0)).toEqual(SOLVED)
})

test('shuffle is a solvable 16-permutation that is not already solved', () => {
  for (let i = 0; i < 20; i++) {
    const b = shuffle()
    expect([...b].sort((x, y) => x - y)).toEqual(SOLVED.slice().sort((x, y) => x - y))
    expect(isSolved(b)).toBe(false)
  }
})
