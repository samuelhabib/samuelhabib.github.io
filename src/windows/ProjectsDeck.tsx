import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Project, ProjectsData } from '../content/projectTypes'
import SlideTransition from './deck/SlideTransition'
import SlideView from './deck/SlideView'
import { DECKS } from './deck/decks'
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
  onOpenWriteup,
}: {
  data: ProjectsData
  target: { slug: string; nonce: number } | null
  onOpenWriteup?: (slug: string) => void
}) {
  const slides = useMemo(() => buildSlides(data), [data])
  const [si, setSi] = useState(0)
  const [ci, setCi] = useState(0)
  const [presenting, setPresenting] = useState(false)
  const dir = useRef<1 | -1>(1)
  const presentRef = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)

  const slide = slides[si]
  const project = slide.kind === 'stack' ? slide.project : null
  const deck = project ? DECKS[project.slug] : undefined
  const mdCards = project && !deck ? project.cards : []
  const cardCount = project ? (deck ? deck.slides.length : Math.max(mdCards.length, 1)) : 1
  const cardIndex = Math.min(ci, cardCount - 1)
  const mdCard = deck ? null : (mdCards[cardIndex] ?? null)

  const atStart = si === 0 && ci === 0
  const atEnd = si === slides.length - 1 && (!project || ci >= cardCount - 1)

  const goSlide = (n: number) => {
    setSi(Math.max(0, Math.min(slides.length - 1, n)))
    setCi(0)
  }
  const next = () => {
    dir.current = 1
    if (project && ci < cardCount - 1) setCi(ci + 1)
    else goSlide(si + 1)
  }
  const prev = () => {
    dir.current = -1
    if (project && ci > 0) setCi(ci - 1)
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

  // Present mode: full-bleed, chrome gone, click or arrow keys to drive, Esc
  // out. Remember where focus was so leaving the show restores it.
  const startPresenting = () => {
    restoreFocus.current = document.activeElement as HTMLElement | null
    setPresenting(true)
  }
  const stopPresenting = () => setPresenting(false)
  useEffect(() => {
    if (presenting) {
      presentRef.current?.focus()
    } else if (restoreFocus.current) {
      restoreFocus.current.focus()
      restoreFocus.current = null
    }
  }, [presenting])

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

  // While presenting, own the keyboard at the capture phase so navigation and
  // Esc never reach the desktop's global handlers (Esc there closes the front
  // window). A ref keeps the latest nav closures without re-subscribing.
  const navRef = useRef({ next, prev, home, stop: stopPresenting })
  navRef.current = { next, prev, home, stop: stopPresenting }
  useEffect(() => {
    if (!presenting) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      const nav = navRef.current
      const run =
        e.key === 'Escape'
          ? nav.stop
          : e.key === 'ArrowRight' || e.key === 'PageDown'
            ? nav.next
            : e.key === 'ArrowLeft' || e.key === 'PageUp'
              ? nav.prev
              : e.key === 'Home'
                ? nav.home
                : null
      if (!run) return
      e.preventDefault()
      e.stopPropagation()
      run()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [presenting])

  const allProjects = [...data.work, ...data.side]

  const Contents = slideMotion.contents
  const Divider = slideMotion.divider
  const CardMotion = mdCard ? slideMotion[motionKeyFor(mdCard.heading, mdCard.kind)] : null

  const stage = (
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

      {slide.kind === 'stack' && deck && <SlideView slide={deck.slides[cardIndex]} play />}

      {slide.kind === 'stack' && !deck && (
        <div className={styles.stack}>
          <h2 className={styles.bigTitle}>{slide.project.title}</h2>
          <p className={styles.summary}>{slide.project.summary}</p>
          {slide.project.placeholder && (
            <p className={styles.flag}>Placeholder — not yet written</p>
          )}
          {mdCard && CardMotion && <CardMotion play card={mdCard} />}
        </div>
      )}
    </SlideTransition>
  )

  return (
    <div
      className={styles.deck}
      role="group"
      aria-label="Projects deck"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage}>{!presenting && stage}</div>

      <div className={styles.nav}>
        <button onClick={prev} disabled={atStart}>
          ◀ Prev
        </button>
        <button onClick={home}>Home</button>
        <button onClick={next} disabled={atEnd}>
          Next ▶
        </button>
        <button className={styles.present} onClick={startPresenting}>
          ▶ Present
        </button>
        {project && (
          <span className={styles.count}>
            {deck ? 'slide' : 'card'} {cardIndex + 1} of {cardCount}
          </span>
        )}
        {project && !project.placeholder && onOpenWriteup && (
          <button className={styles.writeup} onClick={() => onOpenWriteup(project.slug)}>
            Full write-up →
          </button>
        )}
      </div>

      {presenting &&
        createPortal(
          <div
            ref={presentRef}
            className={styles.show}
            role="dialog"
            aria-modal="true"
            aria-label="Presentation"
            tabIndex={-1}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button')) return
              next()
            }}
          >
            <div className={styles.showStage}>{stage}</div>
            <button className={styles.showExit} onClick={stopPresenting} aria-label="End show">
              ✕
            </button>
            <p className={styles.showCount}>
              {si + 1} / {slides.length}
              {project ? ` · ${cardIndex + 1}/${cardCount}` : ''}
            </p>
          </div>,
          document.body,
        )}
    </div>
  )
}
