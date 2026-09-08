import type { Project, ProjectsData } from '../content/projectTypes'

export function ProjectSection({ project }: { project: Project }) {
  return (
    <section className="project" id={`project-${project.slug}`}>
      <h2>{project.title}</h2>
      {project.placeholder && <p className="project-flag">Placeholder — not yet written</p>}
      <p className="project-summary">{project.summary}</p>
      {project.cards.map((card, i) =>
        card.kind === 'prose' ? (
          <section key={i}>
            <h3>{card.heading}</h3>
            {/* HTML from our own trusted content/projects/*.md via marked; no user input */}
            <div dangerouslySetInnerHTML={{ __html: card.html }} />
          </section>
        ) : (
          <section key={i}>
            <h3>{card.heading}</h3>
            {card.tech.length > 0 && (
              <p>
                <strong>Tech:</strong> {card.tech.join(', ')}
              </p>
            )}
            {card.links.length > 0 && (
              <ul>
                {card.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ),
      )}
    </section>
  )
}

export function ProjectsArticle({ data }: { data: ProjectsData }) {
  return (
    <article className="projects">
      <h2>Projects</h2>
      {[...data.work, ...data.side].map((p) => (
        <ProjectSection key={p.slug} project={p} />
      ))}
    </article>
  )
}
