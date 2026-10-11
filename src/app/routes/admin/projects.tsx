import { useTranslation } from 'react-i18next';
import { AdminPageHeader, AdminStatus } from '@/components/layout/admin-page';
import { RouterLinkButton } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { useProjects } from '@/features/projects/api/admin-projects';
import { ProjectsTable } from '@/features/projects/components/admin/projects-table';

export function meta() {
  return [{ title: 'Proyectos — Admin · Portfolio' }];
}

export default function AdminProjects() {
  const { t } = useTranslation('admin');
  const projects = useProjects();

  return (
    <>
      <AdminPageHeader
        breadcrumb={`${t('breadcrumb.content')} / ${t('projects.title')}`}
        title={t('projects.title')}
        {...(projects.data ? { count: projects.data.length } : {})}
        actions={
          <RouterLinkButton to="/admin/projects/new" variant="cobalt" size="lg" icon={<PlusIcon />}>
            {t('projects.new')}
          </RouterLinkButton>
        }
      />
      {projects.isPending ? (
        <AdminStatus state="loading" message={t('common.loading')} />
      ) : projects.isError ? (
        <AdminStatus
          state="error"
          message={t('common.loadError')}
          retryLabel={t('common.retry')}
          onRetry={() => void projects.refetch()}
        />
      ) : (
        <ProjectsTable projects={projects.data} />
      )}
    </>
  );
}
