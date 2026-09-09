import { useEffect } from 'react'
import styles from './Boot.module.css'

// The row of "startup extension" icons that marched in along the bottom of a
// real Mac boot screen as each extension loaded. 16×16, 1-bit, currentColor.
const EXTENSIONS: { name: string; path: JSX.Element }[] = [
  {
    name: 'Disk',
    path: (
      <>
        <rect x="2" y="2" width="12" height="12" />
        <rect x="5.5" y="2" width="5" height="4" fill="currentColor" stroke="none" />
        <rect x="4.5" y="9" width="7" height="5" />
      </>
    ),
  },
  {
    name: 'Assist',
    path: (
      <path
        d="M8 1 L9.4 6.6 L15 8 L9.4 9.4 L8 15 L6.6 9.4 L1 8 L6.6 6.6 Z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
  {
    name: 'Branch',
    path: (
      <>
        <circle cx="4" cy="4" r="1.8" />
        <circle cx="4" cy="12" r="1.8" />
        <circle cx="12" cy="6" r="1.8" />
        <path d="M4 6v4M4 8h4c2 0 4-1 4-2" />
      </>
    ),
  },
  {
    name: 'Bolt',
    path: <path d="M9 1 L3 9 H7 L6 15 L13 6 H9 Z" fill="currentColor" stroke="none" />,
  },
  {
    name: 'Coffee',
    path: (
      <>
        <path d="M3 5h8v4a4 4 0 0 1-8 0Z" />
        <path d="M11 6h1.5a1.5 1.5 0 0 1 0 3H11" />
        <path d="M5 2v1.5M8 2v1.5" />
      </>
    ),
  },
]

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
      <div className={styles.tray} data-testid="boot-extensions">
        {EXTENSIONS.map((ext, i) => (
          <svg
            key={ext.name}
            className={styles.ext}
            style={{ animationDelay: `${i * 0.16}s` }}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            role="img"
            aria-label={ext.name}
          >
            {ext.path}
          </svg>
        ))}
      </div>
    </div>
  )
}
