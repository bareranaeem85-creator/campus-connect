import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from a saved token on first load.
  useEffect(() => {
    if (!tokenStore.get()) return setLoading(false);
    api
      .get('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  // The API client fires this when the server rejects our token (expired or account gone).
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('cc:session-expired', onExpired);
    return () => window.removeEventListener('cc:session-expired', onExpired);
  }, []);

  const handleAuth = ({ token, user: u }) => {
    tokenStore.set(token);
    setUser(u);
    return u;
  };

  const login = useCallback((email, password) => api.post('/auth/login', { email, password }).then(handleAuth), []);
  const register = useCallback((form) => api.post('/auth/register', form).then(handleAuth), []);
  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);
  // Re-fetch profile after actions that change memberships/moderation.
  const refresh = useCallback(() => api.get('/auth/me').then((d) => setUser(d.user)), []);

  const value = useMemo(() => {
    const isAdmin = user?.role === 'admin';
    return {
      user,
      loading,
      isAdmin,
      login,
      register,
      logout,
      refresh,
      setUser,
      /** Admins moderate everything; otherwise check the club's moderator list. */
      canModerate: (clubId) => isAdmin || !!user?.moderatorOf?.some((c) => c._id === clubId),
      isMember: (clubId) => !!user?.joinedClubs?.includes(clubId),
    };
  }, [user, loading, login, register, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
