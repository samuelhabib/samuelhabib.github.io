# Slide-transition technique — spike outcome

**Chosen: 1-bit checkerboard dissolve.** The outgoing slide sits above the
incoming one and is masked by a hard-stop `repeating-conic-gradient`
(the Plan 1 dither, `#000 0 25%, transparent 0 50%`). We animate
`mask-size` from `48px` down to `0` with `steps(9, end)`, so the outgoing
slide breaks into shrinking pure-black/transparent squares and the
incoming slide reads through them. Hard conic stops mean every cell is
fully opaque or fully clipped — **no antialiased grey at any frame** —
and `steps()` gives the chunky, mechanical feel of a HyperCard
"dissolve". ~420 ms, GPU-composited (`mask-size` only), measured 60 fps
on a 6× CPU throttle.

**Rejected: hard-edged iris (`clip-path: circle()` growing).** Also
grey-free and cheap, but it reads as a generic modern reveal, not a
System-7-era screen transition; the checkerboard is the more distinctive,
on-theme choice and costs the same.

**Fallback if `mask` ever misbehaves:** swap the dissolve layer for a
`clip-path` inset wipe in the direction of travel (`dir`), same duration
and `steps()` timing. No API surface change — only the `.dissolve` rule
in `SlideTransition.module.css`.

Reduced motion: `SlideTransition` checks `prefersReducedMotion()` and
swaps children synchronously with no overlay layer and no timers.
