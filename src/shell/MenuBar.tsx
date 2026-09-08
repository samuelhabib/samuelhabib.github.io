import { useEffect, useRef, useState } from 'react'
import { useSound } from './useSound'
import Menu, { type MenuItemSpec } from './Menu'
import type { WindowId } from './windows'
import styles from './MenuBar.module.css'

export interface MenuBarActions {
  openWindow(id: WindowId): void
  closeFront(): void
  hasFront: boolean
  print(): void
  selectAllInFront(): void
  restart(): void
  shutDown(): void
}

const NAMES = ['apple', 'file', 'edit', 'special'] as const
type MenuName = (typeof NAMES)[number]

export default function MenuBar(props: MenuBarActions) {
  const [open, setOpen] = useState<MenuName | null>(null)
  const [clock, setClock] = useState('')
  const sound = useSound()
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
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
    { label: 'Read Me', onSelect: () => props.openWindow('readme') },
    { label: 'Projects', onSelect: () => props.openWindow('projects') },
    { label: 'Terminal', onSelect: () => props.openWindow('terminal') },
    {
      label: 'Close',
      separatorBefore: true,
      disabled: !props.hasFront,
      onSelect: props.hasFront ? props.closeFront : undefined,
    },
    { label: 'Save as PDF…', separatorBefore: true, onSelect: props.print },
    { label: 'Print…', onSelect: props.print },
  ]
  const edit: MenuItemSpec[] = [
    { label: 'Undo', disabled: true },
    { label: 'Cut', separatorBefore: true, disabled: true },
    { label: 'Copy', disabled: true },
    { label: 'Paste', disabled: true },
    { label: 'Select All', separatorBefore: true, onSelect: props.selectAllInFront },
  ]
  const special: MenuItemSpec[] = [
    { label: 'Restart', onSelect: props.restart },
    { label: 'Shut Down', onSelect: props.shutDown },
  ]

  return (
    <div className={styles.bar} ref={barRef}>
      <Menu
        label={<span className={styles.apple} aria-hidden />}
        title="Apple menu"
        items={[
          { label: 'About This Portfolio', onSelect: () => props.openWindow('about') },
          { label: 'Puzzle', separatorBefore: true, onSelect: () => props.openWindow('puzzle') },
        ]}
        {...menuProps('apple')}
      />
      <Menu label="File" title="File" items={file} {...menuProps('file')} />
      <Menu label="Edit" title="Edit" items={edit} {...menuProps('edit')} />
      <Menu label="Special" title="Special" items={special} {...menuProps('special')} />
      <button className={styles.toggle} onClick={sound.toggle} aria-pressed={!sound.muted}>
        {sound.muted ? 'Sound: Off' : 'Sound: On'}
      </button>
      <span className={styles.clock}>{clock}</span>
    </div>
  )
}
