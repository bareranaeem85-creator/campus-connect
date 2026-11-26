import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowIcon } from '../components/ui';

export default function Home() {
  const { user } = useAuth();
  return (
    <section className="fade-up">
      <span className="label-pill">Hello, {user.name.split(' ')[0]}</span>
      <h1 className="page-title">Your department.<br />One place.</h1>
      <p className="lead">Clubs, discussions, official announcements and events for CS students.</p>
      <div className="row" style={{ marginTop: 28 }}>
        <Link to="/clubs" className="btn btn-primary btn-arrow">
          <span className="arrow"><ArrowIcon /></span>Explore clubs
        </Link>
      </div>
    </section>
  );
}
