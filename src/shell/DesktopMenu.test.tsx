import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DesktopMenu from './DesktopMenu'

const items = [
  { label: 'Clean Up', onSelect: vi.fn() },
  { label: 'About This Portfolio', onSelect: vi.fn() },
]

test('choosing an item fires its action and closes the menu', async () => {
  const onClose = vi.fn()
  render(<DesktopMenu x={10} y={10} items={items} onClose={onClose} />)
  await userEvent.click(screen.getByRole('menuitem', { name: 'Clean Up' }))
  expect(items[0].onSelect).toHaveBeenCalledOnce()
  expect(onClose).toHaveBeenCalledOnce()
})

test('Escape closes without choosing anything', async () => {
  const onClose = vi.fn()
  render(<DesktopMenu x={10} y={10} items={items} onClose={onClose} />)
  await userEvent.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalledOnce()
})

test('a click outside the menu closes it', async () => {
  const onClose = vi.fn()
  render(
    <div>
      <button>elsewhere</button>
      <DesktopMenu x={10} y={10} items={items} onClose={onClose} />
    </div>,
  )
  await userEvent.click(screen.getByRole('button', { name: 'elsewhere' }))
  expect(onClose).toHaveBeenCalled()
})

test('ArrowDown walks the items', async () => {
  render(<DesktopMenu x={10} y={10} items={items} onClose={vi.fn()} />)
  expect(screen.getByRole('menuitem', { name: 'Clean Up' })).toHaveFocus()
  await userEvent.keyboard('{ArrowDown}')
  expect(screen.getByRole('menuitem', { name: 'About This Portfolio' })).toHaveFocus()
})
