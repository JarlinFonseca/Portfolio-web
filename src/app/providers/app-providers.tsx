import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import type { Lang } from '@/api/public-portfolio/schema';
import { ToastProvider } from '@/components/ui/toast';
import { getI18n } from '@/lib/i18n';
import { createQueryClient } from './query-client';

export function AppProviders({ lang, children }: { lang: Lang; children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={getI18n(lang)}>
        <ToastProvider>{children}</ToastProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
