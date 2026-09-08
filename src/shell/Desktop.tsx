import {
  useReducer,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { windowsReducer, initialDesktop, frontWindow, type WindowId } from './windows'
import { defaultGrid, clampIcon, isValidLayout, type IconPos } from './iconLayout'
import Window from './Window'
import ZoomRect from './ZoomRectLayer'
import MenuBar from './MenuBar'
import DesktopIcons from './DesktopIcons'
import { useWindowKeys } from './useWindowKeys'
import { nextWindow } from './windowSwitch'
import { useKonami } from './useKonami'
import { useSound } from './useSound'
import { useTheme } from './useTheme'
import { useDesktopPattern } from './useDesktopPattern'
import ResumeWindow from '../windows/ResumeWindow'
import ReadMeWindow from '../windows/ReadMeWindow'
import TerminalWindow from '../windows/TerminalWindow'
import ProjectsWindow from '../windows/ProjectsWindow'
import AboutDialog from '../windows/AboutDialog'
import PuzzleWindow from '../windows/PuzzleWindow'
import AppearanceWindow from '../windows/AppearanceWindow'
import GetInfoWindow from '../windows/GetInfoWindow'
import ShutDown from './ShutDown'
import Trash from './Trash'
import type { MenuBarActions } from './MenuBar'
import type { DesktopBridge } from '../terminal/types'
import styles from './Desktop.module.css'

const TITLES: Record<WindowId, string> = {
  resume: 'Résumé',
  readme: 'Read Me',
  terminal: 'Terminal',
  projects: 'Projects',
  puzzle: 'Puzzle',
  about: 'About This Portfolio',
  appearance: 'Appearance',
  getinfo: 'Info',
  writeup: 'Project Notes',
}

function focusIcon(id: WindowId) {
  document.querySelector<HTMLElement>(`[data-window="${id}"]`)?.focus()
}

function menubarH() {
  return (
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--menubar-h'), 10) || 22
  )
}

function iconViewport() {
  return { w: window.innerWidth, h: window.innerHeight - menubarH() }
}

/** Size of the .desktop box (viewport minus the menu bar), for zoom-to-fill. */
function desktopSize() {
  const el = document.querySelector('.desktop') as HTMLElement | null
  return el ? { w: el.clientWidth, h: el.clientHeight } : iconViewport()
}

export default function Desktop() {
  const [state, dispatch] = useReducer(windowsReducer, initialDesktop, (s) => ({
    ...s,
    windows: {
      ...s.windows,
      resume: { ...s.windows.resume, open: true, z: 1 },
      readme: { ...s.windows.readme, open: true, z: 2 },
    },
    nextZ: 3,
  }))
  const [zoom, setZoom] = useState<{ id: WindowId; from: { x: number; y: number } } | null>(null)
  const [justOpened, setJustOpened] = useState<WindowId | null>(null)

  const open = (id: WindowId, from: { x: number; y: number }) => {
    if (state.windows[id].open) {
      dispatch({ type: 'focus', id })
      return
    }
    setZoom({ id, from })
  }
  const commitOpen = () => {
    if (!zoom) return
    dispatch({ type: 'open', id: zoom.id, from: zoom.from })
    setJustOpened(zoom.id)
    setZoom(null)
  }

  const close = useCallback((id: WindowId) => {
    dispatch({ type: 'close', id })
    focusIcon(id)
  }, [])

  const sound = useSound()
  const { theme, setTheme } = useTheme()
  const { pattern, setPattern } = useDesktopPattern()
  const [infoSubject, setInfoSubject] = useState<WindowId>('resume')

  const [stackTarget, setStackTarget] = useState<{ slug: string; nonce: number } | null>(null)
  const targetNonce = useRef(0)

  const jumpToStack = useCallback((slug: string) => {
    dispatch({ type: 'open', id: 'projects' })
    setStackTarget({ slug, nonce: ++targetNonce.current })
  }, [])

  // Deep link: /?open=projects[&stack=<slug>] opens the deck on that stack.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('open') !== 'projects') return
    dispatch({ type: 'open', id: 'projects' })
    const s = p.get('stack')
    if (s) setStackTarget({ slug: s, nonce: ++targetNonce.current })
  }, [])

  const bridge = useMemo<DesktopBridge>(
    () => ({
      // dispatch is stable (useReducer); the reducer's 'open' also raises z, so
      // this opens-or-focuses in one action.
      open: (id) => dispatch({ type: 'open', id }),
      close: (id) => close(id),
      beep: () => sound.beep(),
      openStack: (slug) => jumpToStack(slug),
    }),
    [close, sound, jumpToStack],
  )

  const content: Partial<Record<WindowId, ReactNode>> = {
    resume: <ResumeWindow />,
    readme: <ReadMeWindow />,
    terminal: <TerminalWindow bridge={bridge} />,
    projects: <ProjectsWindow target={stackTarget} />,
    about: <AboutDialog />,
    puzzle: <PuzzleWindow />,
    appearance: (
      <AppearanceWindow
        theme={theme}
        setTheme={setTheme}
        pattern={pattern}
        setPattern={setPattern}
      />
    ),
    getinfo: <GetInfoWindow subject={infoSubject} />,
  }

  const front = frontWindow(state)
  const cycleWindow = useCallback(
    (dir: 1 | -1) => {
      const id = nextWindow(state, dir)
      if (id) dispatch({ type: 'focus', id })
    },
    [state],
  )
  useWindowKeys(front, close, cycleWindow)

  const [shutdown, setShutdown] = useState(false)

  const [isFullScreen, setFullScreen] = useState(false)
  useEffect(() => {
    const h = () => setFullScreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])
  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
      return
    }
    // Fullscreen #root — it holds both the menu bar and the desktop, so
    // Exit Full Screen stays reachable.
    document.getElementById('root')?.requestFullscreen?.().catch(() => {})
  }

  const [flash, setFlash] = useState(false)
  useKonami(() => {
    sound.beep()
    setFlash(true)
    setTimeout(() => setFlash(false), 1200)
  })

  const restart = useCallback(() => {
    try {
      sessionStorage.removeItem('booted')
    } catch {
      /* ignore */
    }
    window.location.reload()
  }, [])

  const [outlineDrag, setOutlineDrag] = useState(() => {
    try {
      return localStorage.getItem('outlineDrag') !== '0'
    } catch {
      return true
    }
  })
  const toggleOutlineDrag = useCallback(() => {
    setOutlineDrag((v) => {
      const next = !v
      try {
        localStorage.setItem('outlineDrag', next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  // Desktop icon positions. Session-only: dragged icons stay put while the tab
  // lives, but a brand-new visit (or Special ▸ Clean Up) gets the default grid.
  const [iconPos, setIconPos] = useState<Record<string, IconPos>>(() => {
    const fresh = () => defaultGrid(typeof window !== 'undefined' ? window.innerWidth : 1024)
    try {
      const raw = sessionStorage.getItem('iconPos')
      if (!raw) return fresh()
      const parsed: unknown = JSON.parse(raw)
      if (!isValidLayout(parsed)) return fresh()
      const vp = iconViewport()
      const clamped: Record<string, IconPos> = {}
      for (const [k, p] of Object.entries(parsed)) clamped[k] = clampIcon(p, vp)
      return clamped
    } catch {
      return fresh()
    }
  })
  const dragScratch = useRef<Record<string, IconPos> | null>(null)
  const persistIcons = (next: Record<string, IconPos>) => {
    setIconPos(next)
    try {
      sessionStorage.setItem('iconPos', JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }
  const onMoveIcon = (id: WindowId, dx: number, dy: number, commit: boolean) => {
    if (commit) {
      if (dragScratch.current) persistIcons(dragScratch.current)
      dragScratch.current = null
      return
    }
    const base = dragScratch.current ?? iconPos
    const next = {
      ...base,
      [id]: clampIcon({ x: base[id].x + dx, y: base[id].y + dy }, iconViewport()),
    }
    dragScratch.current = next
    setIconPos(next)
  }
  const cleanUpIcons = () => {
    dragScratch.current = null
    try {
      sessionStorage.removeItem('iconPos')
    } catch {
      /* ignore */
    }
    setIconPos(defaultGrid(window.innerWidth))
  }

  const menuActions: MenuBarActions = {
    openWindow: (id) => dispatch({ type: 'open', id }),
    cleanUpIcons,
    closeFront: () => front && close(front),
    zoomFront: () => front && dispatch({ type: 'zoom', id: front, desktop: desktopSize() }),
    getInfoFront: () => {
      if (!front) return
      setInfoSubject(front)
      dispatch({ type: 'open', id: 'getinfo' })
    },
    hasFront: front !== null,
    print: () => window.print(),
    selectAllInFront: () => {
      if (!front) return
      const el = document.getElementById(`win-${front}`)
      if (!el) return
      const sel = window.getSelection()
      sel?.removeAllRanges()
      const range = document.createRange()
      range.selectNodeContents(el)
      sel?.addRange(range)
    },
    restart,
    shutDown: () => setShutdown(true),
    outlineDrag,
    toggleOutlineDrag,
    toggleFullScreen,
    isFullScreen,
    frontId: front,
    focusWindow: (id) => dispatch({ type: 'focus', id }),
    theme,
    setTheme,
    openWindowsList: (Object.keys(TITLES) as WindowId[])
      .filter((id) => state.windows[id].open)
      .sort((a, b) => state.windows[b].z - state.windows[a].z)
      .map((id) => ({ id, title: TITLES[id] })),
  }

  // The dragged window's committed top-left comes straight from onDragEnd, so the
  // Trash hit test works for both live and outline drag without reading a
  // mid-flight DOM rect.
  const maybeTrash = (id: WindowId, x: number, y: number) => {
    const trashEl = document.querySelector<HTMLElement>('[data-trash]')
    if (!trashEl) return
    const t = trashEl.getBoundingClientRect()
    const w = state.windows[id].w
    const barTop = y + menubarH()
    const bar = { left: x, right: x + w, top: barTop, bottom: barTop + 22 }
    const overlap =
      bar.left < t.right && bar.right > t.left && bar.top < t.bottom && bar.bottom > t.top
    if (!overlap) return
    sound.beep()
    close(id)
  }

  const openWindows = (Object.keys(content) as WindowId[]).filter((id) => state.windows[id].open)

  return (
    <div className={`${styles.desktop} desktop`}>
      {flash && <div className={styles.flashOverlay} aria-hidden />}
      {(theme === 'crtAmber' || theme === 'crtGreen') && (
        <div className={styles.crt} aria-hidden />
      )}
      <MenuBar {...menuActions} />
      <DesktopIcons onOpen={open} positions={iconPos} onMoveIcon={onMoveIcon} />
      <Trash />
      {zoom && (
        <ZoomRect
          from={zoom.from}
          to={{
            x: state.windows[zoom.id].x,
            y: state.windows[zoom.id].y,
            w: state.windows[zoom.id].w,
            h: state.windows[zoom.id].h,
          }}
          onDone={commitOpen}
        />
      )}
      {openWindows.map((id) => (
        <Window
          key={id}
          state={state.windows[id]}
          title={TITLES[id]}
          autoFocus={justOpened === id}
          onFocus={() => dispatch({ type: 'focus', id })}
          onClose={() => close(id)}
          onMove={(x, y) => dispatch({ type: 'move', id, x, y })}
          onResize={(w, h) => dispatch({ type: 'resize', id, w, h })}
          onToggleShade={() => dispatch({ type: 'toggleShade', id })}
          onZoom={() => dispatch({ type: 'zoom', id, desktop: desktopSize() })}
          onDragEnd={(x, y) => maybeTrash(id, x, y)}
          outlineDrag={outlineDrag}
        >
          {content[id]}
        </Window>
      ))}
      {shutdown && <ShutDown onStartup={restart} />}
    </div>
  )
}
