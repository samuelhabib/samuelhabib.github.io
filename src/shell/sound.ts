const A = 440
const noteHz = (semitonesFromA4: number) => A * Math.pow(2, semitonesFromA4 / 12)
// C4 E4 G4 C5 relative to A4: -9, -5, -2, +3
const CHORD = [-9, -5, -2, 3].map(noteHz)

type CtxFactory = () => AudioContext

export class ChimeEngine {
  private ctxFactory: CtxFactory
  private ctx: AudioContext | null = null
  private muted = false

  constructor(ctxFactory?: CtxFactory) {
    this.ctxFactory =
      ctxFactory ??
      (() =>
        new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)())
  }

  setMuted(m: boolean) {
    this.muted = m
  }

  private ac(): AudioContext {
    if (!this.ctx) this.ctx = this.ctxFactory()
    return this.ctx
  }

  playChime() {
    if (this.muted) return
    const ac = this.ac()
    const t0 = ac.currentTime
    CHORD.forEach((hz, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(hz, t0 + i * 0.06)
      gain.gain.setValueAtTime(0.0001, t0 + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + i * 0.06 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.06 + 1.6)
      osc.connect(gain)
      gain.connect(ac.destination)
      osc.start(t0 + i * 0.06)
      osc.stop(t0 + i * 0.06 + 1.7)
    })
  }

  beep() {
    if (this.muted) return
    const ac = this.ac()
    const t0 = ac.currentTime
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(440, t0)
    osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.08)
    gain.gain.setValueAtTime(0.12, t0)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(t0)
    osc.stop(t0 + 0.13)
  }
}
