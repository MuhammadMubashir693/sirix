import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { FullScreenLoader } from '@/components/common/LoadingSpinner';

/** Redirects authenticated users away from public-only pages like /login. */
export function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) return <FullScreenLoader />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
