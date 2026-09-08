import styles from './diagram.module.css'

/**
 * Outbound referral flow: sender facility -> send -> service + queue ->
 * tracked state -> follow up, with the referral's own state row beneath.
 * 1-bit, themed via currentColor.
 */
export default function ReferralPipeline() {
  const stages = ['Sender\nfacility', 'Send', 'Service\n+ queue', 'Track\nstate', 'Follow up']
  const states = ['Sent', 'Received', 'Actioned', 'Closed']
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 520 240"
      role="img"
      aria-labelledby="referralPipeline-title"
      focusable="false"
    >
      <title id="referralPipeline-title">
        Outbound referral flow: sender facility, send, service and queue, tracked state, follow up
      </title>
      <defs>
        <marker
          id="rp-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>

      <g stroke="currentColor" strokeWidth="2" fill="var(--c-bg)">
        {stages.map((_, i) => (
          <rect key={i} x={8 + i * 102} y="40" width="86" height="52" rx="1" />
        ))}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#rp-arrow)">
        {stages.slice(1).map((_, i) => (
          <line key={i} x1={94 + i * 102} y1="66" x2={110 + i * 102} y2="66" />
        ))}
      </g>
      <g
        fill="currentColor"
        fontFamily="var(--chrome-font, sans-serif)"
        fontSize="11"
        textAnchor="middle"
      >
        {stages.map((label, i) =>
          label.split('\n').map((line, j) => (
            <text key={`${i}-${j}`} x={51 + i * 102} y={62 + j * 14}>
              {line}
            </text>
          )),
        )}
        <text x="260" y="150" fontSize="11">
          one place to send, monitor and follow up — state legible at a glance
        </text>
      </g>

      {/* the referral's own state row */}
      <g stroke="currentColor" strokeWidth="2" fill="var(--c-bg)">
        {states.map((_, i) => (
          <rect key={i} x={70 + i * 96} y="176" width="80" height="30" rx="1" />
        ))}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#rp-arrow)">
        {states.slice(1).map((_, i) => (
          <line key={i} x1={150 + i * 96} y1="191" x2={166 + i * 96} y2="191" />
        ))}
      </g>
      <g
        fill="currentColor"
        fontFamily="var(--chrome-font, sans-serif)"
        fontSize="11"
        textAnchor="middle"
      >
        {states.map((s, i) => (
          <text key={i} x={110 + i * 96} y="195">
            {s}
          </text>
        ))}
      </g>
    </svg>
  )
}
