import { useEffect, useState } from 'react'
import { resume } from './content/resume'
import { ResumeArticle } from './windows/resumeContent'
import Desktop from './shell/Desktop'
import Boot from './shell/Boot'
import { useBoot } from './shell/useBoot'
import { SoundProvider, useSound } from './shell/useSound'

function AppInner() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
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

  return (
    <>
      {/* Always in the DOM and in the SSG output — the no-JS / screen-reader / ATS view */}
      <main id="main" className="doc-fallback" hidden={hydrated}>
        <ResumeArticle data={resume} />
      </main>

      {/* Enhancement: the classic-Mac desktop, only after hydration */}
      {hydrated && (
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
