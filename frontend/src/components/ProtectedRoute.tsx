import {Navigate} from 'react-router-dom';
import {ReactNode} from 'react';
import {useAuthStore} from '../store/useAuthStore';

export default function ProtectedRoute({children}: {children: ReactNode}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
