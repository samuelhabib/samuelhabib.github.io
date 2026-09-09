export interface IconPos {
  x: number
  y: number
}

/** Order matches DesktopIcons' ICONS list. */
// 'about' leads the column as the hard-disk volume ("Samuel Habib"), the way a
// real System 7 desktop always had a drive icon top-right.
export const ICON_IDS = ['about', 'resume', 'projects', 'terminal', 'readme', 'skills'] as const
export type IconId = (typeof ICON_IDS)[number]

const CELL_W = 76
const CELL_H = 52
const GAP = 14
const INSET = 12

/**
 * The default right-hand column, matching the pre-4C look. Coordinates are
 * relative to the `.desktop` box, which already starts at `--menubar-h`, so
 * `y = 0` is a legal top edge.
 */
export function defaultGrid(viewportW: number): Record<IconId, IconPos> {
  const x = Math.max(INSET, viewportW - INSET - CELL_W)
  const out = {} as Record<IconId, IconPos>
  ICON_IDS.forEach((id, i) => {
    out[id] = { x, y: INSET + i * (CELL_H + GAP) }
  })
  return out
}

/** Keep an icon's top-left inside the desktop box. */
export function clampIcon(p: IconPos, vp: { w: number; h: number }): IconPos {
  return {
    x: Math.min(Math.max(0, p.x), Math.max(0, vp.w - CELL_W)),
    y: Math.min(Math.max(0, p.y), Math.max(0, vp.h - CELL_H)),
  }
}

/** True when `raw` is a complete `{id: {x,y}}` map with finite numbers. */
export function isValidLayout(raw: unknown): raw is Record<IconId, IconPos> {
  if (!raw || typeof raw !== 'object') return false
  const m = raw as Record<string, unknown>
  return ICON_IDS.every((id) => {
    const p = m[id] as { x?: unknown; y?: unknown } | undefined
    return !!p && Number.isFinite(p.x) && Number.isFinite(p.y)
  })
}
