export function zoomFrames(from: DOMRectInit, to: DOMRectInit): Keyframe[] {
  return [
    {
      transform: `translate(${from.x}px, ${from.y}px) scale(${from.width || 1}, ${from.height || 1})`,
      opacity: 1,
    },
    {
      transform: `translate(${to.x}px, ${to.y}px) scale(${to.width || 1}, ${to.height || 1})`,
      opacity: 1,
    },
  ]
}
