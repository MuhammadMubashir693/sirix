import { NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Users', to: '/admin/users' },
  { label: 'Roles', to: '/admin/roles' },
  { label: 'Permissions', to: '/admin/permissions' },
  { label: 'Sessions', to: '/admin/sessions' },
  { label: 'Audit Logs', to: '/admin/audit-logs' },
  { label: 'Settings', to: '/admin/settings' },
];

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Admin</h1>
          <p className="text-sm text-ink-500">Manage users, roles, permissions, and system configuration.</p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
