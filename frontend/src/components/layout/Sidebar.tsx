import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Hash,
  Stethoscope,
  Wallet,
  FileBarChart,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

// Items beyond Dashboard route to placeholder paths; they'll light up as later modules ship.
const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Relationship Performance', to: '/relationship-performance', icon: Activity, disabled: true },
  { label: 'Numbering', to: '/numbering', icon: Hash, disabled: true },
  { label: 'Diagnostics', to: '/diagnostics', icon: Stethoscope, disabled: true },
  { label: 'Accounting', to: '/accounting', icon: Wallet, disabled: true },
  { label: 'Reports', to: '/reports', icon: FileBarChart, disabled: true },
  { label: 'Admin', to: '/admin', icon: ShieldCheck },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600">
              <svg viewBox="0 0 32 32" className="size-4" fill="none">
                <rect x="4" y="16" width="4" height="9" rx="1" fill="white" />
                <rect x="14" y="10" width="4" height="15" rx="1" fill="white" />
                <rect x="24" y="4" width="4" height="21" rx="1" fill="white" fillOpacity="0.85" />
              </svg>
            </div>
            <span className="font-display text-base font-semibold text-ink-900">Sirix</span>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 lg:hidden" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-400"
                  title="Coming in a future module"
                >
                  <Icon className="size-4.5" />
                  {item.label}
                </div>
              );
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-surface-hover'
                  )
                }
              >
                <Icon className="size-4.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 text-xs text-ink-400">Module 2 · Auth &amp; Admin</div>
      </aside>
    </>
  );
}
