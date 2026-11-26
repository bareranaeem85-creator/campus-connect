import { Link } from 'react-router-dom';
import JoinButton from './JoinButton';

/** Club card with a colored blob initial, description, member count and join toggle. */
export default function ClubCard({ club, onChange }) {
  return (
    <article className="card card-hover club-card">
      <Link to={`/clubs/${club.slug}`} className="card-link club-card-body">
        <div className="blob" style={{ background: club.color }}>{club.name[0]}</div>
        <h3 className="club-card-title">{club.name}</h3>
        <p className="muted club-card-desc">{club.description}</p>
      </Link>
      <div className="spread club-card-foot">
        <span className="mono">{club.memberCount} member{club.memberCount === 1 ? '' : 's'}</span>
        <JoinButton club={club} onChange={onChange} small />
      </div>
    </article>
  );
}
