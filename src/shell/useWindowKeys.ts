import { useEffect } from 'react'
import type { WindowId } from './windows'

/** Global keys for window management. Escape closes the front window. */
export function useWindowKeys(front: WindowId | null, onClose: (id: WindowId) => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && front) onClose(front)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [front, onClose])
}
