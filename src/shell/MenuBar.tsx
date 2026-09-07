import { useEffect, useState } from 'react'
import { useSound } from './useSound'
import styles from './MenuBar.module.css'

// Plan 1: the menu bar is display-only apart from the Sound toggle. Interactive
// Apple/File/Edit/Special dropdowns land in a later plan.
export default function MenuBar() {
  const [clock, setClock] = useState('')
  const sound = useSound()
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
      <button className={styles.toggle} onClick={sound.toggle} aria-pressed={!sound.muted}>
        {sound.muted ? 'Sound: Off' : 'Sound: On'}
      </button>
      <span className={styles.clock}>{clock}</span>
    </div>
  )
}
