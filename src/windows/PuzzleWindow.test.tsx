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
  const target = [emptyIdx - 1, emptyIdx + 1, emptyIdx - 4, emptyIdx + 4].find(
    (i) => i >= 0 && i < 16 && before[i] !== '',
  )!
  await userEvent.click(grid.children[target] as HTMLElement)
  const after = cellText(grid)
  expect(after[emptyIdx]).toBe(before[target])
  expect(after[target]).toBe('')
})
