import { resume } from '../content/resume'
import { ResumeArticle } from './resumeContent'
import styles from './ResumeWindow.module.css'

export default function ResumeWindow({ onOpenStack }: { onOpenStack?: (slug: string) => void }) {
  return (
    <div className={styles.scroll}>
      <button className={styles.pdfBtn} onClick={() => window.print()}>
        Save as PDF
      </button>
      <ResumeArticle data={resume} onOpenStack={onOpenStack} />
    </div>
  )
}
