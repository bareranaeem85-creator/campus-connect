import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import AnnouncementRow from '../components/AnnouncementRow';
import FileUpload from '../components/FileUpload';
import { ArrowIcon, Empty, Modal, PageHeader, SkeletonList } from '../components/ui';

const EMPTY = { title: '', body: '', link: '', attachmentUrl: '', attachmentName: '' };
const isUploaded = (url) => url?.startsWith('/api/uploads/');
const URL_RE = /^https?:\/\/\S+\.\S+/;

/** Create / edit form (admins). */
function AnnouncementForm({ initial, onClose, onSaved }) {
  const { toast } = useUI();
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return setError('Title and text are required');
    if (form.link && !URL_RE.test(form.link)) return setError('Link must start with http(s)://');
    if (form.attachmentUrl && !isUploaded(form.attachmentUrl) && !URL_RE.test(form.attachmentUrl)) {
      return setError('Attachment link must start with http(s)://');
    }
    setBusy(true);
    try {
      const { title, body, link, attachmentUrl, attachmentName } = form;
      const payload = { title, body, link, attachmentUrl, attachmentName };
      const saved = initial ? await api.put(`/announcements/${initial._id}`, payload) : await api.post('/announcements', payload);
      toast(initial ? 'Announcement updated' : 'Announcement published');
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={initial ? 'Edit announcement' : 'New announcement'} onClose={onClose}>
      <form className="form" onSubmit={submit} style={{ marginTop: 16 }}>
        <div className="field"><label htmlFor="at">Title</label><input id="at" className="input" maxLength={200} value={form.title} onChange={set('title')} autoFocus /></div>
        <div className="field"><label htmlFor="ab">Text</label><textarea id="ab" className="textarea" maxLength={5000} value={form.body} onChange={set('body')} /></div>
        <div className="field"><label htmlFor="al">Link (optional)</label><input id="al" className="input" placeholder="https://…" value={form.link} onChange={set('link')} /></div>
        <div className="field">
          <label>Attachment (optional)</label>
          {isUploaded(form.attachmentUrl) || !form.attachmentUrl ? (
            <FileUpload
              value={form.attachmentUrl ? { url: form.attachmentUrl, filename: form.attachmentName || 'Attached file' } : null}
              onChange={(f) => setForm({ ...form, attachmentUrl: f?.url || '', attachmentName: f?.filename || '' })}
            />
          ) : null}
          {!isUploaded(form.attachmentUrl) && (
            <input className="input" placeholder="…or paste a file link: https://" value={form.attachmentUrl} onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value, attachmentName: '' })} aria-label="Attachment link" />
          )}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Publish'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Announcements() {
  const { isAdmin } = useAuth();
  const { toast, confirm } = useUI();
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | announcement

  useEffect(() => {
    api.get('/announcements').then(setList).catch((e) => toast(e.message, 'error'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSaved = (a) =>
    setList((l) => (l.some((x) => x._id === a._id) ? l.map((x) => (x._id === a._id ? a : x)) : [a, ...l]));

  const remove = async (a) => {
    const ok = await confirm({ title: 'Delete announcement?', message: `“${a.title}” will be removed for everyone.` });
    if (!ok) return;
    try {
      await api.del(`/announcements/${a._id}`);
      setList((l) => l.filter((x) => x._id !== a._id));
      toast('Announcement deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <>
      <PageHeader label="Department" title="Announcements" lead="Official updates from the HOD, Head CR and Head GR.">
        {isAdmin && (
          <button className="btn btn-dark btn-arrow" onClick={() => setEditing('new')}>
            <span className="arrow"><ArrowIcon /></span>New announcement
          </button>
        )}
      </PageHeader>

      {!list ? (
        <SkeletonList count={3} height={130} />
      ) : list.length === 0 ? (
        <Empty title="No announcements yet" text="Official department updates will appear here." />
      ) : (
        <div className="ann-list stagger">
          {list.map((a) => (
            <AnnouncementRow
              key={a._id}
              a={a}
              actions={
                isAdmin && (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(a)}>Edit</button>
                    <button className="btn btn-ghost btn-sm danger-text" onClick={() => remove(a)}>Delete</button>
                  </>
                )
              }
            />
          ))}
        </div>
      )}

      {editing && (
        <AnnouncementForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={onSaved} />
      )}
    </>
  );
}
