import { useState } from 'react'
import { isSolved, shuffle, slide, type Board } from './puzzle'
import styles from './PuzzleWindow.module.css'

export default function PuzzleWindow() {
  const [board, setBoard] = useState<Board>(() => shuffle())
  const solved = isSolved(board)

  return (
    <div className={styles.wrap}>
      <div className={styles.grid} role="group" aria-label="Puzzle">
        {board.map((v, i) =>
          v === 0 ? (
            <span key={i} className={styles.gap} aria-hidden />
          ) : (
            <button
              key={i}
              type="button"
              className={styles.tile}
              onClick={() => setBoard((b) => slide(b, i))}
            >
              {v}
            </button>
          ),
        )}
      </div>
      <div className={styles.foot}>
        <button type="button" className={styles.shuffle} onClick={() => setBoard(shuffle())}>
          Shuffle
        </button>
        {solved && <span className={styles.solved}>Solved!</span>}
      </div>
    </div>
  )
}
