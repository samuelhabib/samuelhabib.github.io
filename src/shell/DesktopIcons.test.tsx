import { render, screen, within } from '@testing-library/react'
import DesktopIcons from './DesktopIcons'

test('each desktop icon renders a drawn glyph', () => {
  render(<DesktopIcons onOpen={() => {}} />)
  for (const name of ['Résumé', 'Projects', 'Terminal', 'Read Me']) {
    const btn = screen.getByRole('button', { name })
    expect(within(btn).getByRole('img', { hidden: true }).tagName.toLowerCase()).toBe('svg')
  }
})
