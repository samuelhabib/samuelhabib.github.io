import { ReadMeArticle } from './readmeContent'
import styles from './ResumeWindow.module.css'

export default function ReadMeWindow() {
  return (
    <div className={styles.scroll}>
      <ReadMeArticle />
    </div>
  )
}
