import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, it, expect } from 'vitest'
import { useDesktopPattern, readInitialPattern } from './useDesktopPattern'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-pattern')
})

describe('readInitialPattern', () => {
  it('defaults to 50 with nothing stored', () => {
    expect(readInitialPattern()).toBe('50')
  })
  it('honours a valid stored value', () => {
    localStorage.setItem('desktopPattern', '75')
    expect(readInitialPattern()).toBe('75')
  })
  it('ignores an out-of-range stored value', () => {
    localStorage.setItem('desktopPattern', '999')
    expect(readInitialPattern()).toBe('50')
  })
})

describe('useDesktopPattern', () => {
  it('setPattern reflects on <html data-pattern> and persists', () => {
    const { result } = renderHook(() => useDesktopPattern())
    act(() => result.current.setPattern('25'))
    expect(document.documentElement.getAttribute('data-pattern')).toBe('25')
    expect(localStorage.getItem('desktopPattern')).toBe('25')
  })
  it('the default 50 clears the attribute rather than setting it', () => {
    document.documentElement.setAttribute('data-pattern', '75')
    const { result } = renderHook(() => useDesktopPattern())
    act(() => result.current.setPattern('50'))
    expect(document.documentElement.hasAttribute('data-pattern')).toBe(false)
    expect(localStorage.getItem('desktopPattern')).toBe('50')
  })
})
