import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useUI } from '../context/UIContext';
import { Empty, PageHeader, SkeletonList } from '../components/ui';
import { formatDate } from '../utils/format';

const EMPTY_FORM = { name: '', description: '', reason: '' };

export default function RequestClub() {
  const { toast } = useUI();
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState(null);

  const load = () => api.get('/club-requests/mine').then(setMine).catch((e) => toast(e.message, 'error'));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.reason.trim()) {
      return toast('Please fill in all fields', 'error');
    }
    setBusy(true);
    try {
      await api.post('/club-requests', form);
      toast('Request sent to admins for review');
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader label="Suggest" title="Request a club" lead="Have an idea for a new community? Admins (HOD, Head CR, Head GR) review every request." />
      <div className="two-col">
        <form className="card form fade-up" onSubmit={submit}>
          <div className="field">
            <label htmlFor="rname">Club name</label>
            <input id="rname" className="input" maxLength={50} value={form.name} onChange={set('name')} placeholder="e.g. Game Dev Guild" required />
          </div>
          <div className="field">
            <label htmlFor="rdesc">Description</label>
            <textarea id="rdesc" className="textarea" maxLength={500} value={form.description} onChange={set('description')} placeholder="What will this club be about?" required />
          </div>
          <div className="field">
            <label htmlFor="rreason">Why should it exist?</label>
            <textarea id="rreason" className="textarea" maxLength={500} value={form.reason} onChange={set('reason')} placeholder="Who is it for, and what will members do?" required />
          </div>
          <div><button className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Submit request'}</button></div>
        </form>

        <aside className="fade-up">
          <span className="label-pill">Your requests</span>
          <div className="stack" style={{ marginTop: 16 }}>
            {!mine ? (
              <SkeletonList count={2} height={80} />
            ) : mine.length === 0 ? (
              <Empty title="No requests yet" text="Your submitted requests and their status appear here." />
            ) : (
              mine.map((r) => (
                <div key={r._id} className="card" style={{ padding: 18 }}>
                  <div className="spread">
                    <strong>{r.name}</strong>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </div>
                  <div className="mono" style={{ marginTop: 6 }}>{formatDate(r.createdAt)}</div>
                  {r.reviewNote && <p className="muted" style={{ margin: '8px 0 0' }}>“{r.reviewNote}”</p>}
                  {r.status === 'approved' && r.club && (
                    <Link to={`/clubs/${r.club.slug}`} style={{ display: 'inline-block', marginTop: 8 }}>Visit club →</Link>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
