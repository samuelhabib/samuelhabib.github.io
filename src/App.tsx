import { useEffect, useState } from 'react'
import { resume } from './content/resume'
import { projects, findProject } from './content/projects'
import { ResumeArticle } from './windows/resumeContent'
import { ReadMeArticle } from './windows/readmeContent'
import { ProjectsArticle } from './windows/projectsContent'
import { THEMES } from './shell/useTheme'
import { INFO } from './windows/getInfo'
import Desktop from './shell/Desktop'
import Boot from './shell/Boot'
import { useBoot } from './shell/useBoot'
import { SoundProvider, useSound } from './shell/useSound'

function AppInner() {
  const [hydrated, setHydrated] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setIsDesktop(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const { booting, skip } = useBoot()
  const sound = useSound()

  // Play the startup chime on the first user gesture (autoplay policy), once.
  useEffect(() => {
    const once = () => {
      sound.chime()
      window.removeEventListener('pointerdown', once)
      window.removeEventListener('keydown', once)
    }
    window.addEventListener('pointerdown', once)
    window.addEventListener('keydown', once)
    return () => {
      window.removeEventListener('pointerdown', once)
      window.removeEventListener('keydown', once)
    }
  }, [sound])

  const shell = hydrated && isDesktop

  // On mobile / no-desktop, the Desktop deep-link handler never mounts. Honour
  // ?open=projects[&stack=…] by scrolling the stacked document to that section.
  useEffect(() => {
    if (shell) return
    const p = new URLSearchParams(window.location.search)
    if (p.get('open') !== 'projects') return
    const stack = p.get('stack')
    const match = stack ? findProject(projects, stack) : undefined
    document.getElementById(match ? `project-${match.slug}` : 'projects')?.scrollIntoView()
  }, [shell])

  return (
    <>
      {/* Always in the DOM and in the SSG output — the no-JS / mobile / screen-reader / ATS view */}
      <main id="main" className="doc-fallback" hidden={shell}>
        <nav className="doc-nav">
          <a href="#resume">Résumé</a> · <a href="#readme">Read Me</a> ·{' '}
          <a href="#projects">Projects</a>
        </nav>
        <div id="resume">
          <ResumeArticle data={resume} />
        </div>
        <div id="readme">
          <ReadMeArticle />
        </div>
        <div id="projects">
          <ProjectsArticle data={projects} />
        </div>
        {/* Every window's content ships as real HTML. Appearance is a control
            panel — of no use without JS — so it is pre-rendered but hidden
            from the no-JS reading view. */}
        <section id="appearance" hidden>
          <h2>Appearance</h2>
          <fieldset>
            <legend>Theme</legend>
            {THEMES.map((t) => (
              <label key={t.id}>
                <input
                  type="radio"
                  name="appearance-theme-static"
                  defaultChecked={t.id === 'system7'}
                  disabled
                />
                {t.label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Desktop Pattern</legend>
            {['None', 'Light 25%', 'Standard 50%', 'Dense 75%'].map((label) => (
              <label key={label}>
                <input
                  type="radio"
                  name="appearance-pattern-static"
                  defaultChecked={label === 'Standard 50%'}
                  disabled
                />
                {label}
              </label>
            ))}
          </fieldset>
        </section>
        {/* Get Info panes are a desktop affordance; pre-rendered but hidden
            from the reading view, same as Appearance. */}
        <section id="getinfo" hidden>
          <h2>{INFO.resume.subject} Info</h2>
          <dl>
            <dt>Kind</dt>
            <dd>{INFO.resume.kind}</dd>
            <dt>Where</dt>
            <dd>{INFO.resume.where}</dd>
          </dl>
          <p>{INFO.resume.comment}</p>
        </section>
      </main>

      {/* Enhancement: the classic-Mac desktop, only after hydration at desktop widths */}
      {shell && (
        <>
          {booting && <Boot onSkip={skip} />}
          <Desktop />
        </>
      )}
    </>
  )
}

export default function App() {
  return (
    <SoundProvider>
      <AppInner />
    </SoundProvider>
  )
}
