import { resume } from '../content/resume'
import { ResumeArticle } from './resumeContent'
import styles from './ResumeWindow.module.css'

export default function ResumeWindow() {
  return (
    <div className={styles.scroll}>
      <ResumeArticle data={resume} />
    </div>
  )
}
