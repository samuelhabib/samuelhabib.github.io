import { useEffect, useRef, useState } from 'react'
import { useSound } from './useSound'
import Menu, { type MenuItemSpec } from './Menu'
import { THEMES } from './useTheme'
import type { WindowId } from './windows'
import styles from './MenuBar.module.css'

export interface MenuBarActions {
  openWindow(id: WindowId): void
  goHome(): void
  cleanUpIcons(): void
  closeFront(): void
  zoomFront(): void
  getInfoFront(): void
  hasFront: boolean
  print(): void
  selectAllInFront(): void
  restart(): void
  shutDown(): void
  outlineDrag: boolean
  toggleOutlineDrag(): void
  toggleFullScreen(): void
  isFullScreen: boolean
  openWindowsList: { id: WindowId; title: string }[]
  frontId: WindowId | null
  focusWindow(id: WindowId): void
  theme: string
  setTheme(id: string): void
}

const NAMES = ['apple', 'file', 'edit', 'view', 'special', 'windows'] as const
type MenuName = (typeof NAMES)[number]

// ms until the top of the next minute (plus a hair), so the clock flips exactly
// when the minute rolls over instead of lagging behind a fixed interval.
export function msToNextMinute(now: Date): number {
  return 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50
}

export default function MenuBar(props: MenuBarActions) {
  const [open, setOpen] = useState<MenuName | null>(null)
  const [clock, setClock] = useState('')
  const sound = useSound()
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
      timer = setTimeout(tick, msToNextMinute(now))
    }
    tick()
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])

  const cycle = (from: MenuName) => (dir: -1 | 1) =>
    setOpen(NAMES[(NAMES.indexOf(from) + dir + NAMES.length) % NAMES.length])

  const menuProps = (name: MenuName) => ({
    open: open === name,
    onOpen: () => setOpen(name),
    onClose: () => setOpen(null),
    onCycle: cycle(name),
  })

  const file: MenuItemSpec[] = [
    { label: 'Résumé', onSelect: () => props.openWindow('resume') },
    { label: 'Skills', onSelect: () => props.openWindow('skills') },
    { label: 'Read Me', onSelect: () => props.openWindow('readme') },
    { label: 'Projects', onSelect: () => props.openWindow('projects') },
    { label: 'Terminal', onSelect: () => props.openWindow('terminal') },
    {
      label: 'Get Info',
      shortcut: '⌘I',
      separatorBefore: true,
      disabled: !props.hasFront,
      onSelect: props.hasFront ? props.getInfoFront : undefined,
    },
    {
      label: 'Close',
      shortcut: '⌘W',
      separatorBefore: true,
      disabled: !props.hasFront,
      onSelect: props.hasFront ? props.closeFront : undefined,
    },
    {
      label: 'Zoom Window',
      disabled: !props.hasFront,
      onSelect: props.hasFront ? props.zoomFront : undefined,
    },
    { label: 'Save as PDF…', separatorBefore: true, onSelect: props.print },
    { label: 'Print…', shortcut: '⌘P', onSelect: props.print },
  ]
  const edit: MenuItemSpec[] = [
    { label: 'Undo', shortcut: '⌘Z', disabled: true },
    { label: 'Cut', shortcut: '⌘X', separatorBefore: true, disabled: true },
    { label: 'Copy', shortcut: '⌘C', disabled: true },
    { label: 'Paste', shortcut: '⌘V', disabled: true },
    { label: 'Select All', shortcut: '⌘A', separatorBefore: true, onSelect: props.selectAllInFront },
  ]
  const view: MenuItemSpec[] = [
    { label: 'Outline dragging', checked: props.outlineDrag, onSelect: props.toggleOutlineDrag },
    {
      label: props.isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen',
      separatorBefore: true,
      disabled: !props.hasFront && !props.isFullScreen,
      onSelect:
        props.hasFront || props.isFullScreen ? props.toggleFullScreen : undefined,
    },
    ...THEMES.map((t, i) => ({
      label: t.label,
      checked: props.theme === t.id,
      separatorBefore: i === 0,
      onSelect: () => props.setTheme(t.id),
    })),
  ]
  const special: MenuItemSpec[] = [
    { label: 'Clean Up', onSelect: props.cleanUpIcons },
    { label: 'Restart', separatorBefore: true, onSelect: props.restart },
    { label: 'Shut Down', onSelect: props.shutDown },
  ]

  return (
    <div className={styles.bar} ref={barRef} data-testid="menubar">
      <Menu
        label={
          <span className={styles.apple} aria-hidden>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 14.25 3.51 5.4 9.05 5.12c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.27M12.03 5.03C11.88 2.72 13.74.85 15.9.66c.29 2.55-2.31 4.53-3.87 4.37" />
            </svg>
          </span>
        }
        title="Apple menu"
        items={[
          { label: 'About This Portfolio', onSelect: () => props.openWindow('about') },
          { label: 'Home', separatorBefore: true, onSelect: props.goHome },
          {
            label: 'Appearance…',
            separatorBefore: true,
            onSelect: () => props.openWindow('appearance'),
          },
          { label: 'Calculator', separatorBefore: true, onSelect: () => props.openWindow('calculator') },
          { label: 'Scrapbook', onSelect: () => props.openWindow('scrapbook') },
          { label: 'Puzzle', onSelect: () => props.openWindow('puzzle') },
        ]}
        {...menuProps('apple')}
      />
      <Menu label="File" title="File" items={file} {...menuProps('file')} />
      <Menu label="Edit" title="Edit" items={edit} {...menuProps('edit')} />
      <Menu label="View" title="View" items={view} {...menuProps('view')} />
      <Menu label="Special" title="Special" items={special} {...menuProps('special')} />
      <button className={styles.toggle} onClick={sound.toggle} aria-pressed={!sound.muted}>
        {sound.muted ? 'Sound: Off' : 'Sound: On'}
      </button>
      <span className={styles.clock}>{clock}</span>
      {props.openWindowsList.length > 0 && (
        <Menu
          label="Windows"
          title="Windows"
          alignRight
          items={props.openWindowsList.map((w) => ({
            label: w.title,
            checked: w.id === props.frontId,
            onSelect: () => props.focusWindow(w.id),
          }))}
          {...menuProps('windows')}
        />
      )}
    </div>
  )
}
