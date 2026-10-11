import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project } from '@/api/public-portfolio/schema';
import { SectionHeading } from '@/components/layout/section-heading';
import { SECTION_IDS } from '@/components/layout/site-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { countByFilter, matchesFilter, type ProjectFilterValue } from '../../utils/filter-projects';
import { ProjectCard } from './project-card';

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ProjectFilterValue>('all');
  const counts = useMemo(() => countByFilter(projects), [projects]);
  const visible = projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => matchesFilter(project.type, filter));

  return (
    <section
      id={SECTION_IDS.projects}
      aria-labelledby="projects-title"
      className="mx-auto flex max-w-[1280px] flex-col gap-9 px-4 pt-8 pb-24 sm:px-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          id="projects-title"
          size="lg"
          className="max-w-[720px]"
          kicker={t('projects.kicker')}
          before={t('projects.titleBefore')}
          highlight={t('projects.titleHighlight')}
          lead={t('projects.lead')}
        />
        <SegmentedControl
          label={t('projects.filter.label')}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('projects.filter.all'), count: counts.all },
            { value: 'private', label: t('projects.filter.private'), count: counts.private },
            { value: 'open', label: t('projects.filter.open'), count: counts.open },
          ]}
        />
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {t('projects.resultCount', { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <p className="m-0 text-ink-muted">{t('projects.empty')}</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-5 p-0">
          {visible.map(({ project, index }) => (
            <li key={project.id} className={project.featured ? 'flex min-[901px]:col-span-2' : 'flex'}>
              <ProjectCard project={project} index={index} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
