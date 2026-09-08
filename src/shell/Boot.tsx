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
      <div className={styles.mac}>
        <svg
          viewBox="0 0 44 54"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        >
          <rect x="2" y="2" width="40" height="50" rx="4" />
          <rect x="7" y="8" width="30" height="24" />
          <rect x="14" y="14" width="3.5" height="5" fill="currentColor" stroke="none" />
          <rect x="26.5" y="14" width="3.5" height="5" fill="currentColor" stroke="none" />
          <path d="M15 24 Q22 30 29 24" />
          <rect x="11" y="40" width="22" height="3" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <p className={styles.welcome}>Welcome to Macintosh</p>
      <div className={styles.bar}>
        <span />
      </div>
    </div>
  )
}
