import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, it, expect } from 'vitest'
import { useTheme, THEMES, resolveInitialTheme } from './useTheme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
})

describe('THEMES registry', () => {
  it('has unique ids and System 7 first', () => {
    expect(THEMES[0].id).toBe('system7')
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length)
    for (const t of THEMES) {
      expect(t.className).toBe('theme-' + t.id.replace(/([A-Z])/g, '-$1').toLowerCase())
    }
  })
})

describe('resolveInitialTheme', () => {
  it('prefers a stored value', () => {
    localStorage.setItem('theme', 'theme-dark')
    expect(resolveInitialTheme()).toBe('dark')
  })
  it('ignores a stored value that maps to no theme', () => {
    localStorage.setItem('theme', 'theme-nonsense')
    expect(resolveInitialTheme()).toBe('system7')
  })
  it('defaults to System 7 (never auto-switches on OS dark mode)', () => {
    expect(resolveInitialTheme()).toBe('system7')
  })
})

describe('useTheme', () => {
  it('setTheme persists the class name and swaps the <html> class', () => {
    document.documentElement.classList.add('theme-dark')
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('system6'))
    expect(document.documentElement.classList.contains('theme-system6')).toBe(true)
    expect(document.documentElement.classList.contains('theme-dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('theme-system6')
  })
  it('setTheme leaves unrelated <html> classes intact', () => {
    document.documentElement.classList.add('js-ready')
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    expect(document.documentElement.classList.contains('js-ready')).toBe(true)
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
  })
})
