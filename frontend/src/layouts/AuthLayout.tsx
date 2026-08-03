import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export function AuthLayout({ children, eyebrow, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white px-8 py-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.2)]">
        <div className="mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
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
