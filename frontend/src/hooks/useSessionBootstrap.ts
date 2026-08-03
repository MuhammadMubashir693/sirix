import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tokenService } from '@/services/tokenService';
import { authApi } from '@/api/auth';

/**
 * On first mount, checks for a persisted access token and, if present, fetches the
 * current user to restore the session. Runs once at the app root, before routes render.
 */
export function useSessionBootstrap() {
  const setInitializing = useAuthStore((s) => s.setInitializing);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const accessToken = tokenService.getAccessToken();
      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken) {
        setInitializing(false);
        return;
      }

      try {
        if (accessToken) {
          try {
            const user = await authApi.me();
            if (!cancelled) setSession(user, { accessToken, refreshToken });
            return;
          } catch {
            // Access token may be expired; attempt refresh if a refresh token exists.
          }
        }

        const refreshed = await authApi.refresh(refreshToken);
        if (!cancelled) {
          setSession(refreshed.user, { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken });
        }
      } catch {
        if (!cancelled) clearSession();
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
