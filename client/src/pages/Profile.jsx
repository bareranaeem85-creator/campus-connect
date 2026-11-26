import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import PostCard from '../components/PostCard';
import { Avatar, Empty, PageHeader, SkeletonList } from '../components/ui';
import { formatDate } from '../utils/format';

export default function Profile() {
  const { user, isAdmin, setUser } = useAuth();
  const { toast } = useUI();
  const [form, setForm] = useState({ name: user.name, bio: user.bio || '' });
  const [busy, setBusy] = useState(false);

  const roleLabel = isAdmin ? `Admin · ${user.adminTitle}` : user.moderatorOf?.length ? 'Moderator' : 'Student';

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await api.patch('/auth/me', form);
      setUser(d.user);
      toast('Profile updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader label="Your account" title="Profile" />
      <div className="two-col">
        <form className="card form fade-up" onSubmit={save}>
          <div className="row">
            <Avatar name={user.name} />
            <div>
              <strong>{user.name}</strong>
              <div className="mono">{user.email}</div>
            </div>
          </div>
          <div className="field">
            <label htmlFor="pname">Name</label>
            <input id="pname" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="pbio">Bio</label>
            <textarea id="pbio" className="textarea" maxLength={200} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A line about you" />
          </div>
          <div><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div>
        </form>

        <aside className="stack fade-up">
          <div className="card">
            <span className="mono">Role</span>
            <div style={{ marginTop: 8 }}><span className="badge badge-accent">{roleLabel}</span></div>
            <div className="mono" style={{ marginTop: 16 }}>Member since {formatDate(user.createdAt)}</div>
          </div>
          {user.moderatorOf?.length > 0 && (
            <div className="card">
              <span className="mono">Moderating</span>
              <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                {user.moderatorOf.map((c) => <Link key={c._id} to={`/clubs/${c.slug}`}>{c.name}</Link>)}
              </div>
            </div>
          )}
        </aside>
      </div>
      <SavedPosts />
    </>
  );
}

/** Bookmarked posts. Unsaving removes the post from this list. */
function SavedPosts() {
  const [posts, setPosts] = useState(null);
  useEffect(() => {
    api.get('/posts/bookmarks').then(setPosts).catch(() => setPosts([]));
  }, []);

  return (
    <section className="section fade-up">
      <div className="section-head"><span className="label-pill">Saved posts</span></div>
      {!posts ? (
        <SkeletonList count={2} height={110} />
      ) : posts.length === 0 ? (
        <Empty title="Nothing saved yet" text="Tap “Save” on any post to keep it here." />
      ) : (
        <div className="stack stagger">
          {posts.map((p) => (
            <PostCard
              key={p._id}
              post={p}
              onChange={(u) => setPosts((l) => (u.bookmarked ? l.map((x) => (x._id === u._id ? u : x)) : l.filter((x) => x._id !== u._id)))}
              onDelete={(id) => setPosts((l) => l.filter((x) => x._id !== id))}
            />
          ))}
        </div>
      )}
    </section>
  );
}
