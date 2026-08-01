import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPlaceholderPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Welcome back, {user?.firstName}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          You're signed in as <span className="font-medium text-ink-700">{user?.role?.name}</span>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Sparkles className="size-5" />
            </div>
            <div>
              <CardTitle>Dashboard module coming next</CardTitle>
              <CardDescription>
                Revenue, traffic, and profit widgets will land here once the Dashboard module ships.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-500">
            For now, this confirms authentication, routing, and the app shell are wired up correctly. Try the
            user menu in the header to change your password or sign out.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
