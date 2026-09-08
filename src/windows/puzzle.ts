export type Board = number[]

export const SOLVED: Board = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]

export function isSolved(b: Board): boolean {
  return b.every((v, i) => v === SOLVED[i])
}

export function adjacentToGap(b: Board): number[] {
  const gap = b.indexOf(0)
  const row = Math.floor(gap / 4)
  const col = gap % 4
  const out: number[] = []
  if (row > 0) out.push(gap - 4)
  if (row < 3) out.push(gap + 4)
  if (col > 0) out.push(gap - 1)
  if (col < 3) out.push(gap + 1)
  return out
}

export function slide(b: Board, tileIndex: number): Board {
  if (!adjacentToGap(b).includes(tileIndex)) return b
  const gap = b.indexOf(0)
  const next = b.slice()
  next[gap] = b[tileIndex]
  next[tileIndex] = 0
  return next
}

export function shuffle(rng: () => number = Math.random): Board {
  let b = SOLVED.slice()
  let prevGap = -1
  for (let i = 0; i < 120; i++) {
    const options = adjacentToGap(b).filter((idx) => idx !== prevGap)
    prevGap = b.indexOf(0)
    b = slide(b, options[Math.floor(rng() * options.length)])
  }
  // a 120-move random walk can theoretically land back on SOLVED — nudge once more
  if (isSolved(b)) b = slide(b, adjacentToGap(b)[0])
  return b
}
