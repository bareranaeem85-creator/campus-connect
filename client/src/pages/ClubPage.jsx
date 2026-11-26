import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import JoinButton from '../components/JoinButton';
import ClubFeed from '../components/ClubFeed';
import { Avatar, Empty, Loader } from '../components/ui';

export default function ClubPage() {
  const { slug } = useParams();
  const { canModerate } = useAuth();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setClub(null);
    setError('');
    Promise.all([api.get(`/clubs/${slug}`), api.get(`/clubs/${slug}/members`)])
      .then(([c, m]) => {
        setClub(c);
        setMembers(m);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  // Keep member list in sync after join/leave.
  const onMembershipChange = (c) => {
    setClub(c);
    api.get(`/clubs/${slug}/members`).then(setMembers).catch(() => {});
  };

  if (error) return <Empty title="Club not found" text={error}><Link to="/clubs" className="btn btn-primary">Back to clubs</Link></Empty>;
  if (!club) return <Loader />;

  const isMod = canModerate(club._id);

  return (
    <>
      <header className="club-hero fade-up">
        <div className="blob blob-lg" style={{ background: club.color }}>{club.name[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row">
            <span className="label-pill">Club</span>
            {isMod && <span className="badge badge-dark">You moderate this club</span>}
          </div>
          <h1 className="page-title club-title">{club.name}</h1>
          <p className="lead">{club.description}</p>
          <div className="row mono" style={{ marginTop: 16, gap: 20 }}>
            <span>{club.memberCount} members</span>
            <span>{club.postCount} posts</span>
          </div>
        </div>
        <JoinButton club={club} onChange={onMembershipChange} />
      </header>

      <div className="two-col section">
        <ClubFeed club={club} />

        <aside className="stack fade-up">
          <div className="card">
            <span className="mono">Moderators</span>
            <div className="stack" style={{ gap: 10, marginTop: 12 }}>
              {club.moderators.length === 0 && <span className="muted">Managed by department admins.</span>}
              {club.moderators.map((m) => (
                <div key={m._id} className="row" style={{ gap: 10 }}>
                  <Avatar name={m.name} small />
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <span className="mono">Members · {members.length}</span>
            <div className="member-list">
              {members.slice(0, 24).map((m) => (
                <span key={m._id} title={m.name}><Avatar name={m.name} small /></span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
