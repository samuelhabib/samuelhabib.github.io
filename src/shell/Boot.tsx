import { useEffect } from 'react'
import styles from './Boot.module.css'

export default function Boot({ onSkip }: { onSkip(): void }) {
  useEffect(() => {
    const h = () => onSkip()
    window.addEventListener('keydown', h)
    window.addEventListener('pointerdown', h)
    return () => {
      window.removeEventListener('keydown', h)
      window.removeEventListener('pointerdown', h)
    }
  }, [onSkip])
  return (
    <div className={styles.boot} aria-hidden>
      <div className={styles.mac} />
      <p className={styles.welcome}>Welcome to Macintosh</p>
      <div className={styles.bar}>
        <span />
      </div>
    </div>
  )
}
