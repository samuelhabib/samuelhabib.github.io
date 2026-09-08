import { useEffect, useRef } from 'react'

const SEQ = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export function useKonami(onTrigger: () => void) {
  const pos = useRef(0)
  const cb = useRef(onTrigger)
  cb.current = onTrigger

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === SEQ[pos.current]) {
        pos.current += 1
        if (pos.current === SEQ.length) {
          pos.current = 0
          cb.current()
        }
      } else {
        pos.current = key === SEQ[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
