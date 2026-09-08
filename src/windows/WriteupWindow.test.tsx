import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WriteupWindow from './WriteupWindow'

describe('WriteupWindow', () => {
  it('renders the full markdown detail for one project', () => {
    render(<WriteupWindow slug="provider-directory" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Problem' })).toBeInTheDocument()
    expect(screen.getByText(/40,000\+ rows across six rosters/i)).toBeInTheDocument()
  })
  it('falls back to the first project for an unknown slug', () => {
    render(<WriteupWindow slug="nope" />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})
