export function zoomFrames(from: DOMRectInit, to: DOMRectInit): Keyframe[] {
  // Animate the rect's real geometry, not a transform scale — scaling a
  // bordered box scales the border into a solid blob. This keeps a true 1px
  // outline that grows from the source point to the window rect.
  const frame = (r: DOMRectInit): Keyframe => ({
    left: `${r.x ?? 0}px`,
    top: `${r.y ?? 0}px`,
    width: `${r.width ?? 0}px`,
    height: `${r.height ?? 0}px`,
  })
  return [frame(from), frame(to)]
}
