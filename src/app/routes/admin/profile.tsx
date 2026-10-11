import { useTranslation } from 'react-i18next';
import { AdminStatus } from '@/components/layout/admin-page';
import { useProfile } from '@/features/profile/api';
import { ProfileAdmin } from '@/features/profile/components/profile-admin';

export function meta() {
  return [{ title: 'Perfil, enlaces y CV — Admin · Portfolio' }];
}

export default function AdminProfileRoute() {
  const { t } = useTranslation('admin');
  const profile = useProfile();
  if (profile.isPending) return <AdminStatus state="loading" message={t('common.loading')} />;
  if (profile.isError)
    return (
      <AdminStatus
        state="error"
        message={t('common.loadError')}
        retryLabel={t('common.retry')}
        onRetry={() => void profile.refetch()}
      />
    );
  return <ProfileAdmin profile={profile.data} />;
}
