import { INFO } from './getInfo'
import IconGlyph, { type GlyphKind } from '../shell/IconGlyph'
import type { WindowId } from '../shell/windows'
import styles from './GetInfoWindow.module.css'

const GLYPHS = new Set<GlyphKind>(['resume', 'projects', 'terminal', 'readme'])

export default function GetInfoWindow({ subject }: { subject: WindowId }) {
  const i = INFO[subject]
  return (
    <div className={styles.root}>
      <div className={styles.head}>
        {GLYPHS.has(subject as GlyphKind) && (
          <span className={styles.glyph}>
            <IconGlyph kind={subject as GlyphKind} />
          </span>
        )}
        <strong>{i.subject} Info</strong>
      </div>
      <dl className={styles.grid}>
        <dt>Kind</dt>
        <dd>{i.kind}</dd>
        <dt>Where</dt>
        <dd>{i.where}</dd>
        <dt>Created</dt>
        <dd>{i.created}</dd>
        <dt>Modified</dt>
        <dd>{i.modified}</dd>
        <dt>Size</dt>
        <dd>{i.size}</dd>
      </dl>
      <div className={styles.comments}>
        <div className={styles.commentsLabel}>Comments:</div>
        <p>{i.comment}</p>
      </div>
    </div>
  )
}
