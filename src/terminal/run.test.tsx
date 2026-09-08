import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { runCommand } from './run'
import { completions } from './commands'
import type { CommandCtx } from './types'

function makeCtx(over: Partial<CommandCtx> = {}): CommandCtx {
  return {
    open: () => {},
    close: () => {},
    beep: () => {},
    openStack: () => {},
    run: () => {},
    clear: () => {},
    cwd: '/Users/samuel',
    ...over,
  }
}
const txt = (node: ReactNode | null) => {
  const { container } = render(<>{node}</>)
  return container.textContent ?? ''
}

test('whoami prints the one-line identity from resume data', () => {
  expect(txt(runCommand('whoami', makeCtx()))).toMatch(/Samuel Habib/)
})

test('help lists visible commands and hides hidden ones', () => {
  const out = txt(runCommand('help', makeCtx()))
  expect(out).toMatch(/experience/)
  expect(out).not.toMatch(/\becho\b/)
  expect(out).not.toMatch(/\bsudo\b/)
})

test('"?" is an alias of help', () => {
  expect(txt(runCommand('?', makeCtx()))).toMatch(/experience/)
})

test('unknown command returns a not-found node', () => {
  expect(txt(runCommand('frobnicate', makeCtx()))).toMatch(/command not found/i)
})

test('empty line returns null', () => {
  expect(runCommand('   ', makeCtx())).toBeNull()
})

test('open dispatches through the bridge', () => {
  const open = vi.fn()
  runCommand('open resume', makeCtx({ open }))
  expect(open).toHaveBeenCalledWith('resume')
})

test('open reaches the desk accessories and control panels, not just the docs', () => {
  for (const id of ['puzzle', 'about', 'appearance', 'skills']) {
    const open = vi.fn()
    runCommand(`open ${id}`, makeCtx({ open }))
    expect(open, `open ${id}`).toHaveBeenCalledWith(id)
  }
})

test('open with an unknown target is an error, not a dispatch', () => {
  const open = vi.fn()
  const out = txt(runCommand('open trash', makeCtx({ open })))
  expect(open).not.toHaveBeenCalled()
  expect(out).toMatch(/no such window/i)
})

test('projects <slug> opens that stack through the bridge', () => {
  const openStack = vi.fn()
  runCommand('projects crisis', makeCtx({ openStack }))
  expect(openStack).toHaveBeenCalledWith('crisis-detection')
})

test('projects with an unknown stack is an error', () => {
  expect(txt(runCommand('projects nope', makeCtx()))).toMatch(/no such stack/i)
})

test('cat resume.md prints the raw résumé markdown body', () => {
  expect(txt(runCommand('cat resume.md', makeCtx()))).toMatch(/Referral Outbound Center/)
})

test('cat of an unknown file is an error', () => {
  expect(txt(runCommand('cat passwords.txt', makeCtx()))).toMatch(/No such file/i)
})

test('experience renders a decorated commit log, newest first', () => {
  const out = txt(runCommand('experience', makeCtx()))
  expect(out).toMatch(/git log --oneline/)
  expect(out).toMatch(/HEAD -> main/)
  expect(out).toMatch(/ExaCare/)
  expect(out).toMatch(/Apple/)
})

test('hidden commands still run when typed explicitly', () => {
  expect(txt(runCommand('echo hi there', makeCtx()))).toBe('hi there')
})

test('neofetch renders career facts drawn from the résumé', () => {
  const out = txt(runCommand('neofetch', makeCtx()))
  expect(out).toMatch(/samuelhabib@portfolio/)
  expect(out).toMatch(/Host: ExaCare/)
  expect(out).toMatch(/Superpowers workflow/)
  expect(out).toMatch(/System 7 \(1-bit\)/)
  expect(completions('n')).toContain('neofetch')
})

test('sysbeep calls the bridge beep', () => {
  const beep = vi.fn()
  runCommand('sysbeep', makeCtx({ beep }))
  expect(beep).toHaveBeenCalledOnce()
})

test('hidden hypercard command opens the projects window', () => {
  const open = vi.fn()
  runCommand('hypercard', makeCtx({ open }))
  expect(open).toHaveBeenCalledWith('projects')
  expect(completions('h')).not.toContain('hypercard')
})

test('completions are prefix matches that exclude hidden commands', () => {
  expect(completions('e')).toContain('experience')
  expect(completions('e')).not.toContain('echo')
  expect(completions('su')).toEqual([])
  expect(completions('')).toContain('help')
})
