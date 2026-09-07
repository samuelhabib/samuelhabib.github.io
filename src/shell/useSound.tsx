import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ChimeEngine } from './sound'

interface SoundApi {
  muted: boolean
  toggle(): void
  chime(): void
  beep(): void
}

const Ctx = createContext<SoundApi | null>(null)

export function SoundProvider({ children }: { children: ReactNode }) {
  const engine = useMemo(() => new ChimeEngine(), [])
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem('muted') === '1'
    } catch {
      return false
    }
  })
  engine.setMuted(muted)

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m
      try {
        localStorage.setItem('muted', next ? '1' : '0')
      } catch {
        /* ignore */
      }
      engine.setMuted(next)
      return next
    })
  }, [engine])

  const api = useMemo<SoundApi>(
    () => ({ muted, toggle, chime: () => engine.playChime(), beep: () => engine.beep() }),
    [muted, toggle, engine],
  )
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useSound(): SoundApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSound must be used within SoundProvider')
  return v
}
