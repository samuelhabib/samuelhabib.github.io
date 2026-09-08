import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import Menu, { type MenuItemSpec } from './Menu'

function One({ items }: { items: MenuItemSpec[] }) {
  const [open, setOpen] = useState(false)
  return (
    <Menu
      label="File"
      title="File"
      items={items}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onCycle={() => {}}
    />
  )
}

test('click opens the menu and focuses the first enabled item', async () => {
  const pick = vi.fn()
  render(<One items={[{ label: 'Open', onSelect: pick }, { label: 'Close', onSelect: () => {} }]} />)
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  expect(screen.getByRole('menu', { name: 'File' })).toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus()
})

test('ArrowDown moves focus and Enter activates then closes', async () => {
  const pick = vi.fn()
  render(<One items={[{ label: 'Open', onSelect: () => {} }, { label: 'Close', onSelect: pick }]} />)
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.keyboard('{ArrowDown}{Enter}')
  expect(pick).toHaveBeenCalledOnce()
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'File' })).toHaveFocus()
})

test('disabled items are skipped by arrows and cannot be activated', async () => {
  const pick = vi.fn()
  render(
    <One
      items={[
        { label: 'Undo', disabled: true },
        { label: 'Select All', onSelect: pick },
      ]}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  expect(screen.getByRole('menuitem', { name: 'Select All' })).toHaveFocus()
  await userEvent.click(screen.getByRole('menuitem', { name: 'Undo' }))
  expect(pick).not.toHaveBeenCalled()
  expect(screen.getByRole('menuitem', { name: 'Undo' })).toHaveAttribute('aria-disabled', 'true')
})

test('Escape closes and returns focus to the trigger', async () => {
  render(<One items={[{ label: 'Open', onSelect: () => {} }]} />)
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'File' })).toHaveFocus()
})

test('a checked item is a menuitemcheckbox and toggles via onSelect', async () => {
  const pick = vi.fn()
  render(<One items={[{ label: 'Outline dragging', checked: true, onSelect: pick }]} />)
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  const item = screen.getByRole('menuitemcheckbox', { name: /outline dragging/i })
  expect(item).toHaveAttribute('aria-checked', 'true')
  await userEvent.click(item)
  expect(pick).toHaveBeenCalledOnce()
})

test('ArrowRight on an open menu calls onCycle(1)', async () => {
  const cycle = vi.fn()
  function Harness() {
    const [open, setOpen] = useState(true)
    return (
      <Menu
        label="File"
        title="File"
        items={[{ label: 'Open', onSelect: () => {} }]}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onCycle={cycle}
      />
    )
  }
  render(<Harness />)
  await userEvent.keyboard('{ArrowRight}')
  expect(cycle).toHaveBeenCalledWith(1)
})
