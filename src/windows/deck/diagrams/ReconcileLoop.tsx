import { useId } from 'react'
import styles from './diagram.module.css'

/**
 * Provider Directory: six roster boxes -> a normalize step -> one directory,
 * with a weekly arc looping back to repair drift. 1-bit, themed via
 * currentColor. The self-heal label sits in its own band below the arc.
 */
export default function ReconcileLoop() {
  const rosterY = [14, 38, 62, 86, 110, 134]
  const uid = useId().replace(/:/g, '')
  const titleId = `${uid}-title`
  const arrow = `${uid}-arrow`
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 480 288"
      role="img"
      aria-labelledby={titleId}
      focusable="false"
    >
      <title id={titleId}>
        Six public rosters normalized into one directory that reconciles itself weekly
      </title>
      <defs>
        <marker
          id={arrow}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* connectors */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        markerEnd={`url(#${arrow})`}
      >
        {rosterY.map((y, i) => (
          <line key={i} x1="74" y1={y + 10} x2="168" y2="110" />
        ))}
        <line x1="258" y1="110" x2="298" y2="110" />
        {/* weekly self-heal loop — a clean arc under everything, ending back at the sources */}
        <path strokeDasharray="5 4" d="M356 138 C356 220 96 236 44 198 C22 182 24 156 26 148" />
      </g>

      {/* boxes (fill so connectors don't show through labels) */}
      <g stroke="currentColor" strokeWidth="2" fill="var(--c-bg)">
        {rosterY.map((y, i) => (
          <rect key={i} x="8" y={y} width="66" height="20" rx="1" />
        ))}
        <rect x="168" y="88" width="90" height="44" rx="1" />
        <rect x="298" y="84" width="118" height="52" rx="1" />
        <rect x="302" y="88" width="118" height="52" rx="1" />
      </g>

      {/* labels */}
      <g
        fill="currentColor"
        fontFamily="var(--chrome-font, sans-serif)"
        fontSize="11"
        textAnchor="middle"
      >
        <text x="41" y="9">
          6 public rosters
        </text>
        <text x="213" y="106">
          normalize
        </text>
        <text x="213" y="119">
          to one shape
        </text>
        <text x="361" y="106" fontSize="13">
          DIRECTORY
        </text>
        <text x="361" y="123" fontSize="13">
          40,000+ rows
        </text>
        <text x="240" y="272">
          weekly self-heal — diffs the live sources, repairs drift
        </text>
      </g>
    </svg>
  )
}
