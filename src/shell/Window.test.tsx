import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Window from './Window'
import { initialDesktop } from './windows'

const base = { ...initialDesktop.windows.resume, open: true, z: 1 }

test('renders title and closes via the close box', async () => {
  const onClose = vi.fn()
  render(
    <Window
      state={base}
      title="Résumé"
      onFocus={() => {}}
      onClose={onClose}
      onMove={() => {}}
      onResize={() => {}}
      onToggleShade={() => {}}
    >
      <p>body</p>
    </Window>,
  )
  expect(screen.getByRole('dialog', { name: 'Résumé' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Close Résumé' }))
  expect(onClose).toHaveBeenCalledOnce()
})

test('double-clicking the title bar toggles shade', async () => {
  const onToggleShade = vi.fn()
  render(
    <Window
      state={base}
      title="Résumé"
      onFocus={() => {}}
      onClose={() => {}}
      onMove={() => {}}
      onResize={() => {}}
      onToggleShade={onToggleShade}
    >
      <p>body</p>
    </Window>,
  )
  await userEvent.dblClick(screen.getByTestId('titlebar'))
  expect(onToggleShade).toHaveBeenCalledOnce()
})

test('shaded window hides its body', () => {
  render(
    <Window
      state={{ ...base, shaded: true }}
      title="Résumé"
      onFocus={() => {}}
      onClose={() => {}}
      onMove={() => {}}
      onResize={() => {}}
      onToggleShade={() => {}}
    >
      <p>body text</p>
    </Window>,
  )
  expect(screen.queryByText('body text')).not.toBeVisible()
})
