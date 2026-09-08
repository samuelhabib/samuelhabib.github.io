import type { ReactNode } from 'react'
import type { ProjectCard } from '../../content/projectTypes'
import { prefersReducedMotion } from '../../shell/prefersReducedMotion'
import styles from './slideMotion.module.css'

export const MOTION_KEYS = [
  'overview',
  'problem',
  'approach',
  'result',
  'techlinks',
  'divider',
  'contents',
] as const
export type MotionKey = (typeof MOTION_KEYS)[number]

export interface MotionProps {
  /** true only for the slide currently on stage */
  play: boolean
  /** the stack card, for the card-backed keys */
  card?: ProjectCard
  /** own content, for divider / contents */
  children?: ReactNode
}

/** Signature entrance class for this key, unless muted (not playing / reduced motion). */
function entrance(key: MotionKey, play: boolean): string | undefined {
  return play && !prefersReducedMotion() ? styles[key] : undefined
}

function CardBody({ card }: { card: ProjectCard }) {
  if (card.kind === 'prose') {
    return (
      <>
        <h3>{card.heading}</h3>
        {/* trusted HTML from our own content/projects/*.md via marked */}
        <div dangerouslySetInnerHTML={{ __html: card.html }} />
      </>
    )
  }
  return (
    <>
      <h3>{card.heading}</h3>
      {card.tech.length > 0 && (
        <p>
          <strong>Tech:</strong> {card.tech.join(', ')}
        </p>
      )}
      {card.links.length > 0 && (
        <ul>
          {card.links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function cardMotion(key: MotionKey) {
  return function Motion({ play, card }: MotionProps) {
    if (!card) return null
    return <div className={entrance(key, play)}>{<CardBody card={card} />}</div>
  }
}

function ownMotion(key: MotionKey) {
  return function Motion({ play, children }: MotionProps) {
    return <div className={entrance(key, play)}>{children}</div>
  }
}

export const slideMotion: Record<MotionKey, (p: MotionProps) => ReactNode> = {
  overview: cardMotion('overview'),
  problem: cardMotion('problem'),
  approach: cardMotion('approach'),
  result: cardMotion('result'),
  techlinks: cardMotion('techlinks'),
  divider: ownMotion('divider'),
  contents: ownMotion('contents'),
}

/** Pick a motion key from a stack card's heading / kind. */
export function motionKeyFor(heading: string | undefined, cardKind: string | undefined): MotionKey {
  if (cardKind === 'techlinks') return 'techlinks'
  const h = (heading ?? '').toLowerCase()
  if (h.includes('problem') || h.includes('why')) return 'problem'
  if (h.includes('approach') || h.includes('how') || h.includes('build')) return 'approach'
  if (h.includes('result') || h.includes('outcome') || h.includes('impact')) return 'result'
  return 'overview'
}
