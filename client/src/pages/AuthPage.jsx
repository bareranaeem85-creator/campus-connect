import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { ArrowIcon, LogoMark } from '../components/ui';

// Seeded demo accounts (see server/src/seed/seedData.js).
const DEMO_ACCOUNTS = [
  { role: 'Admin · HOD', email: 'hod@campus.edu' },
  { role: 'Admin · Head CR', email: 'headcr@campus.edu' },
  { role: 'Admin · Head GR', email: 'headgr@campus.edu' },
  { role: 'Moderator', email: 'moderator@campus.edu' },
  { role: 'Student', email: 'ali@campus.edu' },
  { role: 'Student', email: 'fatima@campus.edu' },
];
const DEMO_PASSWORD = 'password123';

export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const { user, login, register } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = isLogin ? await login(form.email, form.password) : await register(form);
      toast(`Welcome${isLogin ? ' back' : ''}, ${u.name.split(' ')[0]}!`);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-side">
        <span className="ring" style={{ width: 520, height: 520, right: -180, bottom: -200 }} />
        <span className="ring" style={{ width: 340, height: 340, right: -90, bottom: -110 }} />
        <Link to="/" className="logo"><LogoMark /> Campus Connect</Link>
        <div className="fade-up">
          <span className="mono" style={{ color: 'var(--accent)' }}>CS Department · Community</span>
          <h1 style={{ marginTop: 16 }}>
            Your department.<br /><span className="accent">One place.</span>
          </h1>
        </div>
        <p className="mono" style={{ color: 'var(--muted)', margin: 0 }}>Clubs · Discussions · Announcements · Events</p>
      </aside>

      <main className="auth-main">
        <div className="auth-box fade-up">
          <span className="label-pill">{isLogin ? 'Welcome back' : 'Join the community'}</span>
          <h2>{isLogin ? 'Log in' : 'Create account'}</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            {isLogin ? 'New here? ' : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link>
          </p>

          <form className="form" onSubmit={submit} noValidate>
            {!isLogin && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" className="input" value={form.name} onChange={set('name')} required autoComplete="name" />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} autoComplete={isLogin ? 'current-password' : 'new-password'} />
              {!isLogin && <span className="field-hint">At least 6 characters.</span>}
            </div>
            {error && <p style={{ color: 'var(--danger)', margin: 0 }} role="alert">{error}</p>}
            <button className="btn btn-dark btn-arrow btn-block" disabled={busy} style={{ justifyContent: 'space-between' }}>
              <span className="arrow"><ArrowIcon /></span>
              <span style={{ flex: 1, textAlign: 'center' }}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</span>
            </button>
          </form>

          {isLogin && (
            <div style={{ marginTop: 32 }}>
              <span className="mono">Demo logins · password: {DEMO_PASSWORD}</span>
              <div className="demo-list">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    type="button"
                    key={a.email}
                    className="demo-item"
                    onClick={() => setForm({ ...form, email: a.email, password: DEMO_PASSWORD })}
                  >
                    <strong>{a.email}</strong>
                    <span className="badge badge-outline">{a.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
