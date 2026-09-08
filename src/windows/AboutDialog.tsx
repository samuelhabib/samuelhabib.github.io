import styles from './AboutDialog.module.css'

const SEGMENTS = [
  { label: 'System', dither: 'dither-75' },
  { label: 'Side projects', dither: 'dither-50' },
  { label: 'Coffee', dither: 'dither-25' },
  { label: 'Sleep', dither: '' },
]

export default function AboutDialog() {
  return (
    <div className={styles.about}>
      <p className={styles.title}>Portfolio</p>
      <p className={styles.line}>System 7, remastered — v2</p>
      <p className={styles.line}>Built {__BUILD_DATE__}</p>
      <p className={styles.line}>Samuel Habib</p>

      <p className={styles.memLabel}>Total Memory</p>
      <div className={styles.bar} aria-hidden>
        {SEGMENTS.map((s) => (
          <div key={s.label} className={`${styles.seg} ${s.dither}`.trim()} />
        ))}
      </div>
      <ul className={styles.legend}>
        {SEGMENTS.map((s) => (
          <li key={s.label}>{s.label}</li>
        ))}
      </ul>
    </div>
  )
}
