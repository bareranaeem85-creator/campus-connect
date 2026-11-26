import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ClubCard from '../components/ClubCard';
import { ArrowIcon, Empty, PageHeader, SearchIcon, SkeletonList } from '../components/ui';

export default function Clubs() {
  const [clubs, setClubs] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | joined
  const [error, setError] = useState('');

  // Debounced server-side search.
  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get(`/clubs${query ? `?q=${encodeURIComponent(query)}` : ''}`)
        .then(setClubs)
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const updateClub = (c) => setClubs((list) => list.map((x) => (x._id === c._id ? { ...x, ...c } : x)));
  const visible = clubs?.filter((c) => filter === 'all' || c.isMember);

  return (
    <>
      <PageHeader label="Communities" title="Clubs" lead="Find your people. Join clubs to post and follow their discussions.">
        <Link to="/request-club" className="btn btn-dark btn-arrow">
          <span className="arrow"><ArrowIcon /></span>Request a club
        </Link>
      </PageHeader>

      <div className="spread fade-up" style={{ marginBottom: 28 }}>
        <div className="search">
          <SearchIcon />
          <input className="input" placeholder="Search clubs…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search clubs" />
        </div>
        <div className="tabs" role="tablist">
          {['all', 'joined'].map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All clubs' : 'My clubs'}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!clubs ? (
        <SkeletonList count={3} height={200} />
      ) : visible.length === 0 ? (
        <Empty
          title={filter === 'joined' ? 'No clubs joined yet' : 'No clubs found'}
          text={query ? `Nothing matches “${query}”.` : 'Can’t find what you’re looking for? Suggest it.'}
        >
          <Link to="/request-club" className="btn btn-primary">Request a club</Link>
        </Empty>
      ) : (
        <div className="grid grid-3 stagger">
          {visible.map((c) => <ClubCard key={c._id} club={c} onChange={updateClub} />)}
        </div>
      )}
    </>
  );
}
