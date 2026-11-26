import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { timeAgo } from '../utils/format';

const Chevron = ({ up }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path d={up ? 'M3 9l4-4 4 4' : 'M3 5l4 4 4-4'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Reddit-style post row: vote column, title, mono meta line, actions.
 * `onChange(post)` after vote/pin/bookmark; `onDelete(id)` after delete.
 * `full` renders the complete body (post detail page).
 */
export default function PostCard({ post, onChange, onDelete, showClub = true, full = false }) {
  const { user, canModerate } = useAuth();
  const { toast, confirm } = useUI();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const isMod = canModerate(post.club._id);
  const isAuthor = post.author?._id === user._id;

  const run = async (fn, okMsg) => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await fn();
      if (updated) onChange?.(updated);
      if (okMsg) toast(okMsg);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const vote = (v) => run(() => api.post(`/posts/${post._id}/vote`, { value: post.myVote === v ? 0 : v }));
  const bookmark = () => run(() => api.post(`/posts/${post._id}/bookmark`), post.bookmarked ? 'Removed from saved' : 'Saved');
  const pin = () => run(() => api.patch(`/posts/${post._id}/pin`), post.pinned ? 'Post unpinned' : 'Post pinned to top');
  const remove = async () => {
    const ok = await confirm({ title: 'Delete post?', message: 'The post and all its comments will be removed.' });
    if (!ok) return;
    run(async () => {
      await api.del(`/posts/${post._id}`);
      onDelete?.(post._id);
      return null;
    }, 'Post deleted');
  };

  const href = `/posts/${post._id}`;

  return (
    <article className={`card post ${post.pinned ? 'post-pinned' : ''} ${full ? '' : 'card-hover'}`}>
      <div className="vote-col" aria-label="Votes">
        <button className={`vote-btn ${post.myVote === 1 ? 'up' : ''}`} onClick={() => vote(1)} aria-label="Upvote" aria-pressed={post.myVote === 1}><Chevron up /></button>
        <span className="vote-score">{post.score}</span>
        <button className={`vote-btn ${post.myVote === -1 ? 'down' : ''}`} onClick={() => vote(-1)} aria-label="Downvote" aria-pressed={post.myVote === -1}><Chevron /></button>
      </div>

      <div className="post-main">
        <div className="mono post-meta">
          {post.pinned && <span className="badge badge-accent">Pinned</span>}
          {showClub && (
            <>
              <Link to={`/clubs/${post.club.slug}`} className="post-club">{post.club.name}</Link>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{post.author?.name || 'Deleted user'}</span>
          {post.author?.role === 'admin' && <span className="badge badge-dark">{post.author.adminTitle}</span>}
          <span>· {timeAgo(post.createdAt)}</span>
        </div>

        {full ? (
          <h1 className="post-title-full">{post.title}</h1>
        ) : (
          <h3 className="post-title"><Link to={href}>{post.title}</Link></h3>
        )}

        {post.type === 'link' && (
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">
            {post.url.replace(/^https?:\/\//, '').slice(0, 60)} ↗
          </a>
        )}
        {post.body && <p className={`post-body ${full ? 'full' : ''}`}>{post.body}</p>}

        {post.attachment?.url && (
          post.attachment.mimetype?.startsWith('image/') ? (
            <a href={post.attachment.url} target="_blank" rel="noopener noreferrer" className={`post-image ${full ? 'full' : ''}`}>
              <img src={post.attachment.url} alt={post.attachment.filename} loading="lazy" />
            </a>
          ) : (
            <a href={post.attachment.url} target="_blank" rel="noopener noreferrer" className="file-chip file-chip-link">
              <span className="file-icon" aria-hidden="true">↓</span>
              <span className="file-name">{post.attachment.filename}</span>
            </a>
          )
        )}

        <div className="post-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(href)}>
            {post.commentCount} comment{post.commentCount === 1 ? '' : 's'}
          </button>
          <button className={`btn btn-ghost btn-sm ${post.bookmarked ? 'is-on' : ''}`} onClick={bookmark} aria-pressed={post.bookmarked}>
            {post.bookmarked ? 'Saved' : 'Save'}
          </button>
          {isMod && (
            <button className="btn btn-ghost btn-sm" onClick={pin}>{post.pinned ? 'Unpin' : 'Pin'}</button>
          )}
          {(isMod || isAuthor) && (
            <button className="btn btn-ghost btn-sm danger-text" onClick={remove}>Delete</button>
          )}
        </div>
      </div>
    </article>
  );
}
