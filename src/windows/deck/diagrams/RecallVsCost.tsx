import { useId } from 'react'
import styles from './diagram.module.css'

/**
 * Outcome grid for the crisis classifier: actual crisis / not x flagged / not.
 * The false-negative ("MISSED") cell is hatched and heavily outlined; the
 * false-positive ("false alarm") cell is plain and quiet. The asymmetry is
 * the point. 1-bit — the hatch is a <pattern> of 1px lines, no grey.
 */
export default function RecallVsCost() {
  const uid = useId().replace(/:/g, '')
  const titleId = `${uid}-title`
  const hatch = `${uid}-hatch`
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 420 300"
      role="img"
      aria-labelledby={titleId}
      focusable="false"
    >
      <title id={titleId}>
        Recall versus cost: missing a real crisis is the expensive error; a false alarm is cheap
      </title>
      <defs>
        <pattern
          id={hatch}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" fill="var(--c-bg)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="2" />
        </pattern>
      </defs>

      <g
        fill="currentColor"
        fontFamily="var(--chrome-font, sans-serif)"
        fontSize="11"
        textAnchor="middle"
      >
        <text x="150" y="24">flagged</text>
        <text x="300" y="24">not flagged</text>
      </g>
      <g
        fill="currentColor"
        fontFamily="var(--chrome-font, sans-serif)"
        fontSize="11"
        textAnchor="end"
      >
        <text x="70" y="90">actual crisis</text>
        <text x="70" y="210">actual not</text>
      </g>

      {/* cells */}
      <g stroke="currentColor" strokeWidth="2" fill="var(--c-bg)">
        <rect x="80" y="36" width="140" height="110" />
        <rect x="220" y="36" width="140" height="110" fill={`url(#${hatch})`} strokeWidth="4" />
        <rect x="80" y="146" width="140" height="110" />
        <rect x="220" y="146" width="140" height="110" />
      </g>
      {/* knockout plate so the label reads over the hatch */}
      <rect x="232" y="74" width="116" height="42" fill="var(--c-bg)" stroke="currentColor" strokeWidth="2" />
      <g
        fill="currentColor"
        fontFamily="var(--chrome-font, sans-serif)"
        fontSize="12"
        textAnchor="middle"
      >
        <text x="150" y="96">caught</text>
        <text x="290" y="92" fontSize="13">MISSED</text>
        <text x="290" y="108" fontSize="10">the expensive one</text>
        <text x="150" y="206">false alarm</text>
        <text x="150" y="222" fontSize="10">cheap</text>
        <text x="290" y="206">correct pass</text>
      </g>
      <text
        x="220"
        y="286"
        fill="currentColor"
        fontFamily="var(--chrome-font, sans-serif)"
        fontSize="11"
        textAnchor="middle"
      >
        tuned for recall on the crisis class
      </text>
    </svg>
  )
}
