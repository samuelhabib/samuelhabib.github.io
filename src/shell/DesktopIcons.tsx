import styles from './Desktop.module.css'
import type { WindowId } from './windows'
import IconGlyph, { type GlyphKind } from './IconGlyph'
import { useDrag } from './useDrag'
import type { IconPos } from './iconLayout'

const ICONS: { id: Extract<WindowId, GlyphKind>; label: string }[] = [
  { id: 'resume', label: 'Résumé' },
  { id: 'projects', label: 'Projects' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'readme', label: 'Read Me' },
]

type MoveIcon = (id: WindowId, dx: number, dy: number, commit: boolean) => void

function Icon({
  id,
  label,
  pos,
  onOpen,
  onMoveIcon,
}: {
  id: Extract<WindowId, GlyphKind>
  label: string
  pos: IconPos
  onOpen: (id: WindowId, from: { x: number; y: number }) => void
  onMoveIcon: MoveIcon
}) {
  const drag = useDrag(
    (dx, dy) => onMoveIcon(id, dx, dy, false),
    () => onMoveIcon(id, 0, 0, true),
    { threshold: 4 },
  )
  return (
    <button
      data-window={id}
      className={`${styles.icon} desktop-icon`}
      style={{ position: 'absolute', left: pos.x, top: pos.y }}
      onPointerDown={drag.onPointerDown}
      onDoubleClick={(e) => onOpen(id, { x: e.clientX, y: e.clientY })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          const r = (e.target as HTMLElement).getBoundingClientRect()
          onOpen(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
        }
      }}
    >
      <span className={styles.glyph}>
        <IconGlyph kind={id} />
      </span>
      <span className={styles.iconLabel}>{label}</span>
    </button>
  )
}

export default function DesktopIcons({
  onOpen,
  positions,
  onMoveIcon,
}: {
  onOpen: (id: WindowId, from: { x: number; y: number }) => void
  positions: Record<string, IconPos>
  onMoveIcon: MoveIcon
}) {
  return (
    <div className={styles.icons}>
      {ICONS.map((ic) => (
        <Icon
          key={ic.id}
          id={ic.id}
          label={ic.label}
          pos={positions[ic.id]}
          onOpen={onOpen}
          onMoveIcon={onMoveIcon}
        />
      ))}
    </div>
  )
}
