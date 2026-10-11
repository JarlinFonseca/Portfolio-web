import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { AdminStatus } from '@/components/layout/admin-page';
import { useProjects } from '@/features/projects/api/admin-projects';
import { ProjectForm } from '@/features/projects/components/admin/project-form';

export function meta() {
  return [{ title: 'Editar proyecto — Admin · Portfolio' }];
}

/** /admin/projects/new y /admin/projects/:id comparten el formulario. */
export default function AdminProjectEdit() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  const projects = useProjects();

  if (projects.isPending) return <AdminStatus state="loading" message={t('common.loading')} />;
  if (projects.isError) {
    return (
      <AdminStatus
        state="error"
        message={t('common.loadError')}
        retryLabel={t('common.retry')}
        onRetry={() => void projects.refetch()}
      />
    );
  }

  const project = id ? projects.data.find((p) => p.id === id) : undefined;
  if (id && !project) {
    return (
      <div className="flex flex-col items-start gap-4">
        <AdminStatus state="error" message={t('projectForm.notFound')} />
        <Link to="/admin/projects" className="font-semibold text-cobalt underline underline-offset-4">
          {t('projectForm.back')}
        </Link>
      </div>
    );
  }

  return <ProjectForm key={id ?? 'new'} {...(project ? { project } : {})} allProjects={projects.data} />;
}
