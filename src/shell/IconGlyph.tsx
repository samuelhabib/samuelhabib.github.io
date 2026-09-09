export type GlyphKind = 'about' | 'resume' | 'projects' | 'terminal' | 'readme' | 'skills'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinejoin: 'round' as const }

export default function IconGlyph({ kind }: { kind: GlyphKind }) {
  switch (kind) {
    case 'about':
      // a compact-Mac hard disk: a stout box with a slot and a status LED
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <rect {...stroke} x="4" y="8" width="24" height="16" rx="1" />
          <path {...stroke} d="M8 14 H18" />
          <circle cx="23" cy="14" r="1.4" fill="currentColor" stroke="none" />
          <path {...stroke} d="M8 19 H24" />
        </svg>
      )
    case 'resume':
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <path {...stroke} d="M7 3 H21 L25 7 V29 H7 Z" />
          <path {...stroke} d="M21 3 V7 H25" />
          <path {...stroke} d="M11 13 H21 M11 18 H21 M11 23 H17" />
        </svg>
      )
    case 'projects':
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <path {...stroke} d="M4 9 H13 L16 12 H28 V26 H4 Z" />
          <path {...stroke} d="M4 9 V7 H11 L13 9" />
        </svg>
      )
    case 'terminal':
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <rect {...stroke} x="4" y="6" width="24" height="18" />
          <path {...stroke} d="M8 12 L12 15 L8 18 M14 19 H20" />
          <path {...stroke} d="M12 27 H20" />
        </svg>
      )
    case 'readme':
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <path {...stroke} d="M8 3 H20 L25 8 V29 H8 Z" />
          <path {...stroke} d="M20 3 V8 H25" />
          <path {...stroke} d="M12 6 H16" />
          <path {...stroke} d="M12 15 H21 M12 20 H21 M12 25 H18" />
        </svg>
      )
    case 'skills':
      return (
        <svg viewBox="0 0 32 32" role="img" aria-hidden>
          <path {...stroke} d="M4 12 H28 V27 H4 Z" />
          <path {...stroke} d="M12 12 V9 A2 2 0 0 1 14 7 H18 A2 2 0 0 1 20 9 V12" />
          <path {...stroke} d="M4 19 H28" />
          <path {...stroke} d="M14 17 H18 V22 H14 Z" />
        </svg>
      )
  }
}
