import DeckIcon from './DeckIcon'
import { DIAGRAMS } from './diagrams'
import { prefersReducedMotion } from '../../shell/prefersReducedMotion'
import type { Slide } from './slideTypes'
import styles from './SlideView.module.css'

/** Render one presentation slide. `play` is true only for the slide on stage. */
export default function SlideView({ slide, play }: { slide: Slide; play: boolean }) {
  const anim = (cls: string) => (play && !prefersReducedMotion() ? cls : undefined)

  switch (slide.layout) {
    case 'title':
      return (
        <div className={`${styles.slide} ${anim(styles.inTitle) ?? ''}`}>
          {slide.kicker && <p className={styles.kicker}>{slide.kicker}</p>}
          <h2 className={styles.bigTitle}>{slide.title}</h2>
          {slide.subtitle && <p className={styles.subtitle}>{slide.subtitle}</p>}
        </div>
      )

    case 'points':
      return (
        <div className={`${styles.slide} ${anim(styles.inRise) ?? ''}`}>
          <h2 className={styles.h}>{slide.title}</h2>
          <ul className={styles.points}>
            {slide.items.map((it, i) => (
              <li key={i} style={{ animationDelay: `${i * 70}ms` }}>
                <span className={styles.pIcon} aria-hidden>
                  <DeckIcon name={it.icon} />
                </span>
                <span>{it.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )

    case 'diagram': {
      const Diagram = DIAGRAMS[slide.name]
      return (
        <div className={`${styles.slide} ${styles.center} ${anim(styles.inScale) ?? ''}`}>
          {slide.title && <h2 className={styles.h}>{slide.title}</h2>}
          <div className={styles.diagramWrap}>
            <Diagram />
          </div>
          {slide.caption && <p className={styles.caption}>{slide.caption}</p>}
        </div>
      )
    }

    case 'stat':
      return (
        <div className={`${styles.slide} ${styles.center} ${anim(styles.inScale) ?? ''}`}>
          <h2 className={styles.statValue}>{slide.value}</h2>
          <p className={styles.statLabel}>{slide.label}</p>
          {slide.foot && <p className={styles.statFoot}>{slide.foot}</p>}
        </div>
      )

    case 'quote':
      return (
        <div className={`${styles.slide} ${styles.center} ${anim(styles.inRise) ?? ''}`}>
          <blockquote className={styles.quote}>“{slide.text}”</blockquote>
          {slide.attribution && <p className={styles.attribution}>— {slide.attribution}</p>}
        </div>
      )

    case 'tech':
      return (
        <div className={`${styles.slide} ${anim(styles.inRise) ?? ''}`}>
          {slide.title && <h2 className={styles.h}>{slide.title}</h2>}
          <ul className={styles.chips}>
            {slide.items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )
  }
}
