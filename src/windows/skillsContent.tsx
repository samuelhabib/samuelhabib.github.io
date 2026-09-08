import type { ResumeSkillGroup } from '../content/types'

/**
 * The flat, no-frills skills list for the pre-rendered no-JS / mobile /
 * screen-reader / ATS view. The desktop shell shows the same data in a
 * Chooser-style two-pane window (SkillsWindow); this is the readable HTML
 * that ships in dist/index.html regardless.
 */
export function SkillsArticle({ groups }: { groups: ResumeSkillGroup[] }) {
  return (
    <article id="skills-fallback" className="skills">
      <h2>Skills</h2>
      <dl>
        {groups.map((g) => (
          <div key={g.group}>
            <dt>{g.group}</dt>
            <dd>
              <ul>
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
