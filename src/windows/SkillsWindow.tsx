import { useRef, useState, type KeyboardEvent } from 'react'
import { resume } from '../content/resume'
import type { ResumeSkillGroup } from '../content/types'
import styles from './SkillsWindow.module.css'

/**
 * Skills, presented the way System 7 presented a list of things to pick from:
 * the Chooser. A scrolling list of categories on the left, the picked
 * category's contents on the right. Selection follows focus, the picked row
 * is the inverted black bar, and the arrow keys walk the list — exactly the
 * Chooser / control-panel idiom.
 *
 * No proficiency data: he has not rated himself, so nothing here does either.
 * Just the categories and what is in them.
 */
export default function SkillsWindow({
  groups = resume.skills,
}: {
  groups?: ResumeSkillGroup[]
}) {
  const [sel, setSel] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const current = groups[sel] ?? groups[0]

  const pick = (i: number) => {
    const next = (i + groups.length) % groups.length
    setSel(next)
    listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[next]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        pick(sel + 1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        pick(sel - 1)
        break
      case 'Home':
        e.preventDefault()
        pick(0)
        break
      case 'End':
        e.preventDefault()
        pick(groups.length - 1)
        break
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.panes}>
        <ul
          ref={listRef}
          className={styles.groups}
          role="listbox"
          aria-label="Skill categories"
          onKeyDown={onKeyDown}
        >
          {groups.map((g, i) => (
            <li
              key={g.group}
              role="option"
              aria-selected={i === sel}
              tabIndex={i === sel ? 0 : -1}
              className={`${styles.option} ${i === sel ? styles.selected : ''}`}
              onClick={() => pick(i)}
            >
              {g.group}
            </li>
          ))}
        </ul>

        <div className={styles.detail} role="group" aria-label={current.group}>
          <h2 className={styles.detailHead}>{current.group}</h2>
          <ul className={styles.items}>
            {current.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={styles.count}>
            {current.items.length} {current.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>
    </div>
  )
}
