import { ShieldAlert } from 'lucide-react';
import { StatusPage } from '@/components/common/StatusPage';

export default function UnauthorizedPage() {
  return (
    <StatusPage
      icon={<ShieldAlert className="size-8" />}
      eyebrow="403"
      title="You don't have access"
      description="Your role doesn't have permission to view this page. If you think this is a mistake, ask an administrator to update your role."
      actionLabel="Back to dashboard"
      actionTo="/dashboard"
    />
  );
}
