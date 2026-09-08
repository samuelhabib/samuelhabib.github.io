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

test('Next walks contents → "Work" divider → the first work deck at slide 1 of N', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  expect(screen.getByRole('heading', { level: 2, name: 'Work' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  // Provider Directory has a hand-authored presentation deck (title slide first)
  expect(screen.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeInTheDocument()
  expect(screen.getByText(/slide 1 of 5/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  expect(screen.getByRole('heading', { level: 2, name: 'The problem' })).toBeInTheDocument()
  expect(screen.getByText(/slide 2 of 5/i)).toBeInTheDocument()
})

test('Next walks through the Provider deck, then into the Referral deck', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' })) // Work divider
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' })) // Provider slide 1
  for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole('button', { name: 'Next ▶' })) // slides 2..5
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' })) // -> Referral slide 1
  expect(
    screen.getByRole('heading', { level: 2, name: 'Referral Outbound Center' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/slide 1 of/i)).toBeInTheDocument()
})

test('the Full write-up link calls onOpenWriteup with the current project slug', async () => {
  const onOpenWriteup = vi.fn()
  render(
    <ProjectsDeck
      data={projects}
      target={{ slug: 'provider-directory', nonce: 1 }}
      onOpenWriteup={onOpenWriteup}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: /full write-up/i }))
  expect(onOpenWriteup).toHaveBeenCalledWith('provider-directory')
})

test('no Full write-up link on the contents or divider slides', () => {
  render(<ProjectsDeck data={projects} target={null} onOpenWriteup={() => {}} />)
  expect(screen.queryByRole('button', { name: /full write-up/i })).toBeNull()
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

test('Next is disabled on the last card of the last stack', async () => {
  render(<ProjectsDeck data={projects} target={{ slug: 'fitness-bot', nonce: 1 }} />)
  // fitness-bot is the last slide and has a single card
  expect(screen.getByRole('heading', { level: 2, name: 'AI Fitness & Calorie Bot' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Next ▶' })).toBeDisabled()
})
