import styles from './diagram.module.css'

/**
 * Provider Directory: six roster boxes -> a normalize step -> one directory,
 * with a weekly arrow looping back to repair drift. 1-bit, themed via
 * currentColor.
 */
export default function ReconcileLoop() {
  const rosterY = [14, 44, 74, 104, 134, 164]
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 460 236"
      role="img"
      aria-labelledby="reconcileLoop-title"
      focusable="false"
    >
      <title id="reconcileLoop-title">
        Six public rosters normalized into one directory that reconciles itself weekly
      </title>
      <defs>
        <marker
          id="rl-arrow"
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

      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        markerEnd="url(#rl-arrow)"
      >
        {rosterY.map((y, i) => (
          <line key={i} x1="74" y1={y + 11} x2="150" y2="103" />
        ))}
        <line x1="244" y1="103" x2="286" y2="103" />
        {/* weekly self-heal loop: directory -> back around -> rosters */}
        <path
          strokeDasharray="5 4"
          markerEnd="url(#rl-arrow)"
          d="M340 150 C340 210 120 224 40 188 L40 96"
        />
      </g>

      <g stroke="currentColor" strokeWidth="2" fill="var(--c-bg)">
        {rosterY.map((y, i) => (
          <rect key={i} x="6" y={y} width="68" height="22" rx="1" />
        ))}
        <rect x="150" y="80" width="94" height="46" rx="1" />
        <rect x="286" y="76" width="118" height="54" rx="1" />
        <rect x="290" y="80" width="118" height="54" rx="1" />
      </g>

      <g
        fill="currentColor"
        fontFamily="var(--chrome-font, sans-serif)"
        fontSize="11"
        textAnchor="middle"
      >
        <text x="40" y={rosterY[0] - 4}>
          6 public rosters
        </text>
        <text x="197" y="100">
          normalize
        </text>
        <text x="197" y="113">
          to one shape
        </text>
        <text x="351" y="100" fontSize="13">
          DIRECTORY
        </text>
        <text x="351" y="116">
          40,000+ rows
        </text>
        <text x="196" y="214">
          weekly self-heal · diffs live sources, repairs drift
        </text>
      </g>
    </svg>
  )
}
