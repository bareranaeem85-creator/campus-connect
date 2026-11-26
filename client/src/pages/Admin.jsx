import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Empty, Modal, PageHeader, SkeletonList } from '../components/ui';
import { formatDate } from '../utils/format';

/* ---------------- Club requests ---------------- */
function RequestsPanel() {
  const { toast, confirm } = useUI();
  const [requests, setRequests] = useState(null);
  const [status, setStatus] = useState('pending');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setRequests(null);
    api.get(`/club-requests${status === 'all' ? '' : `?status=${status}`}`).then(setRequests).catch((e) => toast(e.message, 'error'));
  };
  useEffect(load, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const review = async (r, action) => {
    if (action === 'reject') {
      const ok = await confirm({ title: 'Reject request?', message: `“${r.name}” will be marked as rejected.`, confirmText: 'Reject' });
      if (!ok) return;
    }
    setBusyId(r._id);
    try {
      await api.post(`/club-requests/${r._id}/${action}`);
      toast(action === 'approve' ? `“${r.name}” approved — club created` : `“${r.name}” rejected`);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="fade-up">
      <div className="section-head">
        <h2 className="section-title">Club requests</h2>
        <div className="tabs">
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
            <button key={s} className={`tab ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      {!requests ? (
        <SkeletonList count={2} height={70} />
      ) : requests.length === 0 ? (
        <Empty title="Nothing here" text={`No ${status === 'all' ? '' : status} requests.`} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Club</th><th>Requested by</th><th>Reason</th><th>Date</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td data-label="Club"><strong>{r.name}</strong><div className="muted small">{r.description}</div></td>
                  <td data-label="Requested by">{r.requestedBy?.name}</td>
                  <td data-label="Reason" className="small">{r.reason}</td>
                  <td data-label="Date" className="mono">{formatDate(r.createdAt)}</td>
                  <td data-label="Status">
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                    {r.reviewedBy && <div className="mono" style={{ marginTop: 4 }}>by {r.reviewedBy.adminTitle}</div>}
                  </td>
                  <td className="table-actions">
                    {r.status === 'pending' && (
                      <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                        <button className="btn btn-primary btn-sm" disabled={busyId === r._id} onClick={() => review(r, 'approve')}>Approve</button>
                        <button className="btn btn-danger btn-sm" disabled={busyId === r._id} onClick={() => review(r, 'reject')}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ---------------- Moderators ---------------- */
function AssignModeratorModal({ club, onClose, onAssigned }) {
  const { toast } = useUI();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => api.get(`/users?q=${encodeURIComponent(query)}`).then(setUsers).catch(() => {}), 200);
    return () => clearTimeout(t);
  }, [query]);

  const assign = async (u) => {
    try {
      const updated = await api.post(`/clubs/${club._id}/moderators`, { userId: u._id });
      toast(`${u.name} is now a moderator of ${club.name}`);
      onAssigned(updated);
      onClose();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const current = new Set(club.moderators.map((m) => m._id));
  return (
    <Modal title={`Assign moderator · ${club.name}`} onClose={onClose}>
      <input className="input" autoFocus placeholder="Search students by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="stack" style={{ gap: 6, marginTop: 12, maxHeight: 300, overflowY: 'auto' }}>
        {users.length === 0 && <p className="muted">No students found.</p>}
        {users.map((u) => (
          <div key={u._id} className="spread demo-item" style={{ cursor: 'default' }}>
            <div><strong>{u.name}</strong><div className="mono">{u.email}</div></div>
            {current.has(u._id) ? (
              <span className="badge badge-outline">Moderator</span>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => assign(u)}>Assign</button>
            )}
          </div>
        ))}
      </div>
      <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

function ModeratorsPanel() {
  const { toast, confirm } = useUI();
  const { refresh } = useAuth();
  const [clubs, setClubs] = useState(null);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => { api.get('/clubs').then(setClubs).catch((e) => toast(e.message, 'error')); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const replace = (c) => setClubs((list) => list.map((x) => (x._id === c._id ? { ...x, ...c } : x)));

  const remove = async (club, mod) => {
    const ok = await confirm({ title: 'Remove moderator?', message: `${mod.name} will no longer moderate ${club.name}.`, confirmText: 'Remove' });
    if (!ok) return;
    try {
      replace(await api.del(`/clubs/${club._id}/moderators/${mod._id}`));
      toast(`${mod.name} removed as moderator`);
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <section className="section fade-up">
      <div className="section-head"><h2 className="section-title">Club moderators</h2></div>
      {!clubs ? (
        <SkeletonList count={3} height={60} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Club</th><th>Members</th><th>Moderators</th><th /></tr></thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c._id}>
                  <td data-label="Club">
                    <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
                      <span className="dot-blob" style={{ background: c.color }} />
                      <Link to={`/clubs/${c.slug}`}><strong>{c.name}</strong></Link>
                    </div>
                  </td>
                  <td data-label="Members" className="mono">{c.memberCount}</td>
                  <td data-label="Moderators">
                    <div className="row" style={{ gap: 6 }}>
                      {c.moderators.length === 0 && <span className="muted small">None</span>}
                      {c.moderators.map((m) => (
                        <span key={m._id} className="chip">
                          {m.name}
                          <button aria-label={`Remove ${m.name}`} onClick={() => remove(c, m)}>×</button>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="table-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => setAssigning(c)}>+ Assign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {assigning && (
        <AssignModeratorModal club={assigning} onClose={() => setAssigning(null)} onAssigned={(c) => { replace(c); refresh(); }} />
      )}
    </section>
  );
}

export default function Admin() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader label={`Admin · ${user.adminTitle}`} title="Admin panel" lead="Review club requests and assign moderators. Announcements and events are managed on their own pages.">
        <Link to="/announcements" className="btn btn-outline">Announcements</Link>
        <Link to="/events" className="btn btn-outline">Events</Link>
      </PageHeader>
      <RequestsPanel />
      <ModeratorsPanel />
    </>
  );
}
