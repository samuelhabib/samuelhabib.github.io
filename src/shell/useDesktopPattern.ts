import { useCallback, useState } from 'react'

export type Pattern = '0' | '25' | '50' | '75'
export const PATTERNS: Pattern[] = ['0', '25', '50', '75']

/** The stored pattern, or the standard 50% stipple. */
export function readInitialPattern(): Pattern {
  try {
    const p = localStorage.getItem('desktopPattern')
    if (p && (PATTERNS as string[]).includes(p)) return p as Pattern
  } catch {
    /* ignore */
  }
  return '50'
}

export function useDesktopPattern() {
  const [pattern, setPatternState] = useState<Pattern>(readInitialPattern)

  const setPattern = useCallback((p: Pattern) => {
    setPatternState(p)
    // 50 is the built-in default (Desktop.module.css); no attribute needed.
    if (p === '50') document.documentElement.removeAttribute('data-pattern')
    else document.documentElement.setAttribute('data-pattern', p)
    try {
      localStorage.setItem('desktopPattern', p)
    } catch {
      /* ignore */
    }
  }, [])

  return { pattern, setPattern, PATTERNS }
}
