# Font licenses and attribution

This site self-hosts the following faces. No font with unclear rights is shipped.

## Chicago → `public/fonts/chicago.woff2`

- **Font:** ChiKareGo2, a pixel recreation of Susan Kare's Chicago.
- **Author:** Giles Booth (@blogmywiki / pentacom.jp).
- **License:** Creative Commons Attribution (CC BY). Commercial use permitted with
  attribution.
- **Source:** https://www.pentacom.jp/pentacom/bitfontmaker2/gallery/?id=3780
  (file mirrored from https://github.com/sakofchit/system.css, MIT-licensed
  project, `fonts/ChiKareGo2.woff2`).
- **Attribution:** "Chicago" display type is ChiKareGo2 by Giles Booth, used under
  CC BY. This credit also appears in the site's "About This Portfolio" dialog.

## Geneva → not shipped (fallback stack only)

- No clean-license clone of Geneva was found. `--font-ui` resolves to the
  platform UI sans (`system-ui, -apple-system, 'Helvetica Neue', Arial,
  sans-serif`), which is the closest defensible modern echo of Geneva's role as
  the readable Mac UI face.

## New York → `public/fonts/newyork.woff2`, `newyork-bold.woff2`

- **Substitution.** No clean-license clone of New York (Apple's system serif)
  exists. Substituted with **PT Serif** (regular + bold), a transitional serif
  of similar proportions.
- **Author:** ParaType (Alexandra Korolkova, Olga Umpeleva, Vladimir Yefimov).
- **License:** SIL Open Font License 1.1.
- **Source:** https://fonts.google.com/specimen/PT+Serif — files mirrored from
  `@fontsource/pt-serif` (npm, `pt-serif-latin-400-normal.woff2` /
  `pt-serif-latin-700-normal.woff2`).

## Monaco → `public/fonts/monaco.woff2`

- **Substitution.** Monaco's own file is Apple-proprietary. Substituted with
  **IBM Plex Mono**, a humanist monospace of similar cadence.
- **Author:** Mike Abbink, Paul van der Laan, Pieter van Rosmalen (IBM / Bold
  Monday).
- **License:** SIL Open Font License 1.1.
- **Source:** https://github.com/IBM/plex — file mirrored from
  `@fontsource/ibm-plex-mono` (npm, `ibm-plex-mono-latin-400-normal.woff2`).
