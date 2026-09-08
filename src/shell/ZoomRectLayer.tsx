import { useEffect, useRef } from 'react'
import { zoomFrames } from './zoomRect'

const reduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ZoomRect(props: {
  from: { x: number; y: number }
  to: { x: number; y: number; w: number; h: number }
  onDone(): void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reduce() || !ref.current) {
      const id = requestAnimationFrame(props.onDone)
      return () => cancelAnimationFrame(id)
    }
    const anim = ref.current.animate(
      zoomFrames(
        { x: props.from.x, y: props.from.y, width: 0, height: 0 },
        { x: props.to.x, y: props.to.y, width: props.to.w, height: props.to.h },
      ),
      { duration: 180, easing: 'steps(6, end)', fill: 'forwards' },
    )
    anim.onfinish = props.onDone
    return () => anim.cancel()
  }, [props])
  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        left: props.from.x,
        top: props.from.y,
        width: 0,
        height: 0,
        border: '1px solid var(--c-fg)',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
