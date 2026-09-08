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

      <div className={styles.receipts}>
        <p className={styles.line}>Made by pairing with Claude Code</p>
        <p className={styles.line}>
          {__COMMIT_COUNT__} commits · {__TEST_COUNT__} tests · specs in the repo
        </p>
        <p className={styles.line}>
          <a className={styles.repoLink} href={__REPO_URL__}>
            View source ↗
          </a>
        </p>
        <p className={styles.asOf}>counts as of {__BUILD_DATE__}</p>
      </div>
    </div>
  )
}
