// Small presentational building blocks shared across pages.

export const ArrowIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const LogoMark = ({ className = 'logo-mark' }) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="20" fill="#EB2F33" />
    <circle cx="26" cy="32" r="10" fill="none" stroke="#F3EFE7" strokeWidth="5" />
    <circle cx="38" cy="32" r="10" fill="none" stroke="#F3EFE7" strokeWidth="5" />
  </svg>
);

export const Loader = () => (
  <div className="loading-block" aria-label="Loading">
    <div className="spinner" />
  </div>
);

export const SkeletonList = ({ count = 3, height = 120 }) => (
  <div className="stack">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height }} />
    ))}
  </div>
);

export const Empty = ({ title, text, children }) => (
  <div className="empty fade-up">
    <h4>{title}</h4>
    {text && <p>{text}</p>}
    {children}
  </div>
);

export const Avatar = ({ name = '?', small }) => {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return <span className={`avatar ${small ? 'avatar-sm' : ''}`}>{initials}</span>;
};

export const PageHeader = ({ label, title, lead, children }) => (
  <header className="page-header fade-up">
    <div className="page-header-row">
      <div>
        {label && <span className="label-pill">{label}</span>}
        <h1 className="page-title">{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  </header>
);

export const Modal = ({ title, onClose, children }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
      <h3>{title}</h3>
      {children}
    </div>
  </div>
);
