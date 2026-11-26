import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { Loader } from './ui';

/** Thin mint bar showing how far the page has been scrolled. */
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" ref={ref} />;
}

/** Shell for all logged-in pages; redirects guests to /login. */
export default function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => window.scrollTo(0, 0), [location.pathname]);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="page">
        <div className="container" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </>
  );
}
