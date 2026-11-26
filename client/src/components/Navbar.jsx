import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowIcon, Avatar, LogoMark } from './ui';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]); // close mobile menu on navigation

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/clubs', label: 'Clubs' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/events', label: 'Events' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="nav-wrap">
      <nav className="nav" aria-label="Main">
        <Link to="/" className="logo">
          <LogoMark />
          <span>Campus&nbsp;Connect</span>
        </Link>

        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end}>{l.label}</NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <Link to="/new-post" className="btn btn-primary btn-arrow hide-mobile">
            <span className="arrow"><ArrowIcon /></span>
            New post
          </Link>
          <Link to="/profile" title={`${user.name} — profile`} aria-label="Profile">
            <Avatar name={user.name} />
          </Link>
          <button className="btn btn-ghost btn-sm hide-mobile" onClick={handleLogout}>Log out</button>
          <button className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {open ? (
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M3 6h12M3 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="mobile-menu">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
          ))}
          <NavLink to="/new-post">+ New post</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <button onClick={handleLogout}>Log out</button>
        </div>
      )}
    </div>
  );
}
