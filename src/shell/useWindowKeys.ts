import { useEffect } from 'react'
import type { WindowId } from './windows'

/**
 * Global keys for window management:
 *  - Escape closes the front window, except when it originates inside the
 *    Terminal, which owns Escape for its input.
 *  - ⌘` cycles the front window forward, ⇧⌘` cycles back.
 */
export function useWindowKeys(
  front: WindowId | null,
  onClose: (id: WindowId) => void,
  onCycle: (dir: 1 | -1) => void,
) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '`' && e.metaKey) {
        e.preventDefault()
        onCycle(e.shiftKey ? -1 : 1)
        return
      }
      if (e.key !== 'Escape' || !front) return
      const target = e.target as HTMLElement | null
      if (target?.closest?.('[data-terminal]')) return
      onClose(front)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [front, onClose, onCycle])
}
