import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import EventRow from '../components/EventRow';
import { ArrowIcon, Empty, Modal, PageHeader, SkeletonList } from '../components/ui';
import { toInputDate } from '../utils/format';

const EMPTY = { title: '', description: '', date: '', time: '', venue: '' };

/** Create / edit event (admins). */
function EventForm({ initial, onClose, onSaved }) {
  const { toast } = useUI();
  const [form, setForm] = useState(initial ? { ...initial, date: toInputDate(initial.date) } : EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const missing = Object.keys(EMPTY).filter((k) => !String(form[k]).trim());
    if (missing.length) return setError(`Please fill in: ${missing.join(', ')}`);
    setBusy(true);
    try {
      const payload = { title: form.title, description: form.description, date: form.date, time: form.time, venue: form.venue };
      const saved = initial ? await api.put(`/events/${initial._id}`, payload) : await api.post('/events', payload);
      toast(initial ? 'Event updated' : 'Event created');
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={initial ? 'Edit event' : 'New event'} onClose={onClose}>
      <form className="form" onSubmit={submit} style={{ marginTop: 16 }}>
        <div className="field"><label htmlFor="et">Title</label><input id="et" className="input" maxLength={150} value={form.title} onChange={set('title')} autoFocus /></div>
        <div className="field"><label htmlFor="ed">Description</label><textarea id="ed" className="textarea" maxLength={3000} value={form.description} onChange={set('description')} /></div>
        <div className="form-row">
          <div className="field"><label htmlFor="edate">Date</label><input id="edate" type="date" className="input" value={form.date} onChange={set('date')} /></div>
          <div className="field"><label htmlFor="etime">Time</label><input id="etime" type="time" className="input" value={form.time} onChange={set('time')} /></div>
        </div>
        <div className="field"><label htmlFor="ev">Venue</label><input id="ev" className="input" maxLength={150} value={form.venue} onChange={set('venue')} /></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Create event'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Events() {
  const { isAdmin } = useAuth();
  const { toast, confirm } = useUI();
  const [when, setWhen] = useState('upcoming');
  const [events, setEvents] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setEvents(null);
    api.get(`/events?when=${when}`).then(setEvents).catch((e) => toast(e.message, 'error'));
  };
  useEffect(load, [when]); // eslint-disable-line react-hooks/exhaustive-deps

  const replace = (e) => setEvents((l) => l.map((x) => (x._id === e._id ? e : x)));

  const toggleCancel = async (ev) => {
    const cancelling = ev.status !== 'cancelled';
    if (cancelling) {
      const ok = await confirm({ title: 'Cancel event?', message: `“${ev.title}” will be marked as cancelled for everyone.`, confirmText: 'Cancel event' });
      if (!ok) return;
    }
    try {
      replace(await api.patch(`/events/${ev._id}/status`, { status: cancelling ? 'cancelled' : 'scheduled' }));
      toast(cancelling ? 'Event cancelled' : 'Event restored');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async (ev) => {
    const ok = await confirm({ title: 'Delete event?', message: `“${ev.title}” will be permanently removed.` });
    if (!ok) return;
    try {
      await api.del(`/events/${ev._id}`);
      setEvents((l) => l.filter((x) => x._id !== ev._id));
      toast('Event deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <>
      <PageHeader label="Calendar" title="Events" lead="Department talks, workshops, hackathons and more.">
        {isAdmin && (
          <button className="btn btn-dark btn-arrow" onClick={() => setEditing('new')}>
            <span className="arrow"><ArrowIcon /></span>New event
          </button>
        )}
      </PageHeader>

      <div className="tabs fade-up" style={{ marginBottom: 28 }} role="tablist">
        {['upcoming', 'past'].map((w) => (
          <button key={w} role="tab" aria-selected={when === w} className={`tab ${when === w ? 'active' : ''}`} onClick={() => setWhen(w)}>{w}</button>
        ))}
      </div>

      {!events ? (
        <SkeletonList count={3} height={110} />
      ) : events.length === 0 ? (
        <Empty title={`No ${when} events`} text={when === 'upcoming' ? 'Check back soon for new events.' : 'Past events will show up here.'} />
      ) : (
        <div className="timeline stagger">
          {events.map((ev) => (
            <EventRow
              key={ev._id}
              event={ev}
              actions={
                isAdmin && (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(ev)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleCancel(ev)}>{ev.status === 'cancelled' ? 'Restore' : 'Cancel'}</button>
                    <button className="btn btn-ghost btn-sm danger-text" onClick={() => remove(ev)}>Delete</button>
                  </>
                )
              }
            />
          ))}
        </div>
      )}

      {editing && <EventForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={load} />}
    </>
  );
}
