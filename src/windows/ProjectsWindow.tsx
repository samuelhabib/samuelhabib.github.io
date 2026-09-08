import { projects } from '../content/projects'
import ProjectsDeck from './ProjectsDeck'

export default function ProjectsWindow({
  target,
  onOpenWriteup,
}: {
  target: { slug: string; nonce: number } | null
  onOpenWriteup?: (slug: string) => void
}) {
  return <ProjectsDeck data={projects} target={target} onOpenWriteup={onOpenWriteup} />
}
