import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PuzzleWindow from './PuzzleWindow'

const cellText = (grid: HTMLElement) => Array.from(grid.children).map((el) => el.textContent ?? '')

test('renders 15 numbered tiles', () => {
  render(<PuzzleWindow />)
  for (let n = 1; n <= 15; n++) {
    expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument()
  }
})

test('Shuffle produces a different arrangement', async () => {
  render(<PuzzleWindow />)
  const grid = screen.getByRole('group', { name: /puzzle/i })
  const before = cellText(grid).join(',')
  await userEvent.click(screen.getByRole('button', { name: /shuffle/i }))
  expect(cellText(grid).join(',')).not.toBe(before)
})

test('clicking a tile next to the gap moves it', async () => {
  render(<PuzzleWindow />)
  const grid = screen.getByRole('group', { name: /puzzle/i })
  const before = cellText(grid)
  const emptyIdx = before.findIndex((t) => t === '')
  const row = Math.floor(emptyIdx / 4)
  const col = emptyIdx % 4
  // Real 4x4 neighbours only — no row wrapping.
  const target = [
    col > 0 ? emptyIdx - 1 : -1,
    col < 3 ? emptyIdx + 1 : -1,
    row > 0 ? emptyIdx - 4 : -1,
    row < 3 ? emptyIdx + 4 : -1,
  ].find((i) => i >= 0 && before[i] !== '')!
  await userEvent.click(grid.children[target] as HTMLElement)
  const after = cellText(grid)
  expect(after[emptyIdx]).toBe(before[target])
  expect(after[target]).toBe('')
})
