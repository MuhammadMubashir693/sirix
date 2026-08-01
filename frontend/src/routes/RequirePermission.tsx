import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface RequirePermissionProps {
  permission: string;
}

/** Redirects to /unauthorized unless the current user's role has the given permission (Admin role always passes). */
export function RequirePermission({ permission }: RequirePermissionProps) {
  const user = useAuthStore((s) => s.user);

  if (!user?.role) return <Navigate to="/unauthorized" replace />;

  const isAdmin = user.role.name === 'Admin';
  const hasPermission = user.role.permissions?.some((p) => p.key === permission);

  if (!isAdmin && !hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
