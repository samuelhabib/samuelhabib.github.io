import { render, screen, within } from '@testing-library/react'
import DesktopIcons from './DesktopIcons'
import { defaultGrid } from './iconLayout'

const pos = defaultGrid(1024)
const noop = () => {}

test('each desktop icon renders a drawn glyph', () => {
  render(<DesktopIcons onOpen={noop} positions={pos} onMoveIcon={noop} />)
  for (const name of ['Résumé', 'Projects', 'Terminal', 'Read Me']) {
    const btn = screen.getByRole('button', { name })
    expect(within(btn).getByRole('img', { hidden: true }).tagName.toLowerCase()).toBe('svg')
  }
})

test('icons are absolutely positioned from the positions prop', () => {
  render(
    <DesktopIcons
      onOpen={noop}
      positions={{ ...pos, resume: { x: 10, y: 20 } }}
      onMoveIcon={noop}
    />,
  )
  const btn = screen.getByRole('button', { name: 'Résumé' })
  expect(btn).toHaveClass('desktop-icon')
  expect(btn.style.position).toBe('absolute')
  expect(btn.style.left).toBe('10px')
  expect(btn.style.top).toBe('20px')
})
