import {Navigate} from 'react-router-dom';
import {ReactNode} from 'react';
import {useAuthStore} from '../store/useAuthStore';

export default function ProtectedRoute({children, adminOnly = false}: {children: ReactNode; adminOnly?: boolean}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}
