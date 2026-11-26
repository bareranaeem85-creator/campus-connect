import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Avatar, PageHeader } from '../components/ui';
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
    </>
  );
}
