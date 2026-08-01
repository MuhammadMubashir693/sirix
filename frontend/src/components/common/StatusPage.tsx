import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StatusPageProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  className?: string;
  children?: React.ReactNode;
}

export function StatusPage({
  icon,
  eyebrow,
  title,
  description,
  actionLabel,
  actionTo,
  className,
  children,
}: StatusPageProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-surface-muted px-6 text-center',
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
        <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
        <p className="max-w-md text-sm text-ink-500">{description}</p>
      </div>
      {actionLabel && actionTo && (
        <Button asChild>
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
      {children}
    </div>
  );
}
