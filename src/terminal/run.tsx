import type { ReactNode } from 'react'
import { resolve } from './commands'
import type { CommandCtx } from './types'

export function runCommand(line: string, ctx: CommandCtx): ReactNode | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\s+/)
  const name = parts[0]
  const args = parts.slice(1)
  const cmd = resolve(name)
  if (!cmd) {
    return <span className="term-err">sh: {name}: command not found</span>
  }
  return cmd.run(args, ctx)
}
