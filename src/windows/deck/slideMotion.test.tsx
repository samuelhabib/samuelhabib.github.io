import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { slideMotion, MOTION_KEYS, motionKeyFor } from './slideMotion'
import type { ProjectCard } from '../../content/projectTypes'

const card: ProjectCard = {
  kind: 'prose',
  heading: 'Result',
  html: '<p>Cut manual review by <b>60%</b>.</p>',
}

afterEach(() => vi.unstubAllGlobals())

describe('slideMotion', () => {
  it('has a component for every MotionKey', () => {
    for (const k of MOTION_KEYS) expect(slideMotion[k]).toBeTypeOf('function')
  })

  it('renders the final card content with play=false (nothing hidden)', () => {
    const R = slideMotion.result
    render(<R play={false} card={card} />)
    expect(screen.getByText(/60%/)).toBeVisible()
  })

  it('with reduced motion, play=true renders identically to play=false', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    }))
    const R = slideMotion.result
    const off = render(<R play={false} card={card} />).container.innerHTML
    const on = render(<R play={true} card={card} />).container.innerHTML
    expect(on).toBe(off)
  })

  it('motionKeyFor maps headings and card kinds', () => {
    expect(motionKeyFor('Overview', 'prose')).toBe('overview')
    expect(motionKeyFor('The problem', 'prose')).toBe('problem')
    expect(motionKeyFor('Our approach', 'prose')).toBe('approach')
    expect(motionKeyFor('Result', 'prose')).toBe('result')
    expect(motionKeyFor('anything', 'techlinks')).toBe('techlinks')
  })
})
