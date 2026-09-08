import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenuBar, { type MenuBarActions } from './MenuBar'
import { SoundProvider } from './useSound'

function mount(over: Partial<MenuBarActions> = {}) {
  const actions: MenuBarActions = {
    openWindow: vi.fn(),
    closeFront: vi.fn(),
    hasFront: true,
    print: vi.fn(),
    selectAllInFront: vi.fn(),
    restart: vi.fn(),
    shutDown: vi.fn(),
    ...over,
  }
  render(
    <SoundProvider>
      <MenuBar {...actions} />
    </SoundProvider>,
  )
  return actions
}

test('File ▸ Terminal opens that window and closes the menu', async () => {
  const a = mount()
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Terminal' }))
  expect(a.openWindow).toHaveBeenCalledWith('terminal')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

test('File ▸ Close is disabled when there is no front window', async () => {
  mount({ hasFront: false })
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  expect(screen.getByRole('menuitem', { name: 'Close' })).toHaveAttribute('aria-disabled', 'true')
})

test('Edit ▸ Undo is disabled; Select All works', async () => {
  const a = mount()
  await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
  expect(screen.getByRole('menuitem', { name: 'Undo' })).toHaveAttribute('aria-disabled', 'true')
  await userEvent.click(screen.getByRole('menuitem', { name: 'Select All' }))
  expect(a.selectAllInFront).toHaveBeenCalledOnce()
})

test('Special ▸ Shut Down calls shutDown', async () => {
  const a = mount()
  await userEvent.click(screen.getByRole('button', { name: 'Special' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Shut Down' }))
  expect(a.shutDown).toHaveBeenCalledOnce()
})

test('only one menu is open at a time', async () => {
  mount()
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
  expect(screen.getByRole('menu', { name: 'Edit' })).toBeInTheDocument()
  expect(screen.queryByRole('menu', { name: 'File' })).not.toBeInTheDocument()
})

test('a pointerdown outside the bar closes the open menu', async () => {
  mount()
  await userEvent.click(screen.getByRole('button', { name: 'File' }))
  await userEvent.click(document.body)
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

test('the Sound toggle still flips', async () => {
  mount()
  const btn = screen.getByRole('button', { name: /sound: on/i })
  await userEvent.click(btn)
  expect(screen.getByRole('button', { name: /sound: off/i })).toBeInTheDocument()
})
