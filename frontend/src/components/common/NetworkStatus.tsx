import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatusPage } from '@/components/common/StatusPage';

export function NetworkErrorScreen({ onRetry }: { onRetry?: () => void }) {
  return (
    <StatusPage
      icon={<WifiOff className="size-8" />}
      eyebrow="Connection error"
      title="Can't reach Sirix"
      description="We couldn't connect to the server. Check your internet connection, then try again."
      className="gap-6"
    >
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </StatusPage>
  );
}

/** Slim banner that appears when the browser goes offline. */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-ink-900 py-2 text-xs font-medium text-white">
      <WifiOff className="size-3.5" />
      You're offline. Some features may not work until your connection is restored.
    </div>
  );
}
