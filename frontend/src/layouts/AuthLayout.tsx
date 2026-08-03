import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export function AuthLayout({ children, eyebrow, title, description }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white px-8 py-10 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.65)]">
        <div className="mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            {eyebrow}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </div>

        {children}
      </div>
      <div className="sr-only">Sirix login</div>
    </div>
  );
}
