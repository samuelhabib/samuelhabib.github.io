import { projects } from '../content/projects'
import { ProjectSection } from './projectsContent'
import styles from './ResumeWindow.module.css'

const ALL = [...projects.work, ...projects.side]

/** One project's full markdown detail as a reading article — the canonical
 *  write-up behind the "Full write-up" link in the projects deck. */
export default function WriteupWindow({ slug }: { slug: string }) {
  const project = ALL.find((p) => p.slug === slug) ?? ALL[0]
  return (
    <div className={styles.scroll}>
      <ProjectSection project={project} />
    </div>
  )
}
