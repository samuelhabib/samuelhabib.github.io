import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import type { Project, ProjectCard, ProjectsData } from '../content/projectTypes'
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

function Card({ card }: { card: ProjectCard }) {
  if (card.kind === 'prose') {
    return (
      <>
        <h3>{card.heading}</h3>
        {/* HTML from our own trusted content/projects/*.md via marked; no user input */}
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
    if (slide.kind === 'stack' && ci < cardCount - 1) setCi(ci + 1)
    else goSlide(si + 1)
  }
  const prev = () => {
    if (slide.kind === 'stack' && ci > 0) setCi(ci - 1)
    else goSlide(si - 1)
  }
  const home = () => goSlide(0)

  const jumpTo = (query: string) => {
    const q = query.toLowerCase()
    const idx = slides.findIndex(
      (s) =>
        s.kind === 'stack' &&
        (s.project.slug.toLowerCase() === q || s.project.slug.toLowerCase().includes(q)),
    )
    if (idx >= 0) goSlide(idx)
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

  return (
    <div
      className={styles.deck}
      role="group"
      aria-label="Projects deck"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage}>
        {slide.kind === 'contents' && (
          <div className={styles.contents}>
            <h2>Projects</h2>
            <p>A guided tour. Use Next / Prev, the arrow keys, or jump straight in:</p>
            <ul>
              {allProjects.map((p) => (
                <li key={p.slug}>
                  <button onClick={() => jumpTo(p.slug)}>
                    {p.title}
                    {p.placeholder ? ' (placeholder)' : ''}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {slide.kind === 'divider' && <h2 className={styles.divider}>{slide.label}</h2>}

        {slide.kind === 'stack' && (
          <div className={styles.stack}>
            <h2>{slide.project.title}</h2>
            <p className={styles.summary}>{slide.project.summary}</p>
            {slide.project.placeholder && (
              <p className={styles.flag}>Placeholder — not yet written</p>
            )}
            {card && <Card card={card} />}
          </div>
        )}
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
            card {Math.min(ci, cardCount - 1) + 1} of {cardCount}
          </span>
        )}
      </div>
    </div>
  )
}
