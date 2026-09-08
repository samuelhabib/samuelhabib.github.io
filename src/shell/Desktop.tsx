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
import Window from './Window'
import ZoomRect from './ZoomRectLayer'
import MenuBar from './MenuBar'
import DesktopIcons from './DesktopIcons'
import { useWindowKeys } from './useWindowKeys'
import { useSound } from './useSound'
import ResumeWindow from '../windows/ResumeWindow'
import ReadMeWindow from '../windows/ReadMeWindow'
import TerminalWindow from '../windows/TerminalWindow'
import ProjectsWindow from '../windows/ProjectsWindow'
import AboutDialog from '../windows/AboutDialog'
import PuzzleWindow from '../windows/PuzzleWindow'
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
}

function focusIcon(id: WindowId) {
  document.querySelector<HTMLElement>(`[data-window="${id}"]`)?.focus()
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
  }

  const front = frontWindow(state)
  useWindowKeys(front, close)

  const [shutdown, setShutdown] = useState(false)

  const restart = useCallback(() => {
    try {
      sessionStorage.removeItem('booted')
    } catch {
      /* ignore */
    }
    window.location.reload()
  }, [])

  const menuActions: MenuBarActions = {
    openWindow: (id) => dispatch({ type: 'open', id }),
    closeFront: () => front && close(front),
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
  }

  const maybeTrash = (id: WindowId) => {
    const trashEl = document.querySelector<HTMLElement>('[data-trash]')
    const bar = document.querySelector<HTMLElement>(`#win-${id} [data-testid="titlebar"]`)
    if (!trashEl || !bar) return
    const t = trashEl.getBoundingClientRect()
    const b = bar.getBoundingClientRect()
    const overlap = b.left < t.right && b.right > t.left && b.top < t.bottom && b.bottom > t.top
    if (!overlap) return
    sound.beep()
    close(id)
  }

  const openWindows = (Object.keys(content) as WindowId[]).filter((id) => state.windows[id].open)

  return (
    <div className={`${styles.desktop} desktop`}>
      <MenuBar {...menuActions} />
      <DesktopIcons onOpen={open} />
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
          onDragEnd={() => maybeTrash(id)}
        >
          {content[id]}
        </Window>
      ))}
      {shutdown && <ShutDown onStartup={restart} />}
    </div>
  )
}
