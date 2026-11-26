import { formatDateTime } from '../utils/format';

/** Editorial announcement row: OFFICIAL tag, mono date/time, title, body, link/attachment. */
export default function AnnouncementRow({ a, compact, actions }) {
  return (
    <article className={`ann-row ${compact ? 'compact' : ''}`}>
      <div className="ann-meta">
        <span className="badge badge-dark">Official</span>
        <time className="mono" dateTime={a.createdAt}>{formatDateTime(a.createdAt)}</time>
      </div>
      <div className="ann-content">
        <h3 className="ann-title">{a.title}</h3>
        <p className={`ann-body ${compact ? 'clamp' : ''}`}>{a.body}</p>
        {!compact && (a.link || a.attachmentUrl) && (
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            {a.link && <a className="btn btn-outline btn-sm" href={a.link} target="_blank" rel="noopener noreferrer">Open link ↗</a>}
            {a.attachmentUrl && (
              <a className="btn btn-outline btn-sm" href={a.attachmentUrl} target="_blank" rel="noopener noreferrer">
                ↓ {a.attachmentName || 'Attachment'}
              </a>
            )}
          </div>
        )}
        <div className="mono" style={{ marginTop: 10 }}>
          Posted by {a.author?.name}{a.author?.adminTitle ? ` · ${a.author.adminTitle}` : ''}
        </div>
      </div>
      {actions && <div className="ann-actions">{actions}</div>}
    </article>
  );
}
