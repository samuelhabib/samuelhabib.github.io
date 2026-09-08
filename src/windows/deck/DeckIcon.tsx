import type { DeckIconName } from './slideTypes'

const s = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** 1-bit line glyphs for `points` slides. 24x24, themed via currentColor. */
export default function DeckIcon({ name }: { name: DeckIconName }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" role="img" aria-hidden focusable="false">
      {name === 'split' && (
        <>
          <path {...s} d="M4 12 H10" />
          <path {...s} d="M10 12 L18 5" />
          <path {...s} d="M10 12 L18 19" />
          <circle {...s} cx="19" cy="5" r="2" />
          <circle {...s} cx="19" cy="19" r="2" />
        </>
      )}
      {name === 'clock' && (
        <>
          <circle {...s} cx="12" cy="12" r="8" />
          <path {...s} d="M12 7 V12 L16 14" />
        </>
      )}
      {name === 'eye' && (
        <>
          <path {...s} d="M2 12 C6 5 18 5 22 12 C18 19 6 19 2 12 Z" />
          <circle {...s} cx="12" cy="12" r="3" />
        </>
      )}
      {name === 'refresh' && (
        <>
          <path {...s} d="M20 8 A8 8 0 1 0 21 14" />
          <path {...s} d="M20 3 V9 H14" />
        </>
      )}
      {name === 'flag' && (
        <>
          <path {...s} d="M6 21 V4" />
          <path {...s} d="M6 4 H18 L15 8 L18 12 H6" />
        </>
      )}
      {name === 'check' && (
        <>
          <circle {...s} cx="12" cy="12" r="8" />
          <path {...s} d="M8 12 L11 15 L16 9" />
        </>
      )}
      {name === 'link' && (
        <>
          <path {...s} d="M9 15 L15 9" />
          <path {...s} d="M7 13 L5 15 A3 3 0 0 0 9 19 L11 17" />
          <path {...s} d="M17 11 L19 9 A3 3 0 0 0 15 5 L13 7" />
        </>
      )}
    </svg>
  )
}
