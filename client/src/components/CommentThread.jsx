import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Avatar } from './ui';
import { timeAgo } from '../utils/format';

/** Reply / comment form. */
export function CommentForm({ postId, parent, onAdded, onCancel, autoFocus, placeholder = 'Add a comment…' }) {
  const { toast } = useUI();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      const c = await api.post(`/posts/${postId}/comments`, { body, parent: parent || undefined });
      setBody('');
      onAdded(c);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={submit}>
      <textarea className="textarea" rows={parent ? 2 : 3} placeholder={placeholder} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} autoFocus={autoFocus} aria-label={placeholder} />
      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
        {onCancel && <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>}
        <button className="btn btn-primary btn-sm" disabled={busy || !body.trim()}>{busy ? 'Posting…' : parent ? 'Reply' : 'Comment'}</button>
      </div>
    </form>
  );
}

/** One comment and (recursively) its replies. */
function CommentNode({ node, depth, ctx }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const canDelete = ctx.isMod || node.author?._id === user._id;

  return (
    <div className="comment" style={{ '--depth': depth }}>
      <div className="comment-head">
        <Avatar name={node.author?.name || '?'} small />
        <strong className="small">{node.author?.name || 'Deleted user'}</strong>
        {node.author?.role === 'admin' && <span className="badge badge-dark">{node.author.adminTitle}</span>}
        <span className="mono">{timeAgo(node.createdAt)}</span>
      </div>
      {!collapsed && (
        <>
          <p className="comment-body">{node.body}</p>
          <div className="comment-actions">
            {ctx.canParticipate && <button className="link-btn" onClick={() => setReplying((r) => !r)}>Reply</button>}
            {node.children.length > 0 && (
              <button className="link-btn" onClick={() => setCollapsed(true)}>Hide {node.children.length} repl{node.children.length === 1 ? 'y' : 'ies'}</button>
            )}
            {canDelete && <button className="link-btn danger-text" onClick={() => ctx.onDelete(node)}>Delete</button>}
          </div>
          {replying && (
            <CommentForm
              postId={ctx.postId}
              parent={node._id}
              autoFocus
              placeholder={`Reply to ${node.author?.name?.split(' ')[0] || 'comment'}…`}
              onCancel={() => setReplying(false)}
              onAdded={(c) => {
                ctx.onAdded(c);
                setReplying(false);
              }}
            />
          )}
          {node.children.length > 0 && (
            <div className="replies">
              {node.children.map((child) => <CommentNode key={child._id} node={child} depth={depth + 1} ctx={ctx} />)}
            </div>
          )}
        </>
      )}
      {collapsed && <button className="link-btn" onClick={() => setCollapsed(false)}>Show thread</button>}
    </div>
  );
}

/** Builds a tree from the flat comment list (each comment points to its `parent`). */
export function buildTree(comments) {
  const byId = new Map(comments.map((c) => [c._id, { ...c, children: [] }]));
  const roots = [];
  byId.forEach((c) => (c.parent && byId.has(c.parent) ? byId.get(c.parent).children.push(c) : roots.push(c)));
  return roots;
}

export default function CommentThread({ comments, ...ctx }) {
  const tree = buildTree(comments);
  return (
    <div className="stack" style={{ gap: 4 }}>
      {tree.map((n) => <CommentNode key={n._id} node={n} depth={0} ctx={ctx} />)}
    </div>
  );
}
