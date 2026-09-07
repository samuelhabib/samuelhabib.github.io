import { useEffect, useState } from 'react'
import styles from './MenuBar.module.css'

// Plan 1: the menu bar is display-only. Interactive Apple/File/Edit/Special
// dropdowns land in a later plan, so nothing here takes focus or a menu role.
export default function MenuBar() {
  const [clock, setClock] = useState('')
  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className={styles.bar}>
      <span className={styles.apple} aria-hidden />
      <span className={styles.item}>File</span>
      <span className={styles.item}>Edit</span>
      <span className={styles.item}>View</span>
      <span className={styles.item}>Special</span>
      <span className={styles.clock}>{clock}</span>
    </div>
  )
}
