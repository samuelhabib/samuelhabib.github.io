import type { DesktopState, WindowId } from './windows'

/**
 * The window to bring forward when cycling with ⌘` (`dir: 1`) or ⇧⌘`
 * (`dir: -1`). Open windows are ordered back-to-front by z; the front window is
 * the anchor and the list wraps. Returns null when fewer than two are open.
 */
export function nextWindow(state: DesktopState, dir: 1 | -1): WindowId | null {
  const open = Object.values(state.windows)
    .filter((w) => w.open)
    .sort((a, b) => a.z - b.z)
  if (open.length < 2) return null
  const frontIdx = open.length - 1
  const target = (frontIdx + dir + open.length) % open.length
  return open[target].id
}
