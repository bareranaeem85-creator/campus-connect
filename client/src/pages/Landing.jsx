import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import HeroBackground from '../components/HeroBackground';
import CrystalizedBall from '../components/CrystalizedBall/CrystalizedBall';
import CountUp from '../components/CountUp';
import { ArrowIcon, LogoMark } from '../components/ui';
import useReveal from '../hooks/useReveal';
import landingMedia from '../data/landingMedia';
import { formatTime } from '../utils/format';

/* Simple line icons for the feature blocks */
const Icon = ({ d }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICONS = {
  clubs: 'M17 20v-2a4 4 0 0 0-3-3.87M7 20v-2a4 4 0 0 1 3-3.87M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8a3 3 0 1 1-3-3M4 8a3 3 0 1 0 3-3',
  talk: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12zM8 11h8M8 14h5',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12',
  calendar: 'M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 13h3v3H8z',
};

const FEATURES = [
  { icon: 'clubs', title: 'Clubs', text: 'Explore topic-based clubs, join the ones you love, or request a brand-new one for admins to approve.' },
  { icon: 'talk', title: 'Discussions', text: 'Every club has its own feed: text and link posts, images and documents, threaded replies, votes and pins.' },
  { icon: 'megaphone', title: 'Announcements', text: 'Official updates from the HOD, Head CR and Head GR — with links, attachments and exact publish time.' },
  { icon: 'calendar', title: 'Events', text: 'A clean department calendar with upcoming and past events. Cancellations are flagged instantly.' },
];

const ROLES = [
  { name: 'Student', tag: 'Everyone', points: ['Join & leave clubs', 'Post, comment & reply', 'Vote, save & share files', 'Request new clubs'] },
  { name: 'Moderator', tag: 'Per club', points: ['Everything students do', 'Pin important posts', 'Remove posts & comments', 'Only in their assigned clubs'] },
  { name: 'Admin', tag: 'HOD · Head CR · Head GR', points: ['Approve / reject club requests', 'Assign club moderators', 'Publish announcements', 'Create, edit & cancel events'] },
];

const LIFE_POINTS = [
  { title: 'Find your people', text: 'From AI to cyber security, there is a club for every interest — or start your own.' },
  { title: 'Grow your network', text: 'Meet seniors, project partners and alumni who have walked the same path.' },
  { title: 'Never miss a moment', text: 'Hackathons, workshops and meetups, all in one calendar.' },
];

const TICKER = ['Clubs', 'Discussions', 'Announcements', 'Events', 'Hackathons', 'Workshops', 'Study groups', 'Societies'];

function LandingNav() {
  return (
    <div className="nav-wrap">
      <nav className="nav" aria-label="Main">
        <a href="#top" className="logo"><LogoMark /><span>Campus&nbsp;Connect</span></a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#campus-life">Campus life</a></li>
          <li><a href="#events">Events</a></li>
          <li><a href="#roles">Roles</a></li>
        </ul>
        <div className="nav-right">
          <Link to="/login" className="btn btn-ghost btn-sm landing-login">Log in</Link>
          <Link to="/register" className="btn btn-primary btn-arrow">
            <span className="arrow"><ArrowIcon /></span>Join
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function Landing() {
  const rootRef = useRef(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/stats/public').then(setData).catch(() => setData({ stats: null, clubs: [], events: [] }));
  }, []);
  useReveal(rootRef, [data]);

  const stats = data?.stats;

  return (
    <div className="landing" ref={rootRef} id="top">
      <LandingNav />

      {/* ---------- Hero ---------- */}
      <header className="landing-hero">
        <HeroBackground />
        <div className="container landing-hero-inner">
          <span className="label-pill fade-up">CS Department · Community platform</span>
          <h1 className="landing-title fade-up" style={{ animationDelay: '0.08s' }}>
            Your department.<br /><span className="hero-accent">One place.</span>
          </h1>
          <p className="lead landing-lead fade-up" style={{ animationDelay: '0.16s' }}>
            Clubs, discussions, official announcements and the event calendar — one home for every CS student.
          </p>
          <div className="row fade-up" style={{ marginTop: 32, animationDelay: '0.24s' }}>
            <Link to="/register" className="btn btn-primary btn-arrow btn-lg"><span className="arrow"><ArrowIcon /></span>Join Campus Connect</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Log in</Link>
          </div>
          <dl className="landing-stats fade-up" style={{ animationDelay: '0.32s' }}>
            {[['Clubs', stats?.clubs], ['Members', stats?.members], ['Posts', stats?.posts], ['Upcoming events', stats?.upcomingEvents]].map(([label, value]) => (
              <div key={label}>
                <dd><CountUp value={value} /></dd>
                <dt className="mono">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <a href="#features" className="scroll-cue mono" aria-label="Scroll to features">Scroll ↓</a>
      </header>

      {/* ---------- Ticker ---------- */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER, ...TICKER, ...TICKER].map((w, i) => (
            <span key={i}>{w}<b>✦</b></span>
          ))}
        </div>
      </div>

      {/* ---------- Features ---------- */}
      <section className="container landing-section" id="features">
        <div className="reveal">
          <span className="label-pill">What's inside</span>
          <h2 className="landing-h2">Everything the department<br />needs. Nothing it doesn't.</h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <article key={f.title} className="feature reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="feature-top">
                <span className="feature-icon"><Icon d={ICONS[f.icon]} /></span>
                <span className="mono">0{i + 1}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="muted">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Campus life (crystal ball) ---------- */}
      <section className="landing-band" id="campus-life">
        <div className="container life-grid">
          <div className="reveal">
            <span className="label-pill">Campus life</span>
            <h2 className="landing-h2">More than classes.<br /><span className="hero-accent">Find your circle.</span></h2>
            <p className="lead" style={{ marginTop: 20 }}>
              University is the people you meet along the way. Campus Connect brings every club, every idea and every event in the CS department together.
            </p>
            <ul className="life-list">
              {LIFE_POINTS.map((p) => (
                <li key={p.title}>
                  <strong>{p.title}</strong>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="life-orb reveal" style={{ transitionDelay: '120ms' }} aria-hidden="true">
            <CrystalizedBall preset="plasma" color="#639CC5" size={0.7} crackle={0.85} fill={0.5} interactive hoverStrength={0.7} />
          </div>
        </div>
      </section>

      {/* ---------- Clubs (live) ---------- */}
      {data?.clubs?.length > 0 && (
        <section className="container landing-section">
          <div className="reveal spread" style={{ alignItems: 'flex-end' }}>
            <div>
              <span className="label-pill">Live from the platform</span>
              <h2 className="landing-h2">Find your people.</h2>
            </div>
            <Link to="/register" className="btn btn-outline">Join a club →</Link>
          </div>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {data.clubs.map((c, i) => (
              <article key={c.slug} className="card club-card card-hover reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <div className="blob" style={{ background: c.color }}>{c.name[0]}</div>
                <h3 className="club-card-title">{c.name}</h3>
                <p className="muted club-card-desc">{c.description}</p>
                <div className="club-card-foot"><span className="mono">{c.memberCount} members</span></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Upcoming events (live) ---------- */}
      <section className="container landing-section" id="events">
        <div className="reveal">
          <span className="label-pill">Upcoming</span>
          <h2 className="landing-h2">What's happening next.</h2>
        </div>
        {data?.events?.length ? (
          <div className="timeline" style={{ marginTop: 32 }}>
            {data.events.map((e, i) => {
              const d = new Date(e.date);
              return (
                <div key={e._id} className="event-row reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="event-date">
                    <span className="event-day">{String(d.getDate()).padStart(2, '0')}</span>
                    <span className="mono">{d.toLocaleDateString('en-GB', { month: 'short' })} · {d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                  </div>
                  <div className="event-info">
                    <h3 className="event-title">{e.title}</h3>
                    <div className="mono event-where">{formatTime(e.time)} · {e.venue}</div>
                  </div>
                  <Link to="/login" className="btn btn-ghost btn-sm event-actions">Details →</Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted reveal" style={{ marginTop: 24 }}>New events are announced soon — log in to see the full calendar.</p>
        )}
      </section>

      {/* ---------- Media gallery (shown once photos/videos are added) ---------- */}
      {landingMedia.length > 0 && (
        <section className="container landing-section" id="gallery">
          <div className="reveal">
            <span className="label-pill">Life at CS</span>
            <h2 className="landing-h2">Moments from the department.</h2>
          </div>
          <div className="media-grid">
            {landingMedia.map((m, i) => (
              <figure key={m.src} className={`media-item reveal ${i === 0 ? 'media-wide' : ''}`} style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                {m.type === 'video' ? (
                  <video src={m.src} poster={m.poster} autoPlay muted loop playsInline />
                ) : (
                  <img src={m.src} alt={m.caption || ''} loading="lazy" />
                )}
                {m.caption && <figcaption className="mono">{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Roles ---------- */}
      <section className="container landing-section" id="roles">
        <div className="reveal">
          <span className="label-pill">Who does what</span>
          <h2 className="landing-h2">Three roles. Clear powers.</h2>
        </div>
        <div className="roles-grid">
          {ROLES.map((r, i) => (
            <article key={r.name} className={`role-card reveal ${i === 2 ? 'role-admin' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="mono">{r.tag}</span>
              <h3 className="role-name">{r.name}</h3>
              <ul>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="cta-band reveal">
        <div className="container cta-inner">
          <h2 className="cta-title">Ready to join<br />your department?</h2>
          <div className="row">
            <Link to="/register" className="btn btn-dark btn-arrow btn-lg"><span className="arrow"><ArrowIcon /></span>Create your account</Link>
            <Link to="/login" className="btn btn-outline-light btn-lg">Log in</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container spread">
          <span className="mono">Campus Connect · CS Department</span>
          <span className="mono">Clubs · Discussions · Announcements · Events</span>
        </div>
      </footer>
    </div>
  );
}
