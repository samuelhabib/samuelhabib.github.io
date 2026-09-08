import { useReducer, useState, useCallback, useMemo, type ReactNode } from 'react'
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

  const bridge = useMemo<DesktopBridge>(
    () => ({
      // dispatch is stable (useReducer); the reducer's 'open' also raises z, so
      // this opens-or-focuses in one action.
      open: (id) => dispatch({ type: 'open', id }),
      close: (id) => close(id),
      beep: () => sound.beep(),
    }),
    [close, sound],
  )

  const content: Partial<Record<WindowId, ReactNode>> = {
    resume: <ResumeWindow />,
    readme: <ReadMeWindow />,
    terminal: <TerminalWindow bridge={bridge} />,
  }

  const front = frontWindow(state)
  useWindowKeys(front, close)

  const openWindows = (Object.keys(content) as WindowId[]).filter((id) => state.windows[id].open)

  return (
    <div className={`${styles.desktop} desktop`}>
      <MenuBar />
      <DesktopIcons onOpen={open} />
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
        >
          {content[id]}
        </Window>
      ))}
    </div>
  )
}
