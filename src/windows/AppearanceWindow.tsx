import { THEMES } from '../shell/useTheme'
import type { Pattern } from '../shell/useDesktopPattern'
import styles from './AppearanceWindow.module.css'

const PATTERN_OPTIONS: { id: Pattern; label: string }[] = [
  { id: '0', label: 'None' },
  { id: '25', label: 'Light 25%' },
  { id: '50', label: 'Standard 50%' },
  { id: '75', label: 'Dense 75%' },
]

interface Props {
  theme: string
  setTheme: (id: string) => void
  pattern: string
  setPattern: (p: Pattern) => void
}

export default function AppearanceWindow({ theme, setTheme, pattern, setPattern }: Props) {
  return (
    <div className={styles.root}>
      <fieldset className={styles.group}>
        <legend>Theme</legend>
        {THEMES.map((t) => (
          <label key={t.id} className={styles.row}>
            <input
              type="radio"
              name="appearance-theme"
              value={t.id}
              checked={theme === t.id}
              onChange={() => setTheme(t.id)}
            />
            <span className={`${styles.swatch} ${t.className}`} aria-hidden />
            {t.label}
          </label>
        ))}
      </fieldset>
      <fieldset className={styles.group}>
        <legend>Desktop Pattern</legend>
        {PATTERN_OPTIONS.map((p) => (
          <label key={p.id} className={styles.row}>
            <input
              type="radio"
              name="appearance-pattern"
              value={p.id}
              checked={pattern === p.id}
              onChange={() => setPattern(p.id)}
            />
            <span className={`${styles.swatch} ${styles['p' + p.id]}`} aria-hidden />
            {p.label}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
