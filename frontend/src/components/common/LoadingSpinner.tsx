import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-10',
};

export function LoadingSpinner({ className, size = 'md', label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 text-ink-500', className)}>
      <Loader2 className={cn('animate-spin text-brand-600', sizeMap[size])} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function FullScreenLoader({ label = 'Loading Sirix…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface-muted">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}
