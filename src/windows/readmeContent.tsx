import { about } from '../content/about'

// The HTML comes from our own trusted content file via marked; no user input.
export function ReadMeArticle() {
  return <article className="readme" dangerouslySetInnerHTML={{ __html: about.html }} />
}
