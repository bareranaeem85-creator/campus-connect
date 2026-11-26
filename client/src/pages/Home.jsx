import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import AnnouncementRow from '../components/AnnouncementRow';
import EventRow from '../components/EventRow';
import { ArrowIcon, Empty, SkeletonList } from '../components/ui';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [events, setEvents] = useState(null);

  useEffect(() => {
    // Load each section independently so one slow call doesn't block the page.
    api.get('/stats').then(setStats).catch(() => {});
    api.get('/posts/feed').then(setFeed).catch(() => setFeed([]));
    api.get('/announcements?limit=3').then(setAnnouncements).catch(() => setAnnouncements([]));
    api.get('/events?when=upcoming&limit=3').then(setEvents).catch(() => setEvents([]));
  }, []);

  const updatePost = (p) => setFeed((l) => l.map((x) => (x._id === p._id ? p : x)));
  const removePost = (id) => setFeed((l) => l.filter((x) => x._id !== id));

  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="fade-up">
          <span className="label-pill">Hello, {user.name.split(' ')[0]}</span>
          <h1 className="hero-title">Your department.<br /><span className="hero-accent">One place.</span></h1>
          <p className="lead">Clubs, discussions, official announcements and the event calendar — built for CS students.</p>
          <div className="row" style={{ marginTop: 28 }}>
            <Link to="/clubs" className="btn btn-primary btn-arrow"><span className="arrow"><ArrowIcon /></span>Explore clubs</Link>
            <Link to="/events" className="btn btn-outline">View events</Link>
          </div>
        </div>
        <dl className="hero-stats fade-up" style={{ animationDelay: '0.15s' }}>
          {[
            ['Clubs', stats?.clubs],
            ['Members', stats?.members],
            ['Upcoming events', stats?.upcomingEvents],
          ].map(([label, value]) => (
            <div key={label} className="stat">
              <dd>{value ?? '—'}</dd>
              <dt className="mono">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="two-col section">
        {/* ---- Feed from joined clubs ---- */}
        <section>
          <div className="section-head">
            <span className="label-pill">Your clubs</span>
            <Link to="/new-post" className="mono">+ New post</Link>
          </div>
          {!feed ? (
            <SkeletonList count={3} height={140} />
          ) : feed.length === 0 ? (
            <Empty title="Your feed is empty" text="Join clubs to see their latest discussions here.">
              <Link to="/clubs" className="btn btn-primary">Find clubs</Link>
            </Empty>
          ) : (
            <div className="stack stagger">
              {feed.map((p) => <PostCard key={p._id} post={p} onChange={updatePost} onDelete={removePost} />)}
            </div>
          )}
        </section>

        {/* ---- Sidebar ---- */}
        <aside className="stack" style={{ gap: 40 }}>
          <section className="fade-up">
            <div className="section-head">
              <span className="label-pill">Latest</span>
              <Link to="/announcements" className="mono">All →</Link>
            </div>
            {!announcements ? (
              <SkeletonList count={2} height={90} />
            ) : announcements.length === 0 ? (
              <p className="muted">No announcements yet.</p>
            ) : (
              <div className="card side-card">
                {announcements.map((a) => <AnnouncementRow key={a._id} a={a} compact />)}
              </div>
            )}
          </section>

          <section className="fade-up">
            <div className="section-head">
              <span className="label-pill">Upcoming</span>
              <Link to="/events" className="mono">Calendar →</Link>
            </div>
            {!events ? (
              <SkeletonList count={2} height={70} />
            ) : events.length === 0 ? (
              <p className="muted">No upcoming events.</p>
            ) : (
              <div className="card side-card">
                {events.map((e) => <EventRow key={e._id} event={e} compact />)}
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
