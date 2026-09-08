import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SlideTransition from './SlideTransition'

vi.mock('../../shell/prefersReducedMotion', () => ({ prefersReducedMotion: () => true }))

describe('SlideTransition (reduced motion)', () => {
  it('swaps children synchronously with no lingering old node or overlay', () => {
    const { rerender } = render(
      <SlideTransition dir={1} keyId="a">
        <p>alpha</p>
      </SlideTransition>,
    )
    expect(screen.getByText('alpha')).toBeInTheDocument()
    rerender(
      <SlideTransition dir={1} keyId="b">
        <p>beta</p>
      </SlideTransition>,
    )
    expect(screen.queryByText('alpha')).toBeNull()
    expect(screen.getByText('beta')).toBeInTheDocument()
    expect(document.querySelector('[data-transitioning]')).toBeNull()
  })
})
