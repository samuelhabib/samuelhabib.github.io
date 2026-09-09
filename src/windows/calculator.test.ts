import { INITIAL, press, fromKeyboard, type CalcState } from './calculator'

const run = (keys: string[]): CalcState => keys.reduce(press, INITIAL)

test('types a multi-digit number, replacing the leading zero', () => {
  expect(run(['4', '2']).display).toBe('42')
})

test('adds two numbers on =', () => {
  expect(run(['1', '2', '+', '3', '=']).display).toBe('15')
})

test('chains operators, folding the running total as it goes', () => {
  expect(run(['2', '+', '3', '+', '4', '=']).display).toBe('9')
  // pressing × folds the pending 2+3 first, showing 5, then multiplies by 4
  expect(run(['2', '+', '3', '×']).display).toBe('5')
  expect(run(['2', '+', '3', '×', '4', '=']).display).toBe('20')
})

test('a decimal point is only added once', () => {
  expect(run(['1', '.', '5', '.', '2']).display).toBe('1.52')
})

test('± flips the sign of the current entry', () => {
  expect(run(['7', '±']).display).toBe('-7')
  expect(run(['7', '±', '±']).display).toBe('7')
})

test('% divides the entry by a hundred', () => {
  expect(run(['5', '0', '%']).display).toBe('0.5')
})

test('divide by zero shows Error and only Clear recovers it', () => {
  const errored = run(['5', '÷', '0', '='])
  expect(errored.display).toBe('Error')
  expect(press(errored, '9').display).toBe('Error')
  expect(press(errored, 'C')).toEqual(INITIAL)
})

test('C resets everything', () => {
  expect(run(['9', '+', '9', 'C'])).toEqual(INITIAL)
})

test('fromKeyboard maps physical keys, and rejects the rest', () => {
  expect(fromKeyboard('*')).toBe('×')
  expect(fromKeyboard('/')).toBe('÷')
  expect(fromKeyboard('Enter')).toBe('=')
  expect(fromKeyboard('Escape')).toBe('C')
  expect(fromKeyboard('q')).toBeNull()
})
