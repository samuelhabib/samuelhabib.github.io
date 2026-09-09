import { useState, type KeyboardEvent } from 'react'
import { DIAGRAMS } from './deck/diagrams'
import type { DiagramName } from './deck/slideTypes'
import styles from './ScrapbookWindow.module.css'

// The Scrapbook desk accessory, holding the 1-bit architecture diagrams that
// otherwise only appear mid-deck. One clipping per page, paged with the arrows.
const CLIPPINGS: { name: DiagramName; title: string; caption: string }[] = [
  {
    name: 'ReferralPipeline',
    title: 'Referral Outbound Center — pipeline',
    caption:
      'Sender facility → send → service + queue → tracked state → follow-up, with the referral’s own state row beneath.',
  },
  {
    name: 'ReconcileLoop',
    title: 'Provider Directory — self-healing reconciliation',
    caption:
      'Six rosters normalize into one directory; a weekly arc loops back to diff against the live data and repair the drift.',
  },
  {
    name: 'RecallVsCost',
    title: 'Crisis Detection — the outcome grid',
    caption:
      'A missed crisis costs far more than a false alarm. That asymmetry — not raw accuracy — is what the model is tuned against.',
  },
]

export default function ScrapbookWindow() {
  const [i, setI] = useState(0)
  const clip = CLIPPINGS[i]
  const Diagram = DIAGRAMS[clip.name]
  const go = (n: number) => setI((n + CLIPPINGS.length) % CLIPPINGS.length)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(i + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(i - 1)
    }
  }

  return (
    <div
      className={styles.book}
      role="group"
      aria-label="Scrapbook"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={styles.clipping}>
        <Diagram />
      </div>
      <p className={styles.title}>{clip.title}</p>
      <p className={styles.caption}>{clip.caption}</p>
      <div className={styles.foot}>
        <button type="button" onClick={() => go(i - 1)} aria-label="Previous clipping">
          ◀
        </button>
        <span className={styles.count}>
          {i + 1} of {CLIPPINGS.length}
        </span>
        <button type="button" onClick={() => go(i + 1)} aria-label="Next clipping">
          ▶
        </button>
      </div>
    </div>
  )
}
