import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from '@/routes';
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import { useAuthStore } from '@/store/authStore';
import { registerSessionExpiredHandler } from '@/lib/apiClient';
import toast from 'react-hot-toast';

export default function App() {
  useSessionBootstrap();
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    // Wired once: when the API client's refresh flow fails outright (expired/revoked
    // refresh token), drop the session and let ProtectedRoute redirect to /login.
    registerSessionExpiredHandler(() => {
      clearSession();
      toast.error('Your session has expired. Please sign in again.');
    });
  }, [clearSession]);

  return (
    <>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '0.625rem',
            fontSize: '0.875rem',
            boxShadow: '0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.04)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: 'white' } },
          error: { iconTheme: { primary: '#dc2626', secondary: 'white' } },
        }}
      />
    </>
  );
}
