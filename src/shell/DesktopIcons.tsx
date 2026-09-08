import styles from './Desktop.module.css'
import type { WindowId } from './windows'
import IconGlyph, { type GlyphKind } from './IconGlyph'

const ICONS: { id: Extract<WindowId, GlyphKind>; label: string }[] = [
  { id: 'resume', label: 'Résumé' },
  { id: 'projects', label: 'Projects' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'readme', label: 'Read Me' },
]

export default function DesktopIcons({
  onOpen,
}: {
  onOpen: (id: WindowId, from: { x: number; y: number }) => void
}) {
  return (
    <div className={styles.icons}>
      {ICONS.map((ic) => (
        <button
          key={ic.id}
          data-window={ic.id}
          className={styles.icon}
          onDoubleClick={(e) => onOpen(ic.id, { x: e.clientX, y: e.clientY })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              const r = (e.target as HTMLElement).getBoundingClientRect()
              onOpen(ic.id, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
            }
          }}
        >
          <span className={styles.glyph}>
            <IconGlyph kind={ic.id} />
          </span>
          <span className={styles.iconLabel}>{ic.label}</span>
        </button>
      ))}
    </div>
  )
}
