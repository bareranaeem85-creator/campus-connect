import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

/** Join / Leave toggle. Calls onChange(updatedClub) after the server confirms. */
export default function JoinButton({ club, onChange, small }) {
  const { refresh } = useAuth();
  const { toast, confirm } = useUI();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (club.isMember) {
      const ok = await confirm({ title: 'Leave club?', message: `You will stop seeing ${club.name} posts in your feed.`, confirmText: 'Leave' });
      if (!ok) return;
    }
    setBusy(true);
    try {
      const updated = await api.post(`/clubs/${club._id}/${club.isMember ? 'leave' : 'join'}`);
      onChange?.({ ...club, ...updated });
      toast(club.isMember ? `Left ${club.name}` : `Joined ${club.name}`);
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className={`btn ${small ? 'btn-sm' : ''} ${club.isMember ? 'btn-outline' : 'btn-primary'}`}
      onClick={toggle}
      disabled={busy}
    >
      {busy ? '…' : club.isMember ? 'Joined ✓' : 'Join'}
    </button>
  );
}
