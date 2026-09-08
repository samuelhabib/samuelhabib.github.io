import { projects } from '../content/projects'
import ProjectsDeck from './ProjectsDeck'

export default function ProjectsWindow({
  target,
}: {
  target: { slug: string; nonce: number } | null
}) {
  return <ProjectsDeck data={projects} target={target} />
}
