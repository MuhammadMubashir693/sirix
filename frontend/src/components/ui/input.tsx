import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 py-2 text-sm text-ink-900',
          'placeholder:text-ink-400 shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
          invalid && 'border-danger-500 focus-visible:ring-danger-500',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
