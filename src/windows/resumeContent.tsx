import type { ResumeData } from '../content/types'

export function ResumeArticle({ data }: { data: ResumeData }) {
  return (
    <article className="resume">
      <header>
        <h1>{data.name}</h1>
        <p>
          {data.title} · {data.location}
        </p>
        <p>{data.summary}</p>
        <ul className="resume-links">
          {data.links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </header>

      <h2 className="resume-section">Experience</h2>
      {data.experience.map((job, i) => (
        <section key={i}>
          <h2>{job.company}</h2>
          <p>
            {job.role} · {job.location} · {job.start} – {job.end}
          </p>
          <ul>
            {job.bullets.map((b, j) => (
              <li key={j}>{b}</li>
            ))}
          </ul>
        </section>
      ))}

      <h2 className="resume-section">Skills</h2>
      {data.skills.map((g) => (
        <p key={g.group}>
          <strong>{g.group}:</strong> {g.items.join(', ')}
        </p>
      ))}

      <h2 className="resume-section">Education</h2>
      {data.education.map((s, i) => (
        <section key={i}>
          <h2>{s.school}</h2>
          <p>
            {s.degree} · {s.detail} · {s.start} – {s.end}
          </p>
        </section>
      ))}
    </article>
  )
}
