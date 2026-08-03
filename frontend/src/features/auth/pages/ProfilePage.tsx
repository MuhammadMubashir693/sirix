import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, ShieldCheck, KeyRound, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">No profile information is available right now.</p>
        </div>
        <p className="text-sm text-slate-600">Please sign in again if you believe this is an error.</p>
        <Button asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] ?? 'U'}${user.lastName?.[0] ?? 'N'}`.toUpperCase();
  const roleName = typeof user.role === 'string' ? user.role : user.role?.name || 'No role assigned';

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Your account details on Sirix.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
              {initials}
            </div>
            <div>
              <CardTitle>
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription>{roleName}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>{roleName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <UserIcon className="h-4 w-4 text-slate-400" />
            <Badge variant={user.isActive ? 'success' : 'danger'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {user.lastLoginAt && (
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Last login {new Date(user.lastLoginAt).toLocaleString()}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end border-t border-slate-200 pt-6">
          <Button asChild variant="secondary">
            <Link to="/settings/change-password">
              <KeyRound className="h-4 w-4" />
              Change password
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
