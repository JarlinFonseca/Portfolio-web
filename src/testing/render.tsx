import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import type { Lang } from '@/api/public-portfolio/schema';
import { ToastProvider } from '@/components/ui/toast';
import { addNamespace, getI18n } from '@/lib/i18n';
import adminEs from '@/i18n/locales/admin.es.json';

/** Renderiza con QueryClient, i18n y router en memoria. */
export function renderWithProviders(
  ui: ReactElement,
  {
    lang = 'es',
    route = '/',
    ...options
  }: { lang?: Lang; route?: string } & Omit<RenderOptions, 'wrapper'> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  addNamespace('es', 'admin', adminEs);
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [route] });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={getI18n(lang)}>
        <ToastProvider>{children}</ToastProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
  return {
    ...render(<RouterProvider router={router} />, { wrapper: Wrapper, ...options }),
    router,
    queryClient,
  };
}
