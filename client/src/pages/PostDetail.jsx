import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import PostCard from '../components/PostCard';
import CommentThread, { CommentForm } from '../components/CommentThread';
import { Empty, Loader } from '../components/ui';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canModerate, isMember } = useAuth();
  const { toast, confirm } = useUI();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/posts/${id}`), api.get(`/posts/${id}/comments`)])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <Empty title="Post not found" text={error}><Link to="/" className="btn btn-primary">Go home</Link></Empty>;
  if (!post) return <Loader />;

  const isMod = canModerate(post.club._id);
  const canParticipate = isMod || isMember(post.club._id);

  const onAdded = (c) => {
    setComments((list) => [...list, c]);
    setPost((p) => ({ ...p, commentCount: p.commentCount + 1 }));
    toast(c.parent ? 'Reply posted' : 'Comment posted');
  };

  const onDelete = async (c) => {
    const ok = await confirm({ title: 'Delete comment?', message: 'This comment and all replies to it will be removed.' });
    if (!ok) return;
    try {
      const { deletedIds } = await api.del(`/comments/${c._id}`);
      setComments((list) => list.filter((x) => !deletedIds.includes(x._id)));
      setPost((p) => ({ ...p, commentCount: p.commentCount - deletedIds.length }));
      toast('Comment deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="narrow">
      <Link to={`/clubs/${post.club.slug}`} className="mono back-link">← {post.club.name}</Link>
      <div className="fade-up" style={{ marginTop: 16 }}>
        <PostCard post={post} full onChange={setPost} onDelete={() => navigate(`/clubs/${post.club.slug}`)} />
      </div>

      <section className="section fade-up" style={{ marginTop: 40 }}>
        <div className="section-head">
          <span className="label-pill">{post.commentCount} comment{post.commentCount === 1 ? '' : 's'}</span>
        </div>
        {canParticipate ? (
          <CommentForm postId={post._id} onAdded={onAdded} />
        ) : (
          <div className="notice">
            <Link to={`/clubs/${post.club.slug}`}>Join {post.club.name}</Link> to comment and reply.
          </div>
        )}
        <div style={{ marginTop: 24 }}>
          {comments.length === 0 ? (
            <Empty title="No comments yet" text="Start the conversation." />
          ) : (
            <CommentThread comments={comments} postId={post._id} isMod={isMod} canParticipate={canParticipate} onAdded={onAdded} onDelete={onDelete} />
          )}
        </div>
      </section>
    </div>
  );
}
