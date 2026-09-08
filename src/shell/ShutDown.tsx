import { useEffect, useRef, useState } from 'react'
import styles from './ShutDown.module.css'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ShutDown({ onStartup }: { onStartup(): void }) {
  const [collapsed, setCollapsed] = useState(prefersReduced())
  const crtRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (collapsed || !crtRef.current) return
    const anim = crtRef.current.animate(
      [
        { transform: 'scaleY(1) scaleX(1)' },
        { transform: 'scaleY(0.004) scaleX(1)' },
        { transform: 'scaleY(0.004) scaleX(0.004)' },
      ],
      { duration: 320, easing: 'steps(8, end)', fill: 'forwards' },
    )
    anim.onfinish = () => setCollapsed(true)
    return () => anim.cancel()
  }, [collapsed])

  return (
    <div className={styles.root}>
      {!collapsed && <div ref={crtRef} className={styles.crt} />}
      {collapsed && (
        <button type="button" className={styles.safe} onClick={onStartup}>
          <span>It is now safe to turn off your Macintosh.</span>
          <span className={styles.hint}>Click anywhere to start up again.</span>
        </button>
      )}
    </div>
  )
}
