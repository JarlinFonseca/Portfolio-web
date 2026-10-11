import { useTranslation } from 'react-i18next';
import { AdminStatus } from '@/components/layout/admin-page';
import { useStack } from '@/features/stack/api';
import { StackAdmin } from '@/features/stack/components/admin/stack-admin';

export function meta() {
  return [{ title: 'Stack — Admin · Portfolio' }];
}

export default function AdminStackRoute() {
  const { t } = useTranslation('admin');
  const stack = useStack();
  if (stack.isPending) return <AdminStatus state="loading" message={t('common.loading')} />;
  if (stack.isError)
    return (
      <AdminStatus
        state="error"
        message={t('common.loadError')}
        retryLabel={t('common.retry')}
        onRetry={() => void stack.refetch()}
      />
    );
  return <StackAdmin initial={stack.data} />;
}
