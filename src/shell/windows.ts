export type WindowId =
  | 'resume'
  | 'readme'
  | 'terminal'
  | 'projects'
  | 'puzzle'
  | 'about'
  | 'appearance'
  | 'getinfo'
  | 'writeup'
  | 'skills'
  | 'calculator'
  | 'scrapbook'

export interface WindowState {
  id: WindowId
  open: boolean
  z: number
  x: number
  y: number
  w: number
  h: number
  shaded: boolean
  minZoom: { x: number; y: number } | null
  /** Pre-zoom rect while the window is filling the desktop; null when normal. */
  maxed: { x: number; y: number; w: number; h: number } | null
}

export interface DesktopState {
  windows: Record<WindowId, WindowState>
  nextZ: number
}

const DEFAULTS: Record<WindowId, Pick<WindowState, 'x' | 'y' | 'w' | 'h'>> = {
  resume: { x: 64, y: 40, w: 560, h: 600 },
  readme: { x: 380, y: 392, w: 372, h: 232 },
  terminal: { x: 220, y: 120, w: 620, h: 380 },
  projects: { x: 160, y: 60, w: 700, h: 520 },
  puzzle: { x: 300, y: 140, w: 240, h: 280 },
  about: { x: 260, y: 160, w: 360, h: 220 },
  appearance: { x: 240, y: 120, w: 320, h: 340 },
  getinfo: { x: 300, y: 180, w: 300, h: 300 },
  writeup: { x: 200, y: 90, w: 540, h: 520 },
  skills: { x: 300, y: 100, w: 420, h: 320 },
  calculator: { x: 320, y: 150, w: 240, h: 300 },
  scrapbook: { x: 260, y: 120, w: 460, h: 420 },
}

function make(id: WindowId): WindowState {
  return { id, open: false, z: 0, shaded: false, minZoom: null, maxed: null, ...DEFAULTS[id] }
}

export const initialDesktop: DesktopState = {
  windows: {
    resume: make('resume'),
    readme: make('readme'),
    terminal: make('terminal'),
    projects: make('projects'),
    puzzle: make('puzzle'),
    about: make('about'),
    appearance: make('appearance'),
    getinfo: make('getinfo'),
    writeup: make('writeup'),
    skills: make('skills'),
    calculator: make('calculator'),
    scrapbook: make('scrapbook'),
  },
  nextZ: 1,
}

export type WindowAction =
  | { type: 'open'; id: WindowId; from?: { x: number; y: number } }
  | { type: 'close'; id: WindowId }
  | { type: 'focus'; id: WindowId }
  | { type: 'move'; id: WindowId; x: number; y: number }
  | { type: 'resize'; id: WindowId; w: number; h: number }
  | { type: 'toggleShade'; id: WindowId }
  | { type: 'zoom'; id: WindowId; desktop: { w: number; h: number } }
  | { type: 'home' }

export function windowsReducer(state: DesktopState, action: WindowAction): DesktopState {
  if (action.type === 'home') {
    // Back to the first-run arrangement: every window reset to DEFAULTS and
    // closed, then Résumé and Read Me reopened on their cascade.
    return {
      ...state,
      windows: {
        ...initialDesktop.windows,
        resume: { ...initialDesktop.windows.resume, open: true, z: 1 },
        readme: { ...initialDesktop.windows.readme, open: true, z: 2 },
      },
      nextZ: 3,
    }
  }
  const w = state.windows[action.id]
  switch (action.type) {
    case 'open':
      return {
        ...state,
        nextZ: state.nextZ + 1,
        windows: {
          ...state.windows,
          [action.id]: { ...w, open: true, z: state.nextZ, minZoom: action.from ?? null },
        },
      }
    case 'close':
      return { ...state, windows: { ...state.windows, [action.id]: { ...w, open: false } } }
    case 'focus':
      if (!w.open) return state
      return {
        ...state,
        nextZ: state.nextZ + 1,
        windows: { ...state.windows, [action.id]: { ...w, z: state.nextZ } },
      }
    case 'move':
      return { ...state, windows: { ...state.windows, [action.id]: { ...w, x: action.x, y: action.y } } }
    case 'resize':
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...w, w: Math.max(240, action.w), h: Math.max(120, action.h) },
        },
      }
    case 'toggleShade':
      return { ...state, windows: { ...state.windows, [action.id]: { ...w, shaded: !w.shaded } } }
    case 'zoom': {
      if (w.maxed) {
        const { x, y, w: ww, h } = w.maxed
        return {
          ...state,
          windows: { ...state.windows, [action.id]: { ...w, x, y, w: ww, h, maxed: null } },
        }
      }
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...w,
            maxed: { x: w.x, y: w.y, w: w.w, h: w.h },
            x: 0,
            y: 0,
            w: action.desktop.w,
            h: action.desktop.h,
          },
        },
      }
    }
  }
}

/**
 * Keep a dragged window reachable: its title bar can't leave the desktop, and
 * at least KEEP px of the window stays on screen on every side.
 */
export function clampWindow(
  x: number,
  y: number,
  w: number,
  desk: { w: number; h: number },
): { x: number; y: number } {
  const KEEP = 72
  const TITLEBAR = 22
  return {
    x: Math.max(KEEP - w, Math.min(x, desk.w - KEEP)),
    y: Math.max(0, Math.min(y, desk.h - TITLEBAR)),
  }
}

export function frontWindow(state: DesktopState): WindowId | null {
  const open = Object.values(state.windows).filter((w) => w.open)
  if (!open.length) return null
  return open.reduce((a, b) => (b.z > a.z ? b : a)).id
}
