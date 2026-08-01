import { Compass } from 'lucide-react';
import { StatusPage } from '@/components/common/StatusPage';

export default function NotFoundPage() {
  return (
    <StatusPage
      icon={<Compass className="size-8" />}
      eyebrow="404"
      title="This page doesn't exist"
      description="The page you're looking for may have been moved, renamed, or never existed. Check the URL or head back to your dashboard."
      actionLabel="Back to dashboard"
      actionTo="/dashboard"
    />
  );
}
