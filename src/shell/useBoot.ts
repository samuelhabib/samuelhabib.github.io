import { useCallback, useEffect, useState } from 'react'

const reduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useBoot() {
  const done = () =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('booted') === '1'
  const [booting, setBooting] = useState(() => !done() && !reduce())

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem('booted', '1')
    } catch {
      /* ignore */
    }
    setBooting(false)
  }, [])

  useEffect(() => {
    if (!booting) return
    const id = setTimeout(finish, 1500)
    return () => clearTimeout(id)
  }, [booting, finish])

  return { booting, skip: finish }
}
