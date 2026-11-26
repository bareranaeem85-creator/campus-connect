import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostComposer from '../components/PostComposer';
import { Empty, Loader, PageHeader } from '../components/ui';

/** Global "New post" page — choose one of your clubs, then write. */
export default function NewPost() {
  const { canModerate } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState(null);

  useEffect(() => {
    api.get('/clubs').then((all) => setClubs(all.filter((c) => c.isMember || canModerate(c._id)))).catch(() => setClubs([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="narrow">
      <PageHeader label="Create" title="New post" lead="Share a question, an idea or a useful link with one of your clubs." />
      {!clubs ? (
        <Loader />
      ) : clubs.length === 0 ? (
        <Empty title="Join a club first" text="You can post in clubs you are a member of.">
          <Link to="/clubs" className="btn btn-primary">Explore clubs</Link>
        </Empty>
      ) : (
        <div className="fade-up">
          <PostComposer clubs={clubs} autoFocus onCreated={(p) => navigate(`/posts/${p._id}`)} />
        </div>
      )}
    </div>
  );
}
