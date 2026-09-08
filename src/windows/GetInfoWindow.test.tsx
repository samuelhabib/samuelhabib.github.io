import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GetInfoWindow from './GetInfoWindow'

describe('GetInfoWindow', () => {
  it('renders the subject kind, where, and personality comment', () => {
    render(<GetInfoWindow subject="projects" />)
    expect(screen.getByText('Slide deck')).toBeInTheDocument()
    expect(screen.getByText('samuelhabib.github.io')).toBeInTheDocument()
    expect(screen.getByText(/arrow keys/i)).toBeInTheDocument()
  })

  it('titles the pane after the subject', () => {
    render(<GetInfoWindow subject="terminal" />)
    expect(screen.getByText('Terminal Info')).toBeInTheDocument()
  })
})
