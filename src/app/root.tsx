import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from 'react-router';
import type { Lang } from '@/api/public-portfolio/schema';
import { buttonClasses } from '@/components/ui/button';
import { NotFoundView } from '@/components/layout/not-found-view';
import { logger } from '@/lib/logger';
import '@/styles/globals.css';
import type { Route } from './+types/root';
import { AppProviders } from './providers/app-providers';

/** Idioma del documento según la URL (el admin está en español). */
export function langFromPath(pathname: string): Lang {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'es';
}

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#EFF0EC" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProviders lang={lang}>{children}</AppProviders>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return <div className="bg-dots min-h-screen" aria-busy="true" />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundView />;

  logger.error('Error no controlado en la interfaz', {
    message: error instanceof Error ? error.message : String(error),
  });
  return (
    <main className="bg-dots flex min-h-screen flex-col items-start justify-center gap-5 px-6 sm:px-16">
      <h1 className="m-0 text-[clamp(36px,5vw,64px)] font-bold tracking-[-0.03em]">{t('errors.generic')}</h1>
      <p className="m-0 max-w-[520px] text-lg text-ink-soft">{t('errors.genericText')}</p>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="max-w-full overflow-x-auto rounded-xl bg-ink p-4 text-xs text-surface">
          {error.stack}
        </pre>
      )}
      <button
        type="button"
        className={buttonClasses('primary', 'lg')}
        onClick={() => window.location.reload()}
      >
        {t('errors.reload')}
      </button>
    </main>
  );
}
