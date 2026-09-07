import { ChimeEngine } from './sound'

function fakeCtx() {
  const nodes: string[] = []
  return {
    currentTime: 0,
    destination: {},
    createOscillator: () => ({
      type: '',
      frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() {},
      start() {
        nodes.push('osc-start')
      },
      stop() {},
    }),
    createGain: () => ({
      gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() {},
    }),
    _nodes: nodes,
  } as unknown as AudioContext & { _nodes: string[] }
}

test('playChime starts four oscillators when unmuted', () => {
  const ctx = fakeCtx() as unknown as AudioContext & { _nodes: string[] }
  const engine = new ChimeEngine(() => ctx)
  engine.playChime()
  expect(ctx._nodes.filter((n: string) => n === 'osc-start')).toHaveLength(4)
})

test('muted engine makes no sound', () => {
  const ctx = fakeCtx() as unknown as AudioContext & { _nodes: string[] }
  const engine = new ChimeEngine(() => ctx)
  engine.setMuted(true)
  engine.playChime()
  expect(ctx._nodes).toHaveLength(0)
})
