import { useCallback, useState } from 'react'

export interface ThemeDef {
  id: string
  label: string
  className: string
}

export const THEMES: ThemeDef[] = [
  { id: 'system7', label: 'System 7', className: 'theme-system7' },
  { id: 'dark', label: 'Dark', className: 'theme-dark' },
  { id: 'system6', label: 'System 6', className: 'theme-system6' },
  { id: 'platinum', label: 'Platinum', className: 'theme-platinum' },
  { id: 'parchment', label: 'Parchment', className: 'theme-parchment' },
  { id: 'blueprint', label: 'Blueprint', className: 'theme-blueprint' },
  { id: 'crtAmber', label: 'CRT Amber', className: 'theme-crt-amber' },
  { id: 'crtGreen', label: 'CRT Green', className: 'theme-crt-green' },
]

const ALL_CLASSNAMES = THEMES.map((t) => t.className)
const byClass = (cn: string) => THEMES.find((t) => t.className === cn)?.id
const byId = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0]

/**
 * The theme to use before any user choice this session. A stored class name
 * wins; otherwise System 7, the decided default — we deliberately do NOT
 * auto-switch to Dark on `prefers-color-scheme: dark`.
 */
export function resolveInitialTheme(): string {
  try {
    const stored = localStorage.getItem('theme')
    if (stored && byClass(stored)) return byClass(stored)!
  } catch {
    /* ignore */
  }
  return 'system7'
}

/** Swap the theme class without disturbing other classes on <html>. */
export function applyThemeClass(className: string) {
  const el = document.documentElement
  el.classList.remove(...ALL_CLASSNAMES)
  el.classList.add(className)
}

export function useTheme() {
  const [theme, setThemeState] = useState(resolveInitialTheme)

  const setTheme = useCallback((id: string) => {
    const def = byId(id)
    setThemeState(def.id)
    applyThemeClass(def.className)
    try {
      localStorage.setItem('theme', def.className)
    } catch {
      /* ignore */
    }
  }, [])

  return { theme, setTheme, THEMES }
}
