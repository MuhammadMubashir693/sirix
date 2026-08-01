import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

/**
 * Signature element: a field of animated signal bars on the brand panel, each rising and
 * falling on its own offset — a quiet nod to carrier traffic/signal strength without being
 * a literal dashboard chart. Restrained to this one panel; the form side stays plain.
 */
function SignalField() {
  const bars = Array.from({ length: 24 });
  return (
    <div className="flex h-24 items-end gap-1.5" aria-hidden="true">
      {bars.map((_, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-white/70"
          initial={{ height: 8 }}
          animate={{ height: [8, 20 + ((i * 37) % 60), 8] }}
          transition={{
            duration: 2.4 + (i % 5) * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: (i % 8) * 0.15,
          }}
        />
      ))}
    </div>
  );
}

export function AuthLayout({ children, eyebrow, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-surface-muted">
      {/* Brand panel */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <svg viewBox="0 0 32 32" className="size-5" fill="none">
              <rect x="4" y="16" width="4" height="9" rx="1" fill="white" />
              <rect x="14" y="10" width="4" height="15" rx="1" fill="white" />
              <rect x="24" y="4" width="4" height="21" rx="1" fill="white" fillOpacity="0.85" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Sirix</span>
        </div>

        <div className="space-y-8">
          <SignalField />
          <div className="max-w-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">{eyebrow}</p>
            <h1 className="font-display text-3xl font-semibold leading-tight">{title}</h1>
            <p className="text-sm leading-relaxed text-brand-100">{description}</p>
          </div>
        </div>

        <p className="text-xs text-brand-200">© {new Date().getFullYear()} Sirix. Carrier operations, unified.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-12 lg:w-[58%]">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600">
            <svg viewBox="0 0 32 32" className="size-5" fill="none">
              <rect x="4" y="16" width="4" height="9" rx="1" fill="white" />
              <rect x="14" y="10" width="4" height="15" rx="1" fill="white" />
              <rect x="24" y="4" width="4" height="21" rx="1" fill="white" fillOpacity="0.85" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold text-ink-900">Sirix</span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
