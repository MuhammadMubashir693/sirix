import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { FullScreenLoader } from '@/components/common/LoadingSpinner';

/** Redirects to /login (preserving the intended destination) unless the user is authenticated. */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const location = useLocation();

  if (isInitializing) return <FullScreenLoader label="Checking your session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
