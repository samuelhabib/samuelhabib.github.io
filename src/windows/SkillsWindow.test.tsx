import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import SkillsWindow from './SkillsWindow'
import { resume } from '../content/resume'

describe('SkillsWindow', () => {
  it('lists every skill group as a listbox option, in file order', () => {
    render(<SkillsWindow />)
    const box = screen.getByRole('listbox', { name: /categor/i })
    const opts = within(box).getAllByRole('option')
    expect(opts.map((o) => o.textContent)).toEqual(resume.skills.map((g) => g.group))
  })

  it('selects the first group on mount and shows its items', () => {
    render(<SkillsWindow />)
    const first = resume.skills[0]
    expect(screen.getByRole('option', { name: first.group })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const detail = screen.getByRole('group', { name: first.group })
    for (const item of first.items) {
      expect(within(detail).getByText(item)).toBeInTheDocument()
    }
  })

  it('clicking a group selects it and swaps the detail pane', async () => {
    render(<SkillsWindow />)
    const target = resume.skills[resume.skills.length - 1]
    await userEvent.click(screen.getByRole('option', { name: target.group }))
    expect(screen.getByRole('option', { name: target.group })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const detail = screen.getByRole('group', { name: target.group })
    expect(within(detail).getByText(target.items[0])).toBeInTheDocument()
  })

  it('moves the selection with the arrow keys and carries DOM focus', async () => {
    render(<SkillsWindow />)
    const opts = screen.getAllByRole('option')
    opts[0].focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(opts[1]).toHaveAttribute('aria-selected', 'true')
    expect(opts[1]).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    expect(opts[0]).toHaveAttribute('aria-selected', 'true')
    expect(opts[0]).toHaveFocus()
  })

  it('End / Home jump to the last and first group', async () => {
    render(<SkillsWindow />)
    const opts = screen.getAllByRole('option')
    opts[0].focus()
    await userEvent.keyboard('{End}')
    expect(opts[opts.length - 1]).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Home}')
    expect(opts[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('is a roving-tabindex listbox — only the selected option is tabbable', () => {
    render(<SkillsWindow />)
    const opts = screen.getAllByRole('option')
    expect(opts[0]).toHaveAttribute('tabindex', '0')
    for (const o of opts.slice(1)) expect(o).toHaveAttribute('tabindex', '-1')
  })

  it('reports the item count for the selected group', () => {
    render(<SkillsWindow />)
    const n = resume.skills[0].items.length
    expect(screen.getByText(new RegExp(`\\b${n}\\b\\s+items`, 'i'))).toBeInTheDocument()
  })

  it('invents no proficiency data — no %, bars, stars or "expert/intermediate"', () => {
    const { container } = render(<SkillsWindow />)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/\d+\s*%/)
    expect(text).not.toMatch(/expert|intermediate|proficien|years? of/i)
    expect(container.querySelector('progress, meter')).toBeNull()
    expect(container.querySelector('[role="progressbar"]')).toBeNull()
  })
})
