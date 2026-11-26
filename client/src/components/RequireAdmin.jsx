import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Blocks non-admins on the client. The API enforces the same rule with requireAdmin middleware. */
export default function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/" replace />;
}
