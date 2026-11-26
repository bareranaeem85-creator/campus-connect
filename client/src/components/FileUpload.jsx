import { useRef, useState } from 'react';
import { api } from '../api/client';

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.ppt,.pptx,.txt';

/** Reads a File as a base64 data URL. */
const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });

export const formatSize = (bytes) => (bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

/**
 * "Choose file" control. Uploads immediately and reports the stored file via onChange(file | null).
 * `value` = { url, filename, size? } or null.
 */
export default function FileUpload({ value, onChange, label = 'Attach a file' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setError('');
    if (file.size > MAX_BYTES) return setError('File is too large (max 2 MB)');

    setBusy(true);
    try {
      const data = await readAsDataURL(file);
      const saved = await api.post('/uploads', { filename: file.name, mimetype: file.type || 'application/octet-stream', data });
      onChange(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="file-upload">
      <input ref={inputRef} type="file" accept={ACCEPT} onChange={pick} hidden />
      {value ? (
        <div className="file-chip">
          <span className="file-icon" aria-hidden="true">↥</span>
          <a href={value.url} target="_blank" rel="noopener noreferrer" className="file-name">{value.filename}</a>
          {value.size ? <span className="mono">{formatSize(value.size)}</span> : null}
          <button type="button" className="link-btn danger-text" onClick={() => onChange(null)}>Remove</button>
        </div>
      ) : (
        <button type="button" className="btn btn-outline btn-sm" onClick={() => inputRef.current.click()} disabled={busy}>
          {busy ? 'Uploading…' : `+ ${label}`}
        </button>
      )}
      <span className="field-hint">PDF, images, Word, PowerPoint or text · max 2 MB</span>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
