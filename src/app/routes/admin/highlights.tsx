import { useTranslation } from 'react-i18next';
import { AdminStatus } from '@/components/layout/admin-page';
import { useHighlights } from '@/features/highlights/api';
import { HighlightsAdmin } from '@/features/highlights/components/admin/highlights-admin';

export function meta() {
  return [{ title: 'Cifras y principios — Admin · Portfolio' }];
}

export default function AdminHighlightsRoute() {
  const { t } = useTranslation('admin');
  const highlights = useHighlights();
  if (highlights.isPending) return <AdminStatus state="loading" message={t('common.loading')} />;
  if (highlights.isError)
    return (
      <AdminStatus
        state="error"
        message={t('common.loadError')}
        retryLabel={t('common.retry')}
        onRetry={() => void highlights.refetch()}
      />
    );
  return <HighlightsAdmin initial={highlights.data} />;
}
