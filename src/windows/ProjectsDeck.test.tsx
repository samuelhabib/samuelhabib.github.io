import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import ProjectsDeck from './ProjectsDeck'
import { projects } from '../content/projects'

test('opens on the contents slide with a button per project', () => {
  render(<ProjectsDeck data={projects} target={null} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /provider directory/i })).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: /ai fitness & calorie bot \(placeholder\)/i }),
  ).toBeInTheDocument()
})

test('Next walks contents → "Work" divider → first work stack at card 1 of M', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  expect(screen.getByRole('heading', { level: 2, name: 'Work' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  expect(screen.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeInTheDocument()
  expect(screen.getByText(/card 1 of 5/i)).toBeInTheDocument()
})

test('Next steps through a stack card by card, then to the next slide', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  // Provider Directory has 5 cards (index 0..4); from card 1 that is 5 more Nexts
  for (let i = 0; i < 5; i++) await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  expect(
    screen.getByRole('heading', { level: 2, name: 'Referral Outbound Center' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/card 1 of/i)).toBeInTheDocument()
})

test('Home returns to the contents slide', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  await userEvent.click(screen.getByRole('button', { name: 'Home' }))
  expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
})

test('a contents button jumps straight to that stack', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: /mental health crisis detection/i }))
  expect(
    screen.getByRole('heading', { level: 2, name: 'Mental Health Crisis Detection' }),
  ).toBeInTheDocument()
})

test('a new target nonce jumps to that stack', async () => {
  function Harness() {
    const [n, setN] = useState(0)
    return (
      <>
        <button onClick={() => setN((x) => x + 1)}>go</button>
        <ProjectsDeck data={projects} target={n ? { slug: 'referral', nonce: n } : null} />
      </>
    )
  }
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: 'go' }))
  expect(
    screen.getByRole('heading', { level: 2, name: 'Referral Outbound Center' }),
  ).toBeInTheDocument()
})

test('ArrowRight on the focused deck advances', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  const deck = screen.getByRole('group', { name: /projects deck/i })
  deck.focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.getByRole('heading', { level: 2, name: 'Work' })).toBeInTheDocument()
})

test('Prev is disabled on the contents slide', () => {
  render(<ProjectsDeck data={projects} target={null} />)
  expect(screen.getByRole('button', { name: '◀ Prev' })).toBeDisabled()
})
