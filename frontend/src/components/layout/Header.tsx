import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown, KeyRound, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur lg:px-6">
      <button onClick={onMenuClick} className="text-ink-500 hover:text-ink-900 lg:hidden" aria-label="Open menu">
        <Menu className="size-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-hover"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight text-ink-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-tight text-ink-500">{user?.role?.name}</p>
          </div>
          <ChevronDown className="size-4 text-ink-400" />
        </button>

        {menuOpen && (
          <>
            <button
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-[var(--radius-card)] border border-border bg-white p-1.5 shadow-[var(--shadow-elevated)]">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-ink-900">{user?.email}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-surface-hover'
                )}
              >
                <UserIcon className="size-4" />
                Profile
              </Link>
              <Link
                to="/settings/change-password"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-surface-hover"
              >
                <KeyRound className="size-4" />
                Change password
              </Link>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => logoutMutation.mutate()}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger-500 hover:bg-danger-100"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
