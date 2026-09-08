/**
 * Minimal ambient declarations for the Node built-ins used by build-asset
 * assertion tests (theme tokens, prerender needles). The project has no
 * `@types/node`; these tests run under Vitest in Node, so the values exist at
 * runtime — this only teaches `tsc` their shapes. Keep the surface tiny.
 */
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string
  export function readdirSync(
    path: string,
    opts: { withFileTypes: true },
  ): Array<{ name: string; isDirectory(): boolean }>
  export function existsSync(path: string): boolean
}

declare module 'node:path' {
  export function resolve(...parts: string[]): string
  export function join(...parts: string[]): string
}

declare const process: { cwd(): string }
