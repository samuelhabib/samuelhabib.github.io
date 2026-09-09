import type { ReactNode } from 'react'
import type { ResumeData } from '../content/types'

// Project names that appear in the Experience bullets and have a deck stack.
const PROJECT_REFS = [
  { phrase: 'Referral Outbound Center', slug: 'referral-outbound-center' },
  { phrase: 'Provider Directory', slug: 'provider-directory' },
] as const

// Split a bullet on any known project name and swap in a link: a button that
// opens the deck stack when we're inside the desktop shell, a plain anchor to
// the pre-rendered section in the no-JS document.
function renderBullet(
  text: string,
  onOpenStack: ((slug: string) => void) | undefined,
  keyBase: string,
): ReactNode[] {
  let best: { i: number; phrase: string; slug: string } | null = null
  for (const ref of PROJECT_REFS) {
    const i = text.indexOf(ref.phrase)
    if (i !== -1 && (best === null || i < best.i)) best = { i, phrase: ref.phrase, slug: ref.slug }
  }
  if (!best) return [text]
  const before = text.slice(0, best.i)
  const after = text.slice(best.i + best.phrase.length)
  const ref = onOpenStack ? (
    <button
      type="button"
      className="resume-projlink"
      onClick={() => onOpenStack(best!.slug)}
    >
      {best.phrase}
    </button>
  ) : (
    <a className="resume-projlink" href={`#project-${best.slug}`}>
      {best.phrase}
    </a>
  )
  return [
    before,
    <span key={`${keyBase}${best.i}`}>{ref}</span>,
    ...renderBullet(after, onOpenStack, `${keyBase}${best.i}-`),
  ]
}

export function ResumeArticle({
  data,
  onOpenStack,
}: {
  data: ResumeData
  onOpenStack?: (slug: string) => void
}) {
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
              <li key={j}>{renderBullet(b, onOpenStack, `${i}-${j}-`)}</li>
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
