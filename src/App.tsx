import { useEffect, useState } from 'react'
import { resume } from './content/resume'
import { ResumeArticle } from './windows/resumeContent'
import Desktop from './shell/Desktop'
import Boot from './shell/Boot'
import { useBoot } from './shell/useBoot'

export default function App() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const { booting, skip } = useBoot()

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
