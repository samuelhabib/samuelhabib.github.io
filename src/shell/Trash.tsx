import styles from './Trash.module.css'

export default function Trash() {
  return (
    <button type="button" className={styles.trash} data-trash aria-label="Trash">
      <svg className={styles.glyph} viewBox="0 0 24 28" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6 H21" />
          <path d="M9 6 V3 H15 V6" />
          <path d="M5 6 L6 26 H18 L19 6" />
          <path d="M10 10 V22 M14 10 V22" />
        </g>
      </svg>
      <span className={styles.caption}>Trash</span>
    </button>
  )
}
