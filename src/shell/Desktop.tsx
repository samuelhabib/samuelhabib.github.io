import { useReducer, useState } from 'react'
import { windowsReducer, initialDesktop, type WindowId } from './windows'
import Window from './Window'
import ZoomRect from './ZoomRectLayer'
import MenuBar from './MenuBar'
import DesktopIcons from './DesktopIcons'
import ResumeWindow from '../windows/ResumeWindow'
import styles from './Desktop.module.css'

const TITLES: Record<WindowId, string> = {
  resume: 'Résumé',
  readme: 'Read Me',
  terminal: 'Terminal',
  projects: 'Projects',
  puzzle: 'Puzzle',
  about: 'About This Portfolio',
}

export default function Desktop() {
  const [state, dispatch] = useReducer(windowsReducer, initialDesktop, (s) => ({
    ...s,
    windows: { ...s.windows, resume: { ...s.windows.resume, open: true, z: 1 } },
    nextZ: 2,
  }))
  const [zoom, setZoom] = useState<{ id: WindowId; from: { x: number; y: number } } | null>(null)

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
    setZoom(null)
  }

  return (
    <div className={styles.desktop}>
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
      {state.windows.resume.open && (
        <Window
          state={state.windows.resume}
          title={TITLES.resume}
          onFocus={() => dispatch({ type: 'focus', id: 'resume' })}
          onClose={() => dispatch({ type: 'close', id: 'resume' })}
          onMove={(x, y) => dispatch({ type: 'move', id: 'resume', x, y })}
          onResize={(w, h) => dispatch({ type: 'resize', id: 'resume', w, h })}
          onToggleShade={() => dispatch({ type: 'toggleShade', id: 'resume' })}
        >
          <ResumeWindow />
        </Window>
      )}
    </div>
  )
}
