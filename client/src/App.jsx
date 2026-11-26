import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAdmin from './components/RequireAdmin';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Clubs from './pages/Clubs';
import ClubPage from './pages/ClubPage';
import RequestClub from './pages/RequestClub';
import Admin from './pages/Admin';
import PostDetail from './pages/PostDetail';
import NewPost from './pages/NewPost';
import Announcements from './pages/Announcements';
import Events from './pages/Events';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      {/* Everything inside Layout requires login */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:slug" element={<ClubPage />} />
        <Route path="/request-club" element={<RequestClub />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/new-post" element={<NewPost />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/events" element={<Events />} />
        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
