import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '../../shell/prefersReducedMotion'
import styles from './SlideTransition.module.css'

interface Props {
  /** direction of travel: 1 = forward, -1 = back (reserved for motion tuning) */
  dir: 1 | -1
  /** changes when the slide changes; drives the transition */
  keyId: string
  children: ReactNode
}

interface Frame {
  keyId: string
  node: ReactNode
}

/**
 * 1-bit checkerboard dissolve between slides. The outgoing slide is kept
 * mounted above the incoming one and masked by a hard-stop dither whose
 * `mask-size` shrinks to zero (see CrtSpike.md). Under reduced motion the
 * swap is instant with no overlay and no timers.
 */
export default function SlideTransition({ dir, keyId, children }: Props) {
  const reduce = prefersReducedMotion()
  const [current, setCurrent] = useState<Frame>({ keyId, node: children })
  const [outgoing, setOutgoing] = useState<Frame | null>(null)
  const outRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (keyId === current.keyId) {
      setCurrent({ keyId, node: children }) // same slide, fresh content
      return
    }
    if (reduce) {
      setCurrent({ keyId, node: children })
      setOutgoing(null)
      return
    }
    setOutgoing(current)
    setCurrent({ keyId, node: children })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyId])

  useEffect(() => {
    if (!outgoing) return
    const el = outRef.current
    if (!el) {
      setOutgoing(null)
      return
    }
    const finish = () => setOutgoing(null)
    const anim = el.animate([{ maskSize: '48px 48px' }, { maskSize: '0px 0px' }], {
      duration: 420,
      easing: 'steps(9, end)',
      fill: 'forwards',
    })
    anim.onfinish = finish
    anim.oncancel = finish
    return () => anim.cancel()
  }, [outgoing])

  return (
    <div className={styles.wrap} data-dir={dir}>
      <div className={styles.layer}>{current.node}</div>
      {outgoing && (
        <div
          ref={outRef}
          className={`${styles.layer} ${styles.dissolve}`}
          data-transitioning
          aria-hidden
        >
          {outgoing.node}
        </div>
      )}
    </div>
  )
}
