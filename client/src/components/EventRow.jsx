import { formatTime } from '../utils/format';

/** Timeline row: big mono date on the left, details on the right. */
export default function EventRow({ event, actions, compact }) {
  const d = new Date(event.date);
  const cancelled = event.status === 'cancelled';
  return (
    <article className={`event-row ${cancelled ? 'is-cancelled' : ''} ${compact ? 'compact' : ''}`}>
      <div className="event-date" aria-label={d.toDateString()}>
        <span className="event-day">{String(d.getDate()).padStart(2, '0')}</span>
        <span className="mono">{d.toLocaleDateString('en-GB', { month: 'short' })} · {d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
      </div>
      <div className="event-info">
        <div className="row" style={{ gap: 8 }}>
          <h3 className="event-title">{event.title}</h3>
          {cancelled && <span className="badge badge-danger">Cancelled</span>}
        </div>
        <div className="mono event-where">{formatTime(event.time)} · {event.venue}</div>
        {!compact && <p className="event-desc">{event.description}</p>}
      </div>
      {actions && <div className="event-actions">{actions}</div>}
    </article>
  );
}
