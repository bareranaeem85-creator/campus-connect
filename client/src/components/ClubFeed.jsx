import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import PostComposer from './PostComposer';
import { Empty, SkeletonList } from './ui';

/** Discussion feed for one club: composer (members only), sort tabs, posts. */
export default function ClubFeed({ club }) {
  const { canModerate } = useAuth();
  const [posts, setPosts] = useState(null);
  const [sort, setSort] = useState('new');
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPosts(null);
    api.get(`/posts?club=${club._id}&sort=${sort}`).then(setPosts).catch((e) => setError(e.message));
  }, [club._id, sort]);

  // Re-sort locally so pin changes move posts immediately.
  const resort = (list) =>
    [...list].sort((a, b) => (a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : sort === 'top' && b.score !== a.score ? b.score - a.score : new Date(b.createdAt) - new Date(a.createdAt)));

  const update = (p) => setPosts((list) => resort(list.map((x) => (x._id === p._id ? p : x))));
  const remove = (id) => setPosts((list) => list.filter((x) => x._id !== id));
  const add = (p) => {
    setPosts((list) => resort([p, ...list]));
    setComposing(false);
  };

  const canPost = club.isMember || canModerate(club._id);

  return (
    <section className="fade-up">
      <div className="section-head">
        <span className="label-pill">Discussions</span>
        <div className="row">
          <div className="tabs">
            {['new', 'top'].map((s) => (
              <button key={s} className={`tab ${sort === s ? 'active' : ''}`} onClick={() => setSort(s)}>{s}</button>
            ))}
          </div>
          {canPost && !composing && <button className="btn btn-dark btn-sm" onClick={() => setComposing(true)}>+ New post</button>}
        </div>
      </div>

      {!canPost && <div className="notice">Join this club to start posting and commenting.</div>}
      {composing && (
        <div style={{ marginBottom: 20 }}>
          <PostComposer clubId={club._id} onCreated={add} autoFocus />
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setComposing(false)}>Cancel</button>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
      {!posts ? (
        <SkeletonList count={3} height={140} />
      ) : posts.length === 0 ? (
        <Empty title="No posts yet" text="Be the first to start a discussion here.">
          {canPost && <button className="btn btn-primary" onClick={() => setComposing(true)}>Write the first post</button>}
        </Empty>
      ) : (
        <div className="stack stagger">
          {posts.map((p) => <PostCard key={p._id} post={p} showClub={false} onChange={update} onDelete={remove} />)}
        </div>
      )}
    </section>
  );
}
