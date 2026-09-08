import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { Project, ProjectsData } from '../content/projectTypes'
import SlideTransition from './deck/SlideTransition'
import { slideMotion, motionKeyFor } from './deck/slideMotion'
import styles from './ProjectsDeck.module.css'

type Slide =
  | { kind: 'contents' }
  | { kind: 'divider'; label: string }
  | { kind: 'stack'; project: Project }

function buildSlides(data: ProjectsData): Slide[] {
  return [
    { kind: 'contents' },
    { kind: 'divider', label: 'Work' },
    ...data.work.map((project) => ({ kind: 'stack' as const, project })),
    { kind: 'divider', label: 'Outside of Work Projects' },
    ...data.side.map((project) => ({ kind: 'stack' as const, project })),
  ]
}

export default function ProjectsDeck({
  data,
  target,
}: {
  data: ProjectsData
  target: { slug: string; nonce: number } | null
}) {
  const slides = useMemo(() => buildSlides(data), [data])
  const [si, setSi] = useState(0)
  const [ci, setCi] = useState(0)
  const dir = useRef<1 | -1>(1)

  const slide = slides[si]
  const stackCards = slide.kind === 'stack' ? slide.project.cards : []
  const cardCount = Math.max(stackCards.length, 1)
  const card = slide.kind === 'stack' ? stackCards[Math.min(ci, cardCount - 1)] : null

  const atStart = si === 0 && ci === 0
  const atEnd = si === slides.length - 1 && (slide.kind !== 'stack' || ci >= cardCount - 1)

  const goSlide = (n: number) => {
    setSi(Math.max(0, Math.min(slides.length - 1, n)))
    setCi(0)
  }
  const next = () => {
    dir.current = 1
    if (slide.kind === 'stack' && ci < cardCount - 1) setCi(ci + 1)
    else goSlide(si + 1)
  }
  const prev = () => {
    dir.current = -1
    if (slide.kind === 'stack' && ci > 0) setCi(ci - 1)
    else goSlide(si - 1)
  }
  const home = () => {
    dir.current = -1
    goSlide(0)
  }

  const jumpTo = (query: string) => {
    const q = query.toLowerCase()
    const idx = slides.findIndex(
      (s) =>
        s.kind === 'stack' &&
        (s.project.slug.toLowerCase() === q || s.project.slug.toLowerCase().includes(q)),
    )
    if (idx >= 0) {
      dir.current = idx >= si ? 1 : -1
      goSlide(idx)
    }
  }

  useEffect(() => {
    if (target) jumpTo(target.slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.nonce])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault()
      next()
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault()
      prev()
    } else if (e.key === 'Home') {
      e.preventDefault()
      home()
    }
  }

  const allProjects = [...data.work, ...data.side]
  const cardIndex = Math.min(ci, cardCount - 1)

  const Contents = slideMotion.contents
  const Divider = slideMotion.divider
  const CardMotion = card ? slideMotion[motionKeyFor(card.heading, card.kind)] : null

  return (
    <div
      className={styles.deck}
      role="group"
      aria-label="Projects deck"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage}>
        <SlideTransition dir={dir.current} keyId={`${si}.${cardIndex}`}>
          {slide.kind === 'contents' && (
            <Contents play>
              <h2 className={styles.bigTitle}>Projects</h2>
              <p>A guided tour. Use Next / Prev, the arrow keys, or jump straight in:</p>
              <ul className={styles.agenda}>
                {allProjects.map((p) => (
                  <li key={p.slug}>
                    <button onClick={() => jumpTo(p.slug)}>
                      {p.title}
                      {p.placeholder ? ' (placeholder)' : ''}
                    </button>
                  </li>
                ))}
              </ul>
            </Contents>
          )}

          {slide.kind === 'divider' && (
            <Divider play>
              <h2 className={styles.divider}>{slide.label}</h2>
            </Divider>
          )}

          {slide.kind === 'stack' && (
            <div className={styles.stack}>
              <h2 className={styles.bigTitle}>{slide.project.title}</h2>
              <p className={styles.summary}>{slide.project.summary}</p>
              {slide.project.placeholder && (
                <p className={styles.flag}>Placeholder — not yet written</p>
              )}
              {card && CardMotion && <CardMotion play card={card} />}
            </div>
          )}
        </SlideTransition>
      </div>

      <div className={styles.nav}>
        <button onClick={prev} disabled={atStart}>
          ◀ Prev
        </button>
        <button onClick={home}>Home</button>
        <button onClick={next} disabled={atEnd}>
          Next ▶
        </button>
        {slide.kind === 'stack' && (
          <span className={styles.count}>
            card {cardIndex + 1} of {cardCount}
          </span>
        )}
      </div>
    </div>
  )
}
