import { useState } from 'react';
import { api } from '../api/client';
import { useUI } from '../context/UIContext';
import FileUpload from './FileUpload';

const EMPTY = { type: 'text', title: '', body: '', url: '' };

/**
 * Create a text or link post. Pass `clubId` for a fixed club, or `clubs` to show a selector.
 * Calls onCreated(post) on success.
 */
export default function PostComposer({ clubId, clubs, onCreated, autoFocus }) {
  const { toast } = useUI();
  const [form, setForm] = useState({ ...EMPTY, club: clubId || clubs?.[0]?._id || '' });
  const [file, setFile] = useState(null); // uploaded attachment { _id, url, filename, size }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.club) return setError('Choose a club');
    if (!form.title.trim()) return setError('Title is required');
    if (form.type === 'text' && !form.body.trim() && !file) return setError('Write something or attach a file');
    if (form.type === 'link' && !/^https?:\/\/\S+\.\S+/.test(form.url)) return setError('Enter a valid URL starting with http(s)://');

    setBusy(true);
    try {
      const post = await api.post('/posts', { ...form, attachmentId: file?._id });
      toast('Post published');
      setForm({ ...EMPTY, club: form.club });
      setFile(null);
      onCreated?.(post);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form composer" onSubmit={submit}>
      <div className="spread">
        <div className="tabs" role="tablist" aria-label="Post type">
          {['text', 'link'].map((t) => (
            <button type="button" key={t} role="tab" aria-selected={form.type === t} className={`tab ${form.type === t ? 'active' : ''}`} onClick={() => setForm({ ...form, type: t })}>
              {t === 'text' ? 'Text' : 'Link'}
            </button>
          ))}
        </div>
        {clubs && (
          <select className="select composer-club" value={form.club} onChange={set('club')} aria-label="Club">
            {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <input className="input" placeholder="Title" maxLength={200} value={form.title} onChange={set('title')} autoFocus={autoFocus} aria-label="Title" />
      {form.type === 'link' && (
        <input className="input" placeholder="https://…" value={form.url} onChange={set('url')} aria-label="Link URL" />
      )}
      <textarea
        className="textarea"
        placeholder={form.type === 'link' ? 'Add context (optional)' : 'What do you want to discuss?'}
        maxLength={5000}
        value={form.body}
        onChange={set('body')}
        aria-label="Body"
      />
      <FileUpload value={file} onChange={setFile} label="Attach image or document" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Posting…' : 'Publish post'}</button>
      </div>
    </form>
  );
}
