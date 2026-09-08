import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AppearanceWindow from './AppearanceWindow'
import { THEMES } from '../shell/useTheme'

const base = {
  theme: 'system7',
  setTheme: vi.fn(),
  pattern: '50',
  setPattern: vi.fn(),
}

describe('AppearanceWindow', () => {
  it('renders a radio per theme with the active one checked', () => {
    render(<AppearanceWindow {...base} />)
    for (const t of THEMES) screen.getByRole('radio', { name: t.label })
    expect(screen.getByRole('radio', { name: 'System 7' })).toBeChecked()
  })

  it('selecting a theme calls setTheme with its id', () => {
    const setTheme = vi.fn()
    render(<AppearanceWindow {...base} setTheme={setTheme} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('selecting a desktop pattern calls setPattern', () => {
    const setPattern = vi.fn()
    render(<AppearanceWindow {...base} setPattern={setPattern} />)
    fireEvent.click(screen.getByRole('radio', { name: /Dense 75%/ }))
    expect(setPattern).toHaveBeenCalledWith('75')
  })
})
