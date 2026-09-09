// A four-function calculator engine, in the spirit of the System 7 Calculator
// desk accessory. Pure and synchronous so the window is a thin shell over it.

export type CalcOp = '+' | '-' | '×' | '÷'

export interface CalcState {
  /** the number on the readout */
  display: string
  /** value carried from before the pending operator */
  acc: number | null
  /** operator awaiting its second operand */
  op: CalcOp | null
  /** the next digit starts a fresh number rather than appending */
  fresh: boolean
  /** a divide-by-zero (or overflow) locked the readout until the next clear */
  error: boolean
}

export const INITIAL: CalcState = {
  display: '0',
  acc: null,
  op: null,
  fresh: true,
  error: false,
}

const MAX_LEN = 12

function fmt(n: number): string {
  if (!Number.isFinite(n)) return 'Error'
  // strip float noise, then fall back to exponential only when it won't fit
  const s = String(Number(n.toPrecision(12)))
  if (s.replace('-', '').replace('.', '').length <= MAX_LEN) return s
  return n.toExponential(6)
}

function apply(a: number, b: number, op: CalcOp): number {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? NaN : a / b
  }
}

/** Advance the calculator by one key: a digit, '.', an operator, '=', 'C', '±' or '%'. */
export function press(s: CalcState, key: string): CalcState {
  if (key === 'C') return INITIAL
  if (s.error) return s // only Clear clears an error

  if (/^[0-9]$/.test(key)) {
    if (s.fresh) return { ...s, display: key, fresh: false }
    if (s.display.replace('-', '').replace('.', '').length >= MAX_LEN) return s
    return { ...s, display: s.display === '0' ? key : s.display + key }
  }

  if (key === '.') {
    if (s.fresh) return { ...s, display: '0.', fresh: false }
    return s.display.includes('.') ? s : { ...s, display: s.display + '.' }
  }

  if (key === '±') {
    if (s.display === '0') return s
    return { ...s, display: s.display.startsWith('-') ? s.display.slice(1) : '-' + s.display }
  }

  if (key === '%') {
    const v = Number(s.display) / 100
    return { ...s, display: fmt(v), fresh: true }
  }

  if (key === '+' || key === '-' || key === '×' || key === '÷') {
    const cur = Number(s.display)
    if (s.op != null && s.acc != null && !s.fresh) {
      const r = apply(s.acc, cur, s.op)
      return Number.isFinite(r)
        ? { ...INITIAL, display: fmt(r), acc: r, op: key, fresh: true }
        : { ...INITIAL, display: 'Error', error: true }
    }
    return { ...s, acc: cur, op: key, fresh: true }
  }

  if (key === '=') {
    if (s.op == null || s.acc == null) return { ...s, fresh: true }
    const r = apply(s.acc, Number(s.display), s.op)
    return Number.isFinite(r)
      ? { ...INITIAL, display: fmt(r) }
      : { ...INITIAL, display: 'Error', error: true }
  }

  return s
}

/** Map a physical keyboard key to a calculator key, or null if it isn't one. */
export function fromKeyboard(key: string): string | null {
  if (/^[0-9.]$/.test(key)) return key
  if (key === '+' || key === '-') return key
  if (key === '*' || key === 'x' || key === 'X') return '×'
  if (key === '/') return '÷'
  if (key === '%') return '%'
  if (key === 'Enter' || key === '=') return '='
  if (key === 'Escape' || key === 'Backspace' || key === 'Delete') return 'C'
  return null
}
