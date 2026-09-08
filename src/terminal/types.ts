import type { ReactNode } from 'react'
import type { WindowId } from '../shell/windows'

export interface DesktopBridge {
  open(id: WindowId): void
  close(id: WindowId): void
  beep(): void
  openStack(slug: string): void
}

export interface CommandCtx extends DesktopBridge {
  /** run another command string (used by clickable output) */
  run(line: string): void
  /** wipe the output buffer */
  clear(): void
  cwd: string
}

export interface Command {
  name: string
  aliases?: string[]
  hidden?: boolean
  description: string
  usage?: string
  run(args: string[], ctx: CommandCtx): ReactNode
}
