import { useEffect, useState } from 'react'
import { resume } from './content/resume'
import { projects } from './content/projects'
import { ResumeArticle } from './windows/resumeContent'
import { ReadMeArticle } from './windows/readmeContent'
import { ProjectsArticle } from './windows/projectsContent'
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
