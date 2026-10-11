import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminStatus } from '@/components/layout/admin-page';
import { SkipLink } from '@/components/layout/skip-link';
import { sessionQuery, useLogout, useSession } from '@/features/auth/api';
import { SESSION_EXPIRED_EVENT } from '@/lib/http/client';
import './admin-i18n';

export function meta() {
  return [{ title: 'Admin · Portfolio' }, { name: 'robots', content: 'noindex, nofollow' }];
}

/** Guard de sesión: sin sesión válida se redirige al login conservando la ruta pedida. */
export default function AdminLayout() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const session = useSession();
  const logout = useLogout();

  const target = `${location.pathname}${location.search}`;
  // Al salir (logout o sesión vencida) la navegación la decide quien sale, no el guard
  const exitingRef = useRef(false);

  useEffect(() => {
    if (session.isSuccess && !session.data && !exitingRef.current) {
      void navigate(`/admin/login?redirect=${encodeURIComponent(target)}`, { replace: true });
    }
  }, [session.isSuccess, session.data, navigate, target]);

  // 401 en cualquier llamada del admin → sesión vencida
  useEffect(() => {
    const onExpired = () => {
      exitingRef.current = true;
      queryClient.setQueryData(sessionQuery.queryKey, null);
      void navigate(`/admin/login?reason=expired&redirect=${encodeURIComponent(window.location.pathname)}`, {
        replace: true,
      });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [navigate, queryClient]);

  if (session.isError) {
    return (
      <div className="p-8">
        <AdminStatus
          state="error"
          message={t('common.loadError')}
          retryLabel={t('common.retry')}
          onRetry={() => void session.refetch()}
        />
      </div>
    );
  }

  if (!session.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper" role="status">
        <span className="font-mono text-sm text-ink-muted">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper lg:flex-row">
      <SkipLink target="admin-main" />
      <AdminSidebar
        loggingOut={logout.isPending}
        onLogout={() => {
          exitingRef.current = true;
          logout.mutate(undefined, {
            onSettled: () => void navigate('/admin/login?reason=logout', { replace: true }),
          });
        }}
      />
      <main
        id="admin-main"
        tabIndex={-1}
        className="min-w-0 flex-1 px-4 py-8 outline-none sm:px-8 lg:px-10 lg:py-10"
      >
        <div className="mx-auto flex max-w-[1180px] flex-col gap-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
